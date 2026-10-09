// Loads fixtures/fall-2026-snapshot.json and fixtures/school-content.json into
// an empty database. Runs on first use of the in-memory dev database
// (lib/db/client.ts) and from `bun run db:seed` against DATABASE_URL.
//
// The fixtures don't include ticket links, stream links or away venues, so
// none are written: the UI shows those as unavailable (DECISIONS 15).

import { count } from "drizzle-orm";

import type { Db } from "./client";
import {
  schoolContent as defaultContent,
  snapshot as defaultSnapshot,
  type FixtureContent,
  type FixtureGame,
  type FixtureSnapshot,
  type FixtureTerm,
} from "./fixtures";
import * as s from "./schema";

type Level = (typeof s.levelEnum.enumValues)[number];

const levels: Record<string, Level> = {
  Varsity: "varsity",
  JV: "jv",
  "C-team": "c_team",
  "C-Team": "c_team",
  Freshman: "freshman",
};

// Fall water polo in Washington is boys' water polo; the source lists the
// game as "Water Polo" while the school's sport list says "Boys Water Polo".
const sportAliases: Record<string, Partial<Record<FixtureTerm, string>>> = {
  "Water Polo": { fall: "Boys Water Polo" },
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** "2026-10-08" → "2026-27". The school year starts in July. */
export function schoolYearFor(isoDate: string): string {
  const [year, month] = isoDate.split("-").map(Number) as [number, number];
  const start = month >= 7 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

/** "14-20" (us-them) → scores. */
export function splitScore(score: string | undefined): { scoreUs: number | null; scoreThem: number | null } {
  if (score === undefined) return { scoreUs: null, scoreThem: null };
  const m = /^(\d+)-(\d+)$/.exec(score);
  if (!m) throw new Error(`Unreadable score "${score}"`);
  return { scoreUs: Number(m[1]), scoreThem: Number(m[2]) };
}

function gameStatus(g: FixtureGame): "scheduled" | "live" | "final" {
  if (g.score !== undefined) return "final";
  if (g.note?.toLowerCase().includes("in progress")) return "live";
  return "scheduled";
}

const shortName = (name: string) => name.replace(/ High School$/, "");

export async function seedFromFixtures(
  db: Db,
  snapshot: FixtureSnapshot = defaultSnapshot,
  content: FixtureContent = defaultContent,
): Promise<{ seeded: boolean; games: number }> {
  const [existing] = await db.select({ n: count() }).from(s.school);
  if ((existing?.n ?? 0) > 0) return { seeded: false, games: 0 };

  return db.transaction(async (tx) => {
    const asOfDate = snapshot.asOf.slice(0, 10);
    const schoolYear = schoolYearFor(asOfDate);

    // Seasons for the whole school year, so every season's teams exist.
    const terms: FixtureTerm[] = ["fall", "winter", "spring"];
    const seasons = await tx
      .insert(s.season)
      .values(terms.map((term) => ({ schoolYear, term })))
      .returning();
    const seasonId = (term: FixtureTerm) => seasons.find((x) => x.term === term)!.id;

    const sportIds = new Map<string, string>();
    async function sportId(name: string): Promise<string> {
      const slug = slugify(name);
      const known = sportIds.get(slug);
      if (known) return known;
      const [row] = await tx.insert(s.sport).values({ name, slug }).returning();
      sportIds.set(slug, row!.id);
      return row!.id;
    }

    const teamIds = new Map<string, string>();
    async function teamId(schoolId: string, sportName: string, term: FixtureTerm, level: Level): Promise<string> {
      const slug = slugify(sportName);
      const key = `${schoolId}-${slug}-${level}-${term}`;
      const known = teamIds.get(key);
      if (known) return known;
      const record = snapshot.records[`${schoolId}-${slug}-${level}`] ?? {};
      const [row] = await tx
        .insert(s.team)
        .values({
          schoolId,
          sportId: await sportId(sportName),
          seasonId: seasonId(term),
          level,
          slug,
          record: record as s.TeamRecord,
        })
        .returning();
      teamIds.set(key, row!.id);
      return row!.id;
    }

    const homeVenue = new Map<string, string>();
    for (const school of snapshot.schools) {
      await tx.insert(s.school).values({
        id: school.id,
        slug: school.path.replace(/^\//, ""),
        name: school.name,
        shortName: shortName(school.name),
        mascot: school.mascot,
        founded: school.founded ?? null,
        address: school.address,
        homeField: school.homeField ?? null,
        logoPath: `/logos/${school.logo.split("/").pop()}`,
        social: school.social ?? {},
        arbiterEntityId: null,
      });
      if (school.contacts.length > 0) {
        await tx.insert(s.schoolContact).values(
          school.contacts.map((c, i) => ({
            schoolId: school.id,
            name: c.name,
            role: c.role,
            email: c.email ?? null,
            phone: c.phone ?? null,
            sort: i,
          })),
        );
      }
      const [venue] = await tx
        .insert(s.venue)
        .values({ name: school.homeField ?? school.name, address: school.address })
        .returning();
      homeVenue.set(school.id, venue!.id);

      for (const term of terms) {
        for (const sportName of school.sportsBySeason[term]) {
          await teamId(school.id, sportName, term, "varsity");
        }
      }
    }

    // The snapshot is a fall snapshot: every game belongs to the fall season.
    const term: FixtureTerm = "fall";
    const games = [];
    for (const g of snapshot.games) {
      const level = levels[g.level];
      if (!level) throw new Error(`Unknown level "${g.level}"`);
      const sportName = sportAliases[g.sport]?.[term] ?? g.sport;
      games.push({
        teamId: await teamId(g.school, sportName, term, level),
        opponent: g.opponent,
        homeAway: g.ha,
        startDate: g.date,
        startTime: g.time,
        venueId: g.ha === "home" ? homeVenue.get(g.school)! : null,
        status: gameStatus(g),
        ...splitScore(g.score),
        isLeague: g.league ?? null,
        label: g.note === "The Fish Bowl" ? g.note : null,
        source: "fixture" as const,
      });
    }
    await tx.insert(s.game).values(games);

    if (content.honors.length > 0) {
      await tx.insert(s.honor).values(
        content.honors.map((h, i) => ({
          schoolId: h.school,
          sport: h.sport ?? null,
          figure: h.figure,
          title: h.title,
          detail: h.detail ?? null,
          featuredOnHub: h.featuredOnHub,
          sort: i,
        })),
      );
    }

    return { seeded: true, games: games.length };
  });
}
