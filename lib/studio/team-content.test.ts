// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { undoChange } from "../audit";
import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { getTeamContent, listTeams } from "../data/queries";
import type { Actor } from "../permissions";
import { PermissionError, ValidationError } from "./errors";
import { ROSTER_NAME, addDocument, addRosterEntry, addSponsor, postCoachNote, publishRoster, removeRosterEntry } from "./team-content";

let db: Db;
let soccer: string;
let football: string;
const now = new Date("2026-10-09T18:00:00Z");
let coach: Actor;
let photographer: Actor;

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  const teams = await listTeams(db, { schoolId: "ghhs" });
  soccer = teams.find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!.id;
  football = teams.find((t) => t.sportSlug === "football" && t.level === "varsity")!.id;
  await db.insert(s.person).values([
    { id: "coach", name: "Coach", email: "coach@psd401.net", emailVerified: true },
    { id: "photo", name: "Photographer", email: "photo@psd401.net", emailVerified: true },
  ]);
  coach = { personId: "coach", grants: [{ role: "head_coach", schoolId: "ghhs", teamId: soccer }], assistantsMayPublish: new Set() };
  photographer = { personId: "photo", grants: [{ role: "photographer", schoolId: "ghhs", teamId: soccer }], assistantsMayPublish: new Set() };
}, 30_000);

const ctx = () => ({ db, actor: coach, now });

describe("roster names", () => {
  it.each(["Alex R.", "Mary Kate O.", "José Á.", "D'Andre W.", "Ana-Lucía P."])("accepts %s", (name) => {
    expect(ROSTER_NAME.test(name)).toBe(true);
  });
  it.each(["Alex Rivera", "Alex", "alex r", "Alex R", "A. Rivera", "Alex R. Jr"])("refuses %s", (name) => {
    expect(ROSTER_NAME.test(name)).toBe(false);
  });
});

describe("roster", () => {
  it("adds entries as drafts, publishes them, and only then shows them publicly", async () => {
    await addRosterEntry(ctx(), soccer, { displayName: "Alex R.", jerseyNumber: "9", position: "Forward", grade: 12 });
    expect((await getTeamContent(db, soccer)).roster).toEqual([]);
    expect(await publishRoster(ctx(), soccer)).toBe(1);
    expect((await getTeamContent(db, soccer)).roster.map((r) => r.displayName)).toEqual(["Alex R."]);
    expect(await publishRoster(ctx(), soccer)).toBe(0);
  });

  it("refuses full names, bad jersey numbers and grades", async () => {
    await expect(addRosterEntry(ctx(), soccer, { displayName: "Alex Rivera" })).rejects.toThrow(new ValidationError("Use first name and last initial, like Alex R."));
    await expect(addRosterEntry(ctx(), soccer, { displayName: "Sam K.", jerseyNumber: "12a" })).rejects.toThrow(/Jersey numbers/);
    await expect(addRosterEntry(ctx(), soccer, { displayName: "Sam K.", grade: 7 })).rejects.toThrow(/Grade is 9, 10, 11 or 12/);
  });

  it("can be undone: a removed entry comes back", async () => {
    const entry = await addRosterEntry(ctx(), soccer, { displayName: "Jo B." });
    await removeRosterEntry(ctx(), entry.id);
    const [log] = await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, entry.id)).orderBy(s.auditLog.createdAt);
    const removal = (await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, entry.id))).find((r) => r.verb === "delete")!;
    expect(log).toBeDefined();
    expect(await undoChange(db, { auditId: removal.id, actor: coach, now })).toEqual({ ok: true });
    const [back] = await db.select().from(s.rosterEntry).where(eq(s.rosterEntry.id, entry.id));
    expect(back?.displayName).toBe("Jo B.");
  });
});

describe("permissions", () => {
  it("stops a coach editing another team", async () => {
    await expect(postCoachNote(ctx(), football, "Hi")).rejects.toThrow(PermissionError);
    await expect(addRosterEntry(ctx(), football, { displayName: "Alex R." })).rejects.toThrow(/You can't edit the roster for this team/);
  });

  it("keeps photographers away from the roster and the page", async () => {
    const asPhotographer = { db, actor: photographer, now };
    await expect(addRosterEntry(asPhotographer, soccer, { displayName: "Alex R." })).rejects.toThrow(PermissionError);
    await expect(postCoachNote(asPhotographer, soccer, "Hi")).rejects.toThrow(PermissionError);
  });
});

describe("coach's note, documents and partners", () => {
  it("publishes a note and records who did it", async () => {
    const note = await postCoachNote(ctx(), soccer, "  Bus leaves at 4:15.  ");
    expect(note.body).toBe("Bus leaves at 4:15.");
    expect((await getTeamContent(db, soccer)).coachNote?.body).toBe("Bus leaves at 4:15.");
    const [log] = await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, note.id));
    expect(log).toMatchObject({ actorPersonId: "coach", verb: "publish", objectType: "coach_note", teamId: soccer, schoolId: "ghhs" });
  });

  it("accepts https links only", async () => {
    await expect(addDocument(ctx(), soccer, { title: "Practice schedule", kind: "PDF", url: "http://example.org/a.pdf" })).rejects.toThrow(/https/);
    await expect(addSponsor(ctx(), soccer, { name: "Local shop", url: "javascript:alert(1)" })).rejects.toThrow(/https/);
    const doc = await addDocument(ctx(), soccer, { title: "Practice schedule", kind: "PDF", url: "https://example.org/a.pdf" });
    expect(doc.url).toBe("https://example.org/a.pdf");
    await addSponsor(ctx(), soccer, { name: "Local shop" });
    const content = await getTeamContent(db, soccer);
    expect(content.documents.map((d) => d.title)).toEqual(["Practice schedule"]);
    expect(content.sponsors.map((x) => x.name)).toEqual(["Local shop"]);
  });

  it("refuses an empty note", async () => {
    await expect(postCoachNote(ctx(), soccer, "   ")).rejects.toThrow("The note can't be empty.");
  });
});
