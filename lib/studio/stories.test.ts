// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { undoChange } from "../audit";
import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listGames, listTeams } from "../data/queries";
import type { Actor } from "../permissions";
import { PermissionError, ValidationError } from "./errors";
import { createStory, factsFromGame, listPublishedStories, publishStory, slugify, unpublishStory, updateStory } from "./stories";

let db: Db;
let soccer: string;
let football: string;
const now = new Date("2026-10-09T18:00:00Z");
let coach: Actor;
let assistant: Actor;

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  const teams = await listTeams(db, { schoolId: "ghhs" });
  soccer = teams.find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!.id;
  football = teams.find((t) => t.sportSlug === "football" && t.level === "varsity")!.id;
  await db.insert(s.person).values([
    { id: "coach", name: "Coach", email: "coach@psd401.net", emailVerified: true },
    { id: "asst", name: "Assistant", email: "asst@psd401.net", emailVerified: true },
  ]);
  coach = { personId: "coach", grants: [{ role: "head_coach", schoolId: "ghhs", teamId: soccer }], assistantsMayPublish: new Set() };
  assistant = { personId: "asst", grants: [{ role: "assistant_coach", schoolId: "ghhs", teamId: soccer }], assistantsMayPublish: new Set() };
}, 30_000);

const as = (actor: Actor) => ({ db, actor, now });

describe("slugify", () => {
  it("makes short, readable URLs", () => {
    expect(slugify("Tides blank Capital, 2–0!")).toBe("tides-blank-capital-2-0");
    expect(slugify("   ")).toBe("story");
    expect(slugify("x".repeat(100))).toHaveLength(60);
  });
});

describe("stories", () => {
  it("drafts are private until published, and publishing is logged", async () => {
    const draft = await createStory(as(coach), { teamId: soccer, title: "Tides blank Capital", summary: "Third straight shutout.", body: "First paragraph.\n\nSecond." });
    expect(draft).toMatchObject({ status: "draft", schoolId: "ghhs", slug: "tides-blank-capital", publishedAt: null, draftedByAgent: false });
    expect(await listPublishedStories(db, { schoolId: "ghhs" })).toEqual([]);

    const live = await publishStory(as(coach), draft.id);
    expect(live.status).toBe("published");
    expect((await listPublishedStories(db, { schoolId: "ghhs" })).map((x) => x.title)).toEqual(["Tides blank Capital"]);
    const log = await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, draft.id));
    expect(log.map((l) => l.verb).sort()).toEqual(["create", "publish"]);
  });

  it("gives each story at a school its own slug", async () => {
    const a = await createStory(as(coach), { teamId: soccer, title: "Same title", body: "a" });
    const b = await createStory(as(coach), { teamId: soccer, title: "Same title", body: "b" });
    expect([a.slug, b.slug]).toEqual(["same-title", "same-title-2"]);
  });

  it("lets assistants draft but not publish, unless the head coach allows it", async () => {
    const draft = await createStory(as(assistant), { teamId: soccer, title: "Assistant draft", body: "x" });
    await expect(publishStory(as(assistant), draft.id)).rejects.toThrow(PermissionError);
    const allowed = { ...assistant, assistantsMayPublish: new Set([soccer]) };
    expect((await publishStory(as(allowed), draft.id)).status).toBe("published");
  });

  it("refuses other teams and empty stories", async () => {
    await expect(createStory(as(coach), { teamId: football, title: "Not mine", body: "x" })).rejects.toThrow(PermissionError);
    await expect(createStory(as(coach), { teamId: soccer, title: " ", body: "x" })).rejects.toThrow(ValidationError);
    await expect(createStory(as(coach), { teamId: soccer, title: "Ok", body: "" })).rejects.toThrow("The story can't be empty.");
  });

  it("edits and unpublishes, and both can be undone", async () => {
    const draft = await createStory(as(coach), { teamId: soccer, title: "Before", body: "x" });
    await publishStory(as(coach), draft.id);
    await updateStory(as(coach), draft.id, { title: "After", summary: "", body: "y" });
    const unpublished = await unpublishStory(as(coach), draft.id);
    expect(unpublished).toMatchObject({ status: "draft", publishedAt: null, title: "After" });
    const unpublish = (await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, draft.id))).find((l) => l.verb === "unpublish")!;
    expect(await undoChange(db, { auditId: unpublish.id, actor: coach, now })).toEqual({ ok: true });
    const [row] = await db.select().from(s.story).where(eq(s.story.id, draft.id));
    expect(row?.status).toBe("published");
  });

  it("attaches a game from the same team only", async () => {
    const [game] = await listGames(db, { schoolId: "ghhs" }).then((g) => g.filter((x) => x.teamId === soccer));
    const [otherGame] = await listGames(db, { schoolId: "ghhs" }).then((g) => g.filter((x) => x.teamId === football));
    const story = await createStory(as(coach), { teamId: soccer, gameId: game!.id, title: "Recap", body: "x" });
    expect(story.gameId).toBe(game!.id);
    await expect(createStory(as(coach), { teamId: soccer, gameId: otherGame!.id, title: "Recap", body: "x" })).rejects.toThrow("Pick one of this team's games, or none.");
  });
});

describe("factsFromGame", () => {
  it("states the final in plain words and names no athletes", async () => {
    const games = await listGames(db, { schoolId: "ghhs" });
    const capital = games.find((g) => g.teamId === soccer && g.opponent === "Capital")!;
    expect(factsFromGame(capital)).toEqual({
      title: "Tides beat Capital 2–0",
      body: "Gig Harbor beat Capital 2–0 on the road on Tuesday, October 6.",
    });
    const upcoming = games.find((g) => g.teamId === soccer && g.status === "scheduled")!;
    expect(factsFromGame(upcoming)).toBeNull();
  });
});
