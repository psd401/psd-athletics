// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listGames, listTeams } from "../data/queries";
import { ValidationError } from "../studio/errors";
import { parseContact } from "./contact";
import { confirmFollow, startFollow, stopFollow, stopToken } from "./follow";
import { deliverOutbox, queueFinal, queueGameChange } from "./outbox";
import { memorySender } from "./sender";

let db: Db;
let soccer: string;
let football: string;
let capital: string;
const at = (iso: string) => new Date(iso);
beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  const teams = await listTeams(db, { schoolId: "ghhs" });
  soccer = teams.find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!.id;
  football = teams.find((t) => t.sportSlug === "football" && t.level === "varsity")!.id;
  capital = (await listGames(db, { schoolId: "ghhs" })).find((g) => g.teamId === soccer && g.opponent === "Capital")!.id;
}, 30_000);

describe("parseContact", () => {
  it.each([
    ["Parent@Example.COM ", { kind: "email", value: "parent@example.com" }],
    ["(253) 555-0123", { kind: "sms", value: "+12535550123" }],
    ["253.555.0123", { kind: "sms", value: "+12535550123" }],
    ["+1 253 555 0123", { kind: "sms", value: "+12535550123" }],
  ])("reads %s", (input, expected) => {
    expect(parseContact(input)).toEqual(expected);
  });

  it.each(["", "555-0123", "not an email", "a@b", "+44 20 7946 0958", "x@example.com\nBcc: y@example.com"])("refuses %j", (input) => {
    expect(() => parseContact(input)).toThrow(ValidationError);
  });
});

describe("following a team", () => {
  let email: ReturnType<typeof memorySender>;
  let sms: ReturnType<typeof memorySender>;
  beforeEach(() => {
    email = memorySender();
    sms = memorySender();
  });

  it("sends a code, and only a confirmed follower gets alerts", async () => {
    const now = at("2026-10-08T17:00:00Z");
    const { followerId, code } = await startFollow(db, { email, sms }, { contact: "fan@example.com", teamIds: [soccer], wantsChanges: true, wantsFinals: true }, now);
    expect(email.sent).toHaveLength(1);
    expect(email.sent[0]!.to).toBe("fan@example.com");
    expect(email.sent[0]!.body).toContain(code);
    expect(code).toMatch(/^\d{6}$/);

    // Unconfirmed: nothing queued.
    expect(await queueFinal(db, capital, now)).toBe(0);

    await expect(confirmFollow(db, { followerId, code: "000000" }, now)).rejects.toThrow(new ValidationError("That code doesn't match. Check the latest message we sent."));
    await confirmFollow(db, { followerId, code }, now);
    const [f] = await db.select().from(s.follower).where(eq(s.follower.id, followerId));
    expect(f).toMatchObject({ contactKind: "email", contactValue: "fan@example.com", wantsFinals: true });
    expect(f!.verifiedAt).not.toBeNull();
  });

  it("adds teams for an existing contact instead of replacing them, and won't resend a code within two minutes", async () => {
    const now = at("2026-10-08T17:10:00Z");
    const first = await startFollow(db, { email, sms }, { contact: "two@example.com", teamIds: [soccer], wantsChanges: true, wantsFinals: false }, now);
    await expect(
      startFollow(db, { email, sms }, { contact: "two@example.com", teamIds: [football], wantsChanges: true, wantsFinals: false }, at("2026-10-08T17:11:00Z")),
    ).rejects.toThrow(new ValidationError("We just sent a code. Check your messages, or try again in two minutes."));
    const second = await startFollow(db, { email, sms }, { contact: "two@example.com", teamIds: [football], wantsChanges: true, wantsFinals: false }, at("2026-10-08T17:13:00Z"));
    expect(second.followerId).toBe(first.followerId);
    const teams = await db.select().from(s.followerTeam).where(eq(s.followerTeam.followerId, first.followerId));
    expect(teams.map((t) => t.teamId).sort()).toEqual([soccer, football].sort());
  });

  it("locks a code after five wrong tries, and codes expire after 30 minutes", async () => {
    const now = at("2026-10-08T18:00:00Z");
    const { followerId, code } = await startFollow(db, { email, sms }, { contact: "guess@example.com", teamIds: [soccer], wantsChanges: true, wantsFinals: false }, now);
    for (let i = 0; i < 5; i++) await expect(confirmFollow(db, { followerId, code: "111111" }, now)).rejects.toThrow(ValidationError);
    await expect(confirmFollow(db, { followerId, code }, now)).rejects.toThrow(new ValidationError("That code has expired. Sign up again for a new one."));

    const late = await startFollow(db, { email, sms }, { contact: "late@example.com", teamIds: [soccer], wantsChanges: true, wantsFinals: false }, now);
    await expect(confirmFollow(db, { followerId: late.followerId, code: late.code }, at("2026-10-08T18:31:00Z"))).rejects.toThrow(
      new ValidationError("That code has expired. Sign up again for a new one."),
    );
  });

  it("refuses text sign-ups when no text provider is set up", async () => {
    await expect(
      startFollow(db, { email, sms: null }, { contact: "253-555-0123", teamIds: [soccer], wantsChanges: true, wantsFinals: false }, at("2026-10-08T19:00:00Z")),
    ).rejects.toThrow(new ValidationError("Text alerts aren't available yet. Use an email address for now."));
    await expect(
      startFollow(db, { email, sms }, { contact: "x@example.com", teamIds: [], wantsChanges: true, wantsFinals: false }, at("2026-10-08T19:00:00Z")),
    ).rejects.toThrow(new ValidationError("Pick a team to follow."));
    await expect(
      startFollow(db, { email, sms }, { contact: "x@example.com", teamIds: [soccer], wantsChanges: false, wantsFinals: false }, at("2026-10-08T19:00:00Z")),
    ).rejects.toThrow(new ValidationError("Choose schedule changes, final scores, or both."));
  });

  it("stops with a signed link, and stopped followers get nothing", async () => {
    const now = at("2026-10-08T20:00:00Z");
    const { followerId, code } = await startFollow(db, { email, sms }, { contact: "stop@example.com", teamIds: [football], wantsChanges: true, wantsFinals: true }, now);
    await confirmFollow(db, { followerId, code }, now);
    expect(await stopFollow(db, followerId, "not-the-token", now)).toBe(false);
    expect(await stopFollow(db, followerId, stopToken(followerId), now)).toBe(true);
    const [f] = await db.select().from(s.follower).where(eq(s.follower.id, followerId));
    expect(f!.stoppedAt).not.toBeNull();
  });
});

