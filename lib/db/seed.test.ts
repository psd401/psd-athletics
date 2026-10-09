// @vitest-environment node
import { and, count, eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "./client";
import { snapshot } from "./fixtures";
import * as s from "./schema";
import { schoolYearFor, seedFromFixtures, splitScore } from "./seed";

let db: Db;
let firstRun: Awaited<ReturnType<typeof seedFromFixtures>>;

async function gamesFor(schoolId: string, sportSlug: string, level: "varsity" | "jv" | "freshman" | "c_team") {
  return db
    .select({ game: s.game, venue: s.venue })
    .from(s.game)
    .innerJoin(s.team, eq(s.game.teamId, s.team.id))
    .innerJoin(s.sport, eq(s.team.sportId, s.sport.id))
    .leftJoin(s.venue, eq(s.game.venueId, s.venue.id))
    .where(and(eq(s.team.schoolId, schoolId), eq(s.sport.slug, sportSlug), eq(s.team.level, level)))
    .orderBy(s.game.startDate);
}

beforeAll(async () => {
  db = await createMemoryDb();
  firstRun = await seedFromFixtures(db);
}, 30_000);

describe("seedFromFixtures", () => {
  it("loads both schools with their URL slugs", async () => {
    const schools = await db.select().from(s.school).orderBy(s.school.id);
    expect(schools.map((x) => [x.id, x.slug, x.shortName, x.mascot])).toEqual([
      ["ghhs", "ghh", "Gig Harbor", "Tides"],
      ["phs", "phs", "Peninsula", "Seahawks"],
    ]);
    expect(schools[1]?.homeField).toBe("Roy Anderson Field");
    expect(schools[0]?.logoPath).toBe("/logos/ghhs-gh-logo.png");
    // Confirmed on ArbiterLive 2026-10-08 (DECISIONS 46).
    expect(schools.map((x) => x.arbiterEntityId)).toEqual(["8486", "17802"]);
  });

  it("loads every game in the snapshot", async () => {
    const [row] = await db.select({ n: count() }).from(s.game);
    expect(row?.n).toBe(48);
    expect(snapshot.games).toHaveLength(48);
    expect(firstRun).toEqual({ seeded: true, games: 48 });
  });

  it("splits finals into our score and theirs", async () => {
    const football = await gamesFor("ghhs", "football", "varsity");
    const lincoln = football.find((r) => r.game.opponent === "Lincoln")!.game;
    expect(lincoln).toMatchObject({
      status: "final",
      scoreUs: 31,
      scoreThem: 28,
      homeAway: "away",
      isLeague: true,
      startDate: "2026-10-02",
      startTime: "19:00:00",
      source: "fixture",
    });
  });

  it("keeps unknown values unknown", async () => {
    const soccer = await gamesFor("phs", "girls-soccer", "varsity");
    const silas = soccer.find((r) => r.game.startDate === "2026-10-08")!.game;
    expect(silas.status).toBe("live");
    expect(silas.startTime).toBeNull();
    expect(silas.scoreUs).toBeNull();

    const volleyball = await gamesFor("ghhs", "volleyball", "varsity");
    expect(volleyball.every((r) => r.game.isLeague === null)).toBe(true);

    const all = await db.select().from(s.game);
    expect(all.every((g) => g.ticketUrl === null && g.streamUrl === null)).toBe(true);
  });

  it("leaves past games without a reported result as scheduled, with no score", async () => {
    const football = await gamesFor("phs", "football", "varsity");
    const timberline = football.find((r) => r.game.opponent === "Timberline")!.game;
    expect(timberline.startDate).toBe("2026-09-25");
    expect(timberline.status).toBe("scheduled");
    expect(timberline.scoreUs).toBeNull();
  });

  it("labels the Fish Bowl on both schools' schedules with the same result", async () => {
    const fishBowl = await db
      .select({ game: s.game, schoolId: s.team.schoolId })
      .from(s.game)
      .innerJoin(s.team, eq(s.game.teamId, s.team.id))
      .where(eq(s.game.label, "The Fish Bowl"))
      .orderBy(s.team.schoolId);
    expect(fishBowl.map((r) => [r.schoolId, r.game.homeAway, r.game.scoreUs, r.game.scoreThem])).toEqual([
      ["ghhs", "home", 8, 37],
      ["phs", "away", 37, 8],
    ]);
    expect(snapshot.fishBowl.score).toEqual({ phs: 37, ghhs: 8 });
  });

  it("puts home games at the school's venue and leaves away venues unknown", async () => {
    const phsFootball = await gamesFor("phs", "football", "varsity");
    const home = phsFootball.filter((r) => r.game.homeAway === "home");
    const away = phsFootball.filter((r) => r.game.homeAway === "away");
    expect(home.length).toBeGreaterThan(0);
    expect(home.every((r) => r.venue?.name === "Roy Anderson Field")).toBe(true);
    expect(home[0]?.venue?.address).toBe("14105 Purdy Dr NW, Gig Harbor, WA 98332");
    expect(away.every((r) => r.venue === null)).toBe(true);
  });

  it("creates teams for every season's sports and every level that plays", async () => {
    const ghWinter = await db
      .select({ name: s.sport.name })
      .from(s.team)
      .innerJoin(s.season, eq(s.team.seasonId, s.season.id))
      .innerJoin(s.sport, eq(s.team.sportId, s.sport.id))
      .where(and(eq(s.team.schoolId, "ghhs"), eq(s.season.term, "winter")));
    expect(ghWinter.map((r) => r.name).sort()).toEqual(
      [...snapshot.schools[0]!.sportsBySeason.winter].sort(),
    );
    expect(await gamesFor("phs", "football", "jv")).toHaveLength(1);
    expect(await gamesFor("phs", "volleyball", "freshman")).toHaveLength(1);
  });

  it("files Peninsula's fall water polo game under Boys Water Polo", async () => {
    expect(await gamesFor("phs", "boys-water-polo", "varsity")).toHaveLength(1);
    // Peninsula's winter "Water Polo" team exists from its sport list, but has no fall game.
    expect(await gamesFor("phs", "water-polo", "varsity")).toHaveLength(0);
  });

  it("stores the published records on the team", async () => {
    const [football] = await db
      .select({ record: s.team.record })
      .from(s.team)
      .innerJoin(s.sport, eq(s.team.sportId, s.sport.id))
      .where(and(eq(s.team.schoolId, "ghhs"), eq(s.sport.slug, "football"), eq(s.team.level, "varsity")));
    expect(football?.record).toEqual({
      overall: "3-2",
      league: "2-0",
      leagueRank: 2,
      pointsFor: 98,
      pointsAgainst: 93,
      home: "2-1",
      away: "1-1",
      streak: "W2",
    });
  });

  it("loads contacts and honors", async () => {
    const contacts = await db.select().from(s.schoolContact).where(eq(s.schoolContact.schoolId, "phs"));
    expect(contacts.map((c) => c.role).sort()).toEqual(["Athletic Director", "Athletic Secretary"]);
    const honors = await db.select().from(s.honor).where(eq(s.honor.featuredOnHub, true));
    expect(honors).toHaveLength(5);
    const phsHonors = await db.select({ figure: s.honor.figure }).from(s.honor).where(eq(s.honor.schoolId, "phs")).orderBy(s.honor.sort);
    expect(phsHonors.map((h) => h.figure)).toEqual(["’12 · ’13", "1978", "Unified", "Letter"]);
  });

  it("does nothing the second time", async () => {
    expect(await seedFromFixtures(db)).toEqual({ seeded: false, games: 0 });
    const [games] = await db.select({ n: count() }).from(s.game);
    const [teams] = await db.select({ n: count() }).from(s.team);
    expect(games?.n).toBe(48);
    expect(teams?.n).toBeGreaterThan(40);
    const [again] = await db.select({ n: count() }).from(s.team);
    expect(again?.n).toBe(teams?.n);
  });
});

describe("splitScore", () => {
  it("reads us-them", () => {
    expect(splitScore("14-20")).toEqual({ scoreUs: 14, scoreThem: 20 });
  });

  it("returns nulls for a missing score and throws on a malformed one", () => {
    expect(splitScore(undefined)).toEqual({ scoreUs: null, scoreThem: null });
    expect(() => splitScore("3–0")).toThrow(/Unreadable score/);
  });
});

describe("schoolYearFor", () => {
  it("starts the school year in July", () => {
    expect(schoolYearFor("2026-10-08")).toBe("2026-27");
    expect(schoolYearFor("2027-03-01")).toBe("2026-27");
    expect(schoolYearFor("2027-07-01")).toBe("2027-28");
    expect(schoolYearFor("2099-08-01")).toBe("2099-00");
  });
});
