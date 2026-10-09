// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createMemoryDb } from "../db/client";
import { seedFromFixtures } from "../db/seed";
import { loadActor, can } from "../permissions";
import { listTeams } from "../data/queries";
import { devSignInEnabled, seedDevPeople } from "./dev";

describe("devSignInEnabled", () => {
  it("is on only with the flag, no database URL and a localhost auth URL", () => {
    expect(devSignInEnabled({ ATHLETICS_DEV_SIGN_IN: "1", BETTER_AUTH_URL: "http://localhost:3210" })).toBe(true);
    expect(devSignInEnabled({ ATHLETICS_DEV_SIGN_IN: "1" })).toBe(true);
    expect(devSignInEnabled({})).toBe(false);
    expect(devSignInEnabled({ ATHLETICS_DEV_SIGN_IN: "1", DATABASE_URL: "postgres://db" })).toBe(false);
    expect(devSignInEnabled({ ATHLETICS_DEV_SIGN_IN: "1", BETTER_AUTH_URL: "https://athletics.psd401.net" })).toBe(false);
    expect(devSignInEnabled({ ATHLETICS_DEV_SIGN_IN: "true" })).toBe(false);
  });
});

describe("seedDevPeople", () => {
  it("gives each made-up person the role they're named for", async () => {
    const db = await createMemoryDb();
    await seedFromFixtures(db);
    await seedDevPeople(db, "2026-08-01");
    await seedDevPeople(db, "2026-08-01"); // idempotent
    const soccer = (await listTeams(db, { schoolId: "ghhs" })).find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!;
    const coach = await loadActor(db, "dev-ghh-soccer-coach", "2026-10-09");
    expect(coach.grants).toEqual([{ role: "head_coach", schoolId: "ghhs", teamId: soccer.id }]);
    expect(can(coach, "story.publish", { schoolId: "ghhs", teamId: soccer.id })).toBe(true);
    const ad = await loadActor(db, "dev-ghh-ad", "2026-10-09");
    expect(ad.grants).toEqual([{ role: "school_ad", schoolId: "ghhs", teamId: null }]);
  }, 30_000);
});