describe("the outbox", () => {
  let email: ReturnType<typeof memorySender>;
  let followerId: string;
  beforeAll(async () => {
    email = memorySender();
    const now = at("2026-10-07T17:00:00Z");
    const started = await startFollow(db, { email, sms: memorySender() }, { contact: "outbox@example.com", teamIds: [soccer], wantsChanges: true, wantsFinals: true }, now);
    await confirmFollow(db, { followerId: started.followerId, code: started.code }, now);
    followerId = started.followerId;
  });

  it("queues one message per change per follower, with a link to the game", async () => {
    const now = at("2026-10-07T17:05:00Z");
    const change = { what: "moved to Thu, Oct 8 at 7:30 PM" };
    const n = await queueGameChange(db, capital, change, now);
    expect(n).toBeGreaterThanOrEqual(1);
    expect(await queueGameChange(db, capital, change, now)).toBe(0);
    const [msg] = await db.select().from(s.alertMessage).where(eq(s.alertMessage.followerId, followerId));
    expect(msg).toMatchObject({ kind: "change", channel: "email", status: "queued", gameId: capital });
    expect(msg!.body).toBe(`Gig Harbor Girls Soccer @ Capital moved to Thu, Oct 8 at 7:30 PM. Details: https://athletics.psd401.net/ghh/game/${capital}`);
  });

  it("waits through quiet hours, except for a same-day game", async () => {
    // 11 pm Pacific on Oct 7: the Capital game was Oct 6, so not same-day; it waits.
    expect(await deliverOutbox(db, { email: memorySender(), sms: null }, at("2026-10-08T06:00:00Z"))).toEqual({ sent: 0, failed: 0, waiting: expect.any(Number) });
    // 7:30 am Pacific: it goes, with a stop link.
    const morning = memorySender();
    const result = await deliverOutbox(db, { email: morning, sms: null }, at("2026-10-08T14:30:00Z"));
    expect(result.sent).toBeGreaterThanOrEqual(1);
    const mine = morning.sent.find((m) => m.to === "outbox@example.com")!;
    expect(mine.body).toContain(`https://athletics.psd401.net/alerts/stop?f=${followerId}&t=${stopToken(followerId)}`);
    const [msg] = await db.select().from(s.alertMessage).where(eq(s.alertMessage.followerId, followerId));
    expect(msg).toMatchObject({ status: "sent", providerId: expect.stringMatching(/^memory-/) });
  });

  it("sends a same-day game's change even during quiet hours", async () => {
    const tonight = (await listGames(db, { schoolId: "ghhs" })).find((g) => g.teamId === soccer && g.startDate === "2026-10-08")!;
    await queueGameChange(db, tonight.id, { what: "moved to 8:00 PM" }, at("2026-10-09T04:30:00Z"));
    const late = memorySender();
    // 10 pm Pacific on Oct 8, the game's day.
    await deliverOutbox(db, { email: late, sms: null }, at("2026-10-09T05:00:00Z"));
    expect(late.sent.some((m) => m.to === "outbox@example.com" && m.body.includes("moved to 8:00 PM"))).toBe(true);
  });

  it("queues finals for followers who asked, from the recorded score only", async () => {
    const now = at("2026-10-08T18:00:00Z");
    await queueFinal(db, capital, now);
    const finals = (await db.select().from(s.alertMessage).where(eq(s.alertMessage.followerId, followerId))).filter((m) => m.kind === "final");
    expect(finals.map((m) => m.body)).toEqual([`Final: Gig Harbor 2, Capital 0 (Girls Soccer). Details: https://athletics.psd401.net/ghh/game/${capital}`]);
    const noScore = (await listGames(db, { schoolId: "ghhs" })).find((g) => g.teamId === soccer && g.scoreUs === null)!;
    expect(await queueFinal(db, noScore.id, now)).toBe(0);
  });

  it("marks a message failed when the provider refuses it", async () => {
    const failing = memorySender({ fail: true });
    await queueGameChange(db, capital, { what: "is cancelled" }, at("2026-10-08T18:00:00Z"));
    const result = await deliverOutbox(db, { email: failing, sms: null }, at("2026-10-08T18:00:00Z"));
    expect(result.failed).toBeGreaterThanOrEqual(1);
  });
});
