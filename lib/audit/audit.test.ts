// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listTeams } from "../data/queries";
import type { Actor } from "../permissions";
import { recordChange, undoChange } from "./index";

let db: Db;
let teamId: string;
const t0 = new Date("2026-10-09T18:00:00Z");
const minutes = (n: number) => new Date(t0.getTime() + n * 60_000);

const coach = (): Actor => ({ personId: "coach", grants: [{ role: "head_coach", schoolId: "ghhs", teamId }], assistantsMayPublish: new Set() });
const otherCoach = (): Actor => ({ personId: "other", grants: [{ role: "head_coach", schoolId: "ghhs", teamId: "elsewhere" }], assistantsMayPublish: new Set() });
const ad: Actor = { personId: "ad", grants: [{ role: "school_ad", schoolId: "ghhs", teamId: null }], assistantsMayPublish: new Set() };

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  teamId = (await listTeams(db, { schoolId: "ghhs" }))[0]!.id;
  await db.insert(s.person).values([
    { id: "coach", name: "Coach", email: "coach@psd401.net", emailVerified: true },
    { id: "other", name: "Other", email: "other@psd401.net", emailVerified: true },
    { id: "ad", name: "AD", email: "ad@psd401.net", emailVerified: true },
  ]);
}, 30_000);

async function newNote(body: string) {
  const [row] = await db.insert(s.coachNote).values({ teamId, authorId: "coach", body }).returning();
  return row!;
}

describe("recordChange", () => {
  it("writes who, what, before, after and a 30-minute undo window", async () => {
    const note = await newNote("Bus at 4");
    const entry = await recordChange(db, {
      actor: coach(),
      verb: "create",
      objectType: "coach_note",
      objectId: note.id,
      scope: { schoolId: "ghhs", teamId },
      before: null,
      after: note,
      now: t0,
    });
    expect(entry).toMatchObject({ actorPersonId: "coach", verb: "create", objectType: "coach_note", schoolId: "ghhs", teamId, agentConnectionId: null });
    expect(entry.undoUntil?.toISOString()).toBe(minutes(30).toISOString());
  });

  it("records the agent connection when an agent acted", async () => {
    const note = await newNote("Agent note");
    const [conn] = await db
      .insert(s.agentConnection)
      .values({ personId: "coach", clientName: "Test client", expiresAt: minutes(60) })
      .returning();
    const entry = await recordChange(db, {
      actor: { ...coach(), agentConnectionId: conn!.id },
      verb: "create",
      objectType: "coach_note",
      objectId: note.id,
      scope: { schoolId: "ghhs", teamId },
      before: null,
      after: note,
      now: t0,
    });
    expect(entry.agentConnectionId).toBe(conn!.id);
  });
});

describe("undoChange", () => {
  it("restores the earlier version of an edit", async () => {
    const note = await newNote("Bus at 4");
    const [edited] = await db.update(s.coachNote).set({ body: "Bus at 5" }).where(eq(s.coachNote.id, note.id)).returning();
    const entry = await recordChange(db, { actor: coach(), verb: "update", objectType: "coach_note", objectId: note.id, scope: { schoolId: "ghhs", teamId }, before: note, after: edited!, now: t0 });

    expect(await undoChange(db, { auditId: entry.id, actor: coach(), now: minutes(10) })).toEqual({ ok: true });
    const [row] = await db.select().from(s.coachNote).where(eq(s.coachNote.id, note.id));
    expect(row?.body).toBe("Bus at 4");
    const [log] = await db.select().from(s.auditLog).where(eq(s.auditLog.id, entry.id));
    expect(log?.undoneBy).toBe("coach");
  });

  it("removes something that was created, and puts back something that was deleted", async () => {
    const created = await newNote("Created");
    const c = await recordChange(db, { actor: coach(), verb: "create", objectType: "coach_note", objectId: created.id, scope: { schoolId: "ghhs", teamId }, before: null, after: created, now: t0 });
    expect(await undoChange(db, { auditId: c.id, actor: coach(), now: minutes(1) })).toEqual({ ok: true });
    expect(await db.select().from(s.coachNote).where(eq(s.coachNote.id, created.id))).toEqual([]);

    const doomed = await newNote("Deleted");
    await db.delete(s.coachNote).where(eq(s.coachNote.id, doomed.id));
    const d = await recordChange(db, { actor: coach(), verb: "delete", objectType: "coach_note", objectId: doomed.id, scope: { schoolId: "ghhs", teamId }, before: doomed, after: null, now: t0 });
    expect(await undoChange(db, { auditId: d.id, actor: coach(), now: minutes(1) })).toEqual({ ok: true });
    const [back] = await db.select().from(s.coachNote).where(eq(s.coachNote.id, doomed.id));
    expect(back?.body).toBe("Deleted");
    expect(back?.createdAt.toISOString()).toBe(doomed.createdAt.toISOString());
  });

  it("refuses after the window, twice, or for someone without the right", async () => {
    const note = await newNote("x");
    const entry = await recordChange(db, { actor: coach(), verb: "create", objectType: "coach_note", objectId: note.id, scope: { schoolId: "ghhs", teamId }, before: null, after: note, now: t0 });
    expect(await undoChange(db, { auditId: entry.id, actor: coach(), now: minutes(31) })).toEqual({ ok: false, reason: "The undo window has closed." });
    expect(await undoChange(db, { auditId: entry.id, actor: otherCoach(), now: minutes(5) })).toEqual({ ok: false, reason: "You can't undo this change." });
    // The school AD can undo a coach's change at their school.
    expect(await undoChange(db, { auditId: entry.id, actor: ad, now: minutes(5) })).toEqual({ ok: true });
    expect(await undoChange(db, { auditId: entry.id, actor: ad, now: minutes(6) })).toEqual({ ok: false, reason: "This change was already undone." });
  });

  it("logs the undo itself", async () => {
    const note = await newNote("logged");
    const entry = await recordChange(db, { actor: coach(), verb: "create", objectType: "coach_note", objectId: note.id, scope: { schoolId: "ghhs", teamId }, before: null, after: note, now: t0 });
    await undoChange(db, { auditId: entry.id, actor: coach(), now: minutes(2) });
    const rows = await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, note.id));
    expect(rows.map((r) => r.verb).sort()).toEqual(["create", "undo"]);
  });
});
