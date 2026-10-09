// Read queries for the public pages. Server only: these return plain objects
// that are safe to hand to Client Components.

import { and, asc, desc, eq, gte, isNotNull, lte, type SQL } from "drizzle-orm";

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
  /** The athletics office (AD and secretary). Coaches are never in this list. */
  contacts: { name: string; role: string; email: string | null; phone: string | null }[];
}

/** Schools with their athletics office, whose published contacts appear on the site (DECISIONS 52). */
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
      .map((c) => ({ name: c.name, role: c.role, email: c.email, phone: c.phone })),
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

export interface TeamContent {
  roster: { id: string; displayName: string; jerseyNumber: string | null; position: string | null; grade: number | null }[];
  stories: { id: string; title: string; summary: string | null; publishedAt: Date }[];
  albums: { id: string; title: string; publishedAt: Date }[];
  documents: { id: string; title: string; kind: string; url: string | null }[];
  coachNote: { body: string; publishedAt: Date } | null;
  sponsors: { id: string; name: string; url: string | null }[];
}

/**
 * Everything published for one team. Only published rows; roster entries
 * also leave out students whose families opted out of directory
 * information, and carry directory fields only (CLAUDE.md student privacy).
 */
export async function getTeamContent(db: Db, teamId: string): Promise<TeamContent> {
  const [roster, stories, albums, documents, notes, sponsors] = await Promise.all([
    db
      .select({
        id: s.rosterEntry.id,
        displayName: s.rosterEntry.displayName,
        jerseyNumber: s.rosterEntry.jerseyNumber,
        position: s.rosterEntry.position,
        grade: s.rosterEntry.grade,
      })
      .from(s.rosterEntry)
      .where(
        and(eq(s.rosterEntry.teamId, teamId), isNotNull(s.rosterEntry.publishedAt), eq(s.rosterEntry.directoryOptOut, false)),
      )
      .orderBy(asc(s.rosterEntry.displayName)),
    db
      .select({ id: s.story.id, title: s.story.title, summary: s.story.summary, publishedAt: s.story.publishedAt })
      .from(s.story)
      .where(and(eq(s.story.teamId, teamId), eq(s.story.status, "published")))
      .orderBy(desc(s.story.publishedAt)),
    db
      .select({ id: s.album.id, title: s.album.title, publishedAt: s.album.publishedAt })
      .from(s.album)
      .where(and(eq(s.album.teamId, teamId), eq(s.album.status, "published")))
      .orderBy(desc(s.album.publishedAt)),
    db
      .select({ id: s.document.id, title: s.document.title, kind: s.document.kind, url: s.document.url, publishedAt: s.document.publishedAt })
      .from(s.document)
      .where(eq(s.document.teamId, teamId))
      .orderBy(asc(s.document.title)),
    db
      .select({ body: s.coachNote.body, publishedAt: s.coachNote.publishedAt })
      .from(s.coachNote)
      .where(eq(s.coachNote.teamId, teamId))
      .orderBy(desc(s.coachNote.publishedAt)),
    db
      .select({ id: s.sponsor.id, name: s.sponsor.name, url: s.sponsor.url })
      .from(s.sponsor)
      .where(and(eq(s.sponsor.teamId, teamId), eq(s.sponsor.active, true)))
      .orderBy(asc(s.sponsor.sort)),
  ]);
  const published = <T extends { publishedAt: Date | null }>(rows: T[]) =>
    rows.filter((r): r is T & { publishedAt: Date } => r.publishedAt !== null);
  const note = published(notes)[0];
  return {
    roster,
    stories: published(stories),
    albums: published(albums),
    documents: published(documents).map(({ id, title, kind, url }) => ({ id, title, kind, url })),
    coachNote: note ? { body: note.body, publishedAt: note.publishedAt } : null,
    sponsors,
  };
}
