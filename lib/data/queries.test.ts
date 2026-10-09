// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import { seedFromFixtures } from "../db/seed";
import * as s from "../db/schema";
import { getGame, getTeamContent, listGames, listHonors, listSchools, listTeams } from "./queries";

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
  it("returns only published content and directory fields", async () => {
    const [team] = await listTeams(db, { schoolId: "ghhs" });
    await db.insert(s.person).values({ id: "coach-1", name: "Coach", email: "coach-1@psd401.net", emailVerified: true });
    await db.insert(s.rosterEntry).values({ teamId: team!.id, displayName: "Alex R.", jerseyNumber: "12", position: "QB", grade: 12 });
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
