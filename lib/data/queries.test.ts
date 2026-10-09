// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import { seedFromFixtures } from "../db/seed";
import { getGame, listGames, listHonors, listSchools, listTeams } from "./queries";

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
  it("includes the athletics office without email addresses", async () => {
    const [ghhs, phs] = await listSchools(db);
    expect(ghhs?.contacts).toEqual([{ name: "Carly Fries-Geldermann", role: "Athletic Secretary", phone: null }]);
    expect(phs?.contacts[0]).toEqual({ name: "Ross Filkins", role: "Athletic Director", phone: "253-530-4410" });
    expect(JSON.stringify(phs)).not.toContain("@psd401.net");
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
