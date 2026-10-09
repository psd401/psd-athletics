// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { recordChange } from "../audit";
import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listTeams } from "../data/queries";
import type { Actor } from "../permissions";
import { describeChange, listActivity, summarize } from "./activity";

let db: Db;
const t0 = new Date("2026-10-09T18:00:00Z");
let coach: Actor;
let other: Actor;
const ad: Actor = { personId: "a", grants: [{ role: "school_ad", schoolId: "ghhs", teamId: null }], assistantsMayPublish: new Set() };

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  const [t, u] = await listTeams(db, { schoolId: "ghhs" });
  coach = { personId: "c", grants: [{ role: "head_coach", schoolId: "ghhs", teamId: t!.id }], assistantsMayPublish: new Set() };
  other = { personId: "o", grants: [{ role: "head_coach", schoolId: "ghhs", teamId: u!.id }], assistantsMayPublish: new Set() };
  await db.insert(s.person).values([
    { id: "c", name: "Coach C", email: "c@psd401.net", emailVerified: true },
    { id: "o", name: "Coach O", email: "o@psd401.net", emailVerified: true },
    { id: "a", name: "AD A", email: "a@psd401.net", emailVerified: true },
  ]);
  for (const [actor, id] of [
    [coach, "x1"],
    [other, "x2"],
  ] as const) {
    await recordChange(db, { actor, verb: "update", objectType: "story", objectId: id, scope: { schoolId: "ghhs", teamId: actor.grants[0]!.teamId }, before: {}, after: {}, now: t0 });
  }
}, 30_000);

describe("listActivity", () => {
  it("shows a coach only their own changes, with undo while the window is open", async () => {
    const items = await listActivity(db, coach, ["ghhs", "phs"], new Date(t0.getTime() + 60_000));
    expect(items.map((i) => [i.objectId, i.actorName, i.canUndo])).toEqual([["x1", "Coach C", true]]);
  });

  it("shows the school AD everything at the school, and closes undo after 30 minutes", async () => {
    const soon = await listActivity(db, ad, ["ghhs", "phs"], new Date(t0.getTime() + 60_000));
    expect(soon.map((i) => i.objectId).sort()).toEqual(["x1", "x2"]);
    expect(soon.every((i) => i.canUndo)).toBe(true);
    const late = await listActivity(db, ad, ["ghhs", "phs"], new Date(t0.getTime() + 31 * 60_000));
    expect(late.every((i) => !i.canUndo)).toBe(true);
  });
});

describe("summarize", () => {
  it("picks a title, name or note and keeps it short", () => {
    expect(summarize({ title: "Tides sweep Silas", body: "…" })).toBe("Tides sweep Silas");
    expect(summarize({ displayName: "Alex R." })).toBe("Alex R.");
    expect(summarize({ body: "x".repeat(80) })).toBe(`${"x".repeat(57)}…`);
    expect(summarize(null)).toBeNull();
    expect(summarize({ id: "1" })).toBeNull();
  });
});

describe("describeChange", () => {
  it("reads like a sentence", () => {
    expect(describeChange("publish", "story")).toBe("published a story");
    expect(describeChange("undo", "coach_note")).toBe("undid a change to a coach's note");
    expect(describeChange("assign", "role_assignment")).toBe("gave someone a role");
    expect(describeChange("end", "role_assignment")).toBe("ended a role");
    expect(describeChange("remove", "role_assignment")).toBe("removed a role");
  });
});

describe("role changes in the log", () => {
  it("say whose role and which one", async () => {
    const at = new Date("2026-10-09T19:00:00Z");
    await recordChange(db, {
      actor: ad,
      verb: "assign",
      objectType: "role_assignment",
      objectId: "r1",
      scope: { schoolId: "ghhs", teamId: null },
      before: null,
      after: { id: "r1", personId: "o", role: "assistant_coach", schoolId: null, teamId: null, startsOn: "2026-10-09", endsOn: null, source: "manual" },
      now: at,
    });
    const [item] = await listActivity(db, ad, ["ghhs"], at, 1);
    expect(item).toMatchObject({ objectId: "r1", summary: "Coach O · Assistant coach" });
  });
});
