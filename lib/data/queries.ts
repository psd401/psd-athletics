// Read queries for the public pages. Server only: these return plain objects
// that are safe to hand to Client Components.

import { and, asc, eq, gte, lte, type SQL } from "drizzle-orm";

import type { Db } from "../db/client";
import * as s from "../db/schema";
import type { GameView } from "../schedule/games";

export async function listGames(
  db: Db,
  { id, schoolId, from, to }: { id?: string; schoolId?: string; from?: string; to?: string } = {},
): Promise<GameView[]> {
  const where: SQL[] = [];
  if (id) where.push(eq(s.game.id, id));
  if (schoolId) where.push(eq(s.team.schoolId, schoolId));
  if (from) where.push(gte(s.game.startDate, from));
  if (to) where.push(lte(s.game.startDate, to));
  const rows = await db
    .select({ game: s.game, team: s.team, sport: s.sport, school: s.school, venue: s.venue })
    .from(s.game)
    .innerJoin(s.team, eq(s.game.teamId, s.team.id))
    .innerJoin(s.sport, eq(s.team.sportId, s.sport.id))
    .innerJoin(s.school, eq(s.team.schoolId, s.school.id))
    .leftJoin(s.venue, eq(s.game.venueId, s.venue.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(s.game.startDate), asc(s.game.startTime));
  return rows.map(({ game, team, sport, school, venue }) => ({
    id: game.id,
    schoolId: school.id,
    schoolSlug: school.slug,
    schoolShortName: school.shortName,
    mascot: school.mascot,
    teamId: team.id,
    sport: sport.name,
    sportSlug: sport.slug,
    level: team.level,
    opponent: game.opponent,
    homeAway: game.homeAway,
    startDate: game.startDate,
    startTime: game.startTime,
    status: game.status,
    scoreUs: game.scoreUs,
    scoreThem: game.scoreThem,
    isLeague: game.isLeague,
    label: game.label,
    streamUrl: game.streamUrl,
    ticketUrl: game.ticketUrl,
    venueName: venue?.name ?? null,
    venueAddress: venue?.address ?? null,
    record: team.record,
    source: game.source,
    updatedFields: game.updatedFields,
  }));
}

export async function getGame(db: Db, id: string): Promise<GameView | null> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return null;
  const [game] = await listGames(db, { id });
  return game ?? null;
}

export interface SchoolView {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  mascot: string;
  founded: number | null;
  address: string;
  homeField: string | null;
  logoPath: string;
  social: s.SchoolSocial;
  contacts: { name: string; role: string; phone: string | null }[];
}

/** Schools with their athletics office. Contact emails are left out: pages never show them. */
export async function listSchools(db: Db): Promise<SchoolView[]> {
  const schools = await db.select().from(s.school).orderBy(asc(s.school.id));
  const contacts = await db.select().from(s.schoolContact).orderBy(asc(s.schoolContact.sort));
  return schools.map((school) => ({
    id: school.id,
    slug: school.slug,
    name: school.name,
    shortName: school.shortName,
    mascot: school.mascot,
    founded: school.founded,
    address: school.address,
    homeField: school.homeField,
    logoPath: school.logoPath,
    social: school.social,
    contacts: contacts
      .filter((c) => c.schoolId === school.id)
      .map((c) => ({ name: c.name, role: c.role, phone: c.phone })),
  }));
}

export async function listHonors(db: Db, { schoolId, featuredOnHub }: { schoolId?: string; featuredOnHub?: boolean } = {}) {
  const where: SQL[] = [];
  if (schoolId) where.push(eq(s.honor.schoolId, schoolId));
  if (featuredOnHub !== undefined) where.push(eq(s.honor.featuredOnHub, featuredOnHub));
  return db
    .select({ schoolId: s.honor.schoolId, figure: s.honor.figure, title: s.honor.title, detail: s.honor.detail })
    .from(s.honor)
    .where(where.length ? and(...where) : undefined)
    .orderBy(asc(s.honor.sort));
}

export interface TeamView {
  id: string;
  schoolId: string;
  sport: string;
  sportSlug: string;
  level: GameView["level"];
  term: "fall" | "winter" | "spring";
  record: s.TeamRecord;
}

export async function listTeams(db: Db, { schoolId }: { schoolId?: string } = {}): Promise<TeamView[]> {
  const rows = await db
    .select({ team: s.team, sport: s.sport, season: s.season })
    .from(s.team)
    .innerJoin(s.sport, eq(s.team.sportId, s.sport.id))
    .innerJoin(s.season, eq(s.team.seasonId, s.season.id))
    .where(schoolId ? eq(s.team.schoolId, schoolId) : undefined)
    .orderBy(asc(s.team.createdAt));
  return rows.map(({ team, sport, season }) => ({
    id: team.id,
    schoolId: team.schoolId,
    sport: sport.name,
    sportSlug: sport.slug,
    level: team.level,
    term: season.term,
    record: team.record,
  }));
}
