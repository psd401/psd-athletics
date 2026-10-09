// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import { seedFromFixtures } from "../db/seed";
import * as s from "../db/schema";
import { getGame, getTeamContent, listGames, listHeadCoaches, listHonors, listSchools, listTeams } from "./queries";

let db: Db;

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
}, 30_000);

describe("listGames", () => {
  it("returns every seeded game as a view, ordered by date", async () => {
    const games = await listGames(db);
    expect(games).toHaveLength(48);
    const dates = games.map((g) => g.startDate);
    expect([...dates].sort()).toEqual(dates);
  });

  it("filters by school and date range", async () => {
    const week = await listGames(db, { schoolId: "ghhs", from: "2026-10-08", to: "2026-10-16" });
    expect(week.map((g) => `${g.startDate} ${g.sport} ${g.opponent}`)).toEqual([
      "2026-10-08 Girls Soccer Mount Tahoma",
      "2026-10-09 Football Central Kitsap",
      "2026-10-13 Girls Soccer Bellarmine Prep",
      "2026-10-13 Volleyball Central Kitsap",
      "2026-10-15 Girls Soccer North Thurston",
      "2026-10-15 Volleyball Bellarmine Prep",
      "2026-10-16 Football Silas",
    ]);
  });

  it("carries school, team, venue and record onto each game", async () => {
    const [kitsap] = await listGames(db, { schoolId: "ghhs", from: "2026-10-09", to: "2026-10-09" });
    expect(kitsap).toMatchObject({
      schoolSlug: "ghh",
      schoolShortName: "Gig Harbor",
      mascot: "Tides",
      sport: "Football",
      sportSlug: "football",
      level: "varsity",
      homeAway: "away",
      startTime: "19:00:00",
      venueAddress: null,
      record: { overall: "3-2", league: "2-0", leagueRank: 2 },
    });
  });
});

describe("getGame", () => {
  it("finds a game by id and rejects ids that aren't UUIDs", async () => {
    const [any] = await listGames(db, { from: "2026-10-13", to: "2026-10-13" });
    expect((await getGame(db, any!.id))?.id).toBe(any!.id);
    expect(await getGame(db, "not-an-id")).toBeNull();
    expect(await getGame(db, "00000000-0000-0000-0000-000000000000")).toBeNull();
  });
});

describe("listSchools", () => {
  it("includes the athletics office as published by the school", async () => {
    const [ghhs, phs] = await listSchools(db);
    expect(ghhs?.contacts).toEqual([{ name: "Carly Fries-Geldermann", role: "Athletic Secretary", email: null, phone: null }]);
    expect(phs?.contacts[0]).toEqual({ name: "Ross Filkins", role: "Athletic Director", email: "filkinsr@psd401.net", phone: "253-530-4410" });
  });
});

describe("listHonors and listTeams", () => {
  it("returns the hub's featured honors in order", async () => {
    const honors = await listHonors(db, { schoolId: "ghhs", featuredOnHub: true });
    expect(honors.map((h) => h.figure)).toEqual(["11", "2013", "’97 · ’17"]);
  });

  it("returns a school's teams with their season", async () => {
    const teams = await listTeams(db, { schoolId: "ghhs" });
    expect(teams.filter((t) => t.term === "fall").map((t) => t.sport)).toEqual([
      "Football", "Girls Soccer", "Volleyball", "Boys Tennis", "Cross Country", "Girls Swim and Dive", "Boys Water Polo",
    ]);
  });
});

describe("getTeamContent", () => {
  it("returns only published content, never opted-out students, and only directory fields", async () => {
    const [team] = await listTeams(db, { schoolId: "ghhs" });
    await db.insert(s.person).values({ id: "coach-1", name: "Coach", email: "coach-1@psd401.net", emailVerified: true });
    const published = new Date("2026-09-01T00:00:00Z");
    await db.insert(s.rosterEntry).values([
      { teamId: team!.id, displayName: "Alex R.", jerseyNumber: "12", position: "QB", grade: 12, publishedAt: published },
      // Not shown: not yet published by the coach.
      { teamId: team!.id, displayName: "Draft D.", jerseyNumber: "3" },
      // Not shown: the family opted out of directory information.
      { teamId: team!.id, displayName: "Private P.", jerseyNumber: "7", publishedAt: published, directoryOptOut: true },
    ]);
    await db.insert(s.story).values([
      { schoolId: "ghhs", teamId: team!.id, title: "Draft", slug: "draft", body: "x", authorId: "coach-1" },
      { schoolId: "ghhs", teamId: team!.id, title: "Live", slug: "live", body: "x", authorId: "coach-1", status: "published", publishedAt: new Date("2026-10-03T00:00:00Z") },
    ]);
    await db.insert(s.coachNote).values([
      { teamId: team!.id, authorId: "coach-1", body: "Unposted" },
      { teamId: team!.id, authorId: "coach-1", body: "Bus leaves at 4", publishedAt: new Date("2026-10-07T00:00:00Z") },
    ]);

    const content = await getTeamContent(db, team!.id);
    expect(content.roster).toEqual([{ id: expect.any(String), displayName: "Alex R.", jerseyNumber: "12", position: "QB", grade: 12 }]);
    expect(content.stories.map((x) => x.title)).toEqual(["Live"]);
    expect(content.coachNote?.body).toBe("Bus leaves at 4");
    expect(content.albums).toEqual([]);
    expect(content.documents).toEqual([]);
    expect(content.sponsors).toEqual([]);
  });

  it("is empty for a team with nothing published", async () => {
    const teams = await listTeams(db, { schoolId: "phs" });
    expect(await getTeamContent(db, teams[0]!.id)).toEqual({ roster: [], stories: [], albums: [], documents: [], coachNote: null, sponsors: [] });
  });
});

describe("listHeadCoaches", () => {
  it("returns active head coaches only, by name", async () => {
    const teams = await listTeams(db, { schoolId: "phs" });
    const football = teams.find((t) => t.sportSlug === "football" && t.level === "varsity")!;
    const soccer = teams.find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!;
    await db.insert(s.person).values([
      { id: "hc-1", name: "Current Coach", email: "hc-1@psd401.net", emailVerified: true },
      { id: "hc-2", name: "Former Coach", email: "hc-2@psd401.net", emailVerified: true },
      { id: "hc-3", name: "Future Coach", email: "hc-3@psd401.net", emailVerified: true },
      { id: "ac-1", name: "Assistant Coach", email: "ac-1@psd401.net", emailVerified: true },
    ]);
    await db.insert(s.roleAssignment).values([
      { personId: "hc-1", role: "head_coach", teamId: football.id, startsOn: "2026-08-01", source: "test" },
      { personId: "hc-2", role: "head_coach", teamId: soccer.id, startsOn: "2025-08-01", endsOn: "2026-06-30", source: "test" },
      { personId: "hc-3", role: "head_coach", teamId: soccer.id, startsOn: "2026-11-01", source: "test" },
      { personId: "ac-1", role: "assistant_coach", teamId: soccer.id, startsOn: "2026-08-01", source: "test" },
    ]);
    expect(await listHeadCoaches(db, { schoolId: "phs", today: "2026-10-08" })).toEqual([{ teamId: football.id, name: "Current Coach" }]);
    expect(await listHeadCoaches(db, { schoolId: "ghhs", today: "2026-10-08" })).toEqual([]);
  });
});
