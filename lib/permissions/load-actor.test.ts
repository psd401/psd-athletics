// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listTeams } from "../data/queries";
import { can, loadActor } from "./index";

let db: Db;
let football: { id: string; schoolId: string };

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  const teams = await listTeams(db, { schoolId: "ghhs" });
  football = teams.find((t) => t.sportSlug === "football" && t.level === "varsity")!;
  await db.insert(s.person).values([
    { id: "head", name: "Head Coach", email: "head@psd401.net", emailVerified: true },
    { id: "asst", name: "Assistant", email: "asst@psd401.net", emailVerified: true },
    { id: "former", name: "Former", email: "former@psd401.net", emailVerified: true },
  ]);
  await db.insert(s.roleAssignment).values([
    { personId: "head", role: "head_coach", teamId: football.id, startsOn: "2026-08-01", source: "test" },
    { personId: "asst", role: "assistant_coach", teamId: football.id, startsOn: "2026-08-01", source: "test" },
    { personId: "former", role: "head_coach", teamId: football.id, startsOn: "2025-08-01", endsOn: "2026-06-30", source: "test" },
  ]);
}, 30_000);

describe("loadActor", () => {
  it("fills the school from the team and grants the head coach their team", async () => {
    const head = await loadActor(db, "head", "2026-10-09");
    expect(head.grants).toEqual([{ role: "head_coach", schoolId: "ghhs", teamId: football.id }]);
    expect(can(head, "story.publish", { schoolId: "ghhs", teamId: football.id })).toBe(true);
  });

  it("drops assignments that have ended: access ends when the assignment ends", async () => {
    const former = await loadActor(db, "former", "2026-10-09");
    expect(former.grants).toEqual([]);
    expect(can(former, "story.draft", { schoolId: "ghhs", teamId: football.id })).toBe(false);
  });

  it("lets an assistant publish only after the head coach's rule allows it", async () => {
    const before = await loadActor(db, "asst", "2026-10-09");
    expect(can(before, "story.publish", { schoolId: "ghhs", teamId: football.id })).toBe(false);
    await db.insert(s.rule).values({ kind: "publish", teamId: football.id, settings: { assistantsMayPublish: true }, updatedBy: "head" });
    const after = await loadActor(db, "asst", "2026-10-09");
    expect(can(after, "story.publish", { schoolId: "ghhs", teamId: football.id })).toBe(true);
  });

  it("carries the agent connection without changing the grants", async () => {
    const asAgent = await loadActor(db, "head", "2026-10-09", "conn-1");
    const asPerson = await loadActor(db, "head", "2026-10-09");
    expect(asAgent.agentConnectionId).toBe("conn-1");
    expect(asAgent.grants).toEqual(asPerson.grants);
  });
});
