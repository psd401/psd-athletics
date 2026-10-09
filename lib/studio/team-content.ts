// Team page content a coach edits in the Studio: coach's note, roster,
// documents, partners. Every function checks permission, makes the change
// and records it for undo (DECISIONS 70–71). The MCP server will call these
// same functions.

import { and, eq, isNull } from "drizzle-orm";

import { recordChange } from "../audit";
import type { Db } from "../db/client";
import * as s from "../db/schema";
import { can, type Action, type Actor, type Scope } from "../permissions";
import { safeHttpsUrl } from "../security/url";
import { PermissionError, ValidationError } from "./errors";

export interface Ctx {
  db: Db;
  actor: Actor;
  now: Date;
}

async function teamScope(db: Db, teamId: string): Promise<Scope> {
  const [team] = await db.select({ schoolId: s.team.schoolId }).from(s.team).where(eq(s.team.id, teamId));
  if (!team) throw new ValidationError("That team doesn't exist.");
  return { schoolId: team.schoolId, teamId };
}

async function authorize(ctx: Ctx, action: Action, teamId: string, what: string): Promise<Scope> {
  const scope = await teamScope(ctx.db, teamId);
  if (!can(ctx.actor, action, scope)) throw new PermissionError(`You can't ${what} for this team. Ask the head coach or athletic director.`);
  return scope;
}

const text = (value: string, field: string, max: number) => {
  const v = value.trim();
  if (!v) throw new ValidationError(`${field} can't be empty.`);
  if (v.length > max) throw new ValidationError(`${field} must be ${max} characters or fewer.`);
  return v;
};

// ------------------------------------------------------------ coach's note

/** Posts a new note from the coach (the newest published one shows on the team page). */
export async function postCoachNote(ctx: Ctx, teamId: string, body: string) {
  const scope = await authorize(ctx, "team.edit", teamId, "post a note");
  const [row] = await ctx.db
    .insert(s.coachNote)
    .values({ teamId, authorId: ctx.actor.personId, body: text(body, "The note", 600), publishedAt: ctx.now })
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "publish", objectType: "coach_note", objectId: row!.id, scope, before: null, after: row!, now: ctx.now });
  return row!;
}

// ------------------------------------------------------------ roster

/**
 * Directory information only, and names as "first name, last initial"
 * (the district rule): "Alex R.", "Mary Kate O.".
 */
export const ROSTER_NAME = /^[\p{L}'’-]+( [\p{L}'’-]+)* \p{Lu}\.$/u;

export interface RosterInput {
  displayName: string;
  jerseyNumber?: string;
  position?: string;
  grade?: number | null;
}

function rosterFields(input: RosterInput) {
  const displayName = input.displayName.trim().replace(/\s+/g, " ");
  if (!ROSTER_NAME.test(displayName)) throw new ValidationError("Use first name and last initial, like Alex R.");
  const jersey = input.jerseyNumber?.trim() ?? "";
  if (jersey && !/^\d{1,3}$/.test(jersey)) throw new ValidationError("Jersey numbers are 1 to 3 digits.");
  const grade = input.grade ?? null;
  if (grade !== null && (!Number.isInteger(grade) || grade < 9 || grade > 12)) throw new ValidationError("Grade is 9, 10, 11 or 12.");
  const position = input.position?.trim() ?? "";
  if (position.length > 30) throw new ValidationError("Position must be 30 characters or fewer.");
  return { displayName, jerseyNumber: jersey || null, position: position || null, grade };
}

export async function addRosterEntry(ctx: Ctx, teamId: string, input: RosterInput) {
  const scope = await authorize(ctx, "roster.edit", teamId, "edit the roster");
  const [row] = await ctx.db.insert(s.rosterEntry).values({ teamId, ...rosterFields(input) }).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "create", objectType: "roster_entry", objectId: row!.id, scope, before: null, after: row!, now: ctx.now });
  return row!;
}

export async function removeRosterEntry(ctx: Ctx, id: string) {
  const [row] = await ctx.db.select().from(s.rosterEntry).where(eq(s.rosterEntry.id, id));
  if (!row) throw new ValidationError("That roster entry doesn't exist.");
  const scope = await authorize(ctx, "roster.edit", row.teamId, "edit the roster");
  await ctx.db.delete(s.rosterEntry).where(eq(s.rosterEntry.id, id));
  await recordChange(ctx.db, { actor: ctx.actor, verb: "delete", objectType: "roster_entry", objectId: id, scope, before: row, after: null, now: ctx.now });
}

/** Publishes every unpublished entry on the team's roster. Returns how many. */
export async function publishRoster(ctx: Ctx, teamId: string): Promise<number> {
  const scope = await authorize(ctx, "roster.edit", teamId, "publish the roster");
  const drafts = await ctx.db
    .select()
    .from(s.rosterEntry)
    .where(and(eq(s.rosterEntry.teamId, teamId), isNull(s.rosterEntry.publishedAt)));
  for (const before of drafts) {
    const [after] = await ctx.db.update(s.rosterEntry).set({ publishedAt: ctx.now }).where(eq(s.rosterEntry.id, before.id)).returning();
    await recordChange(ctx.db, { actor: ctx.actor, verb: "publish", objectType: "roster_entry", objectId: before.id, scope, before, after: after!, now: ctx.now });
  }
  return drafts.length;
}

// ------------------------------------------------------------ documents and partners

export async function addDocument(ctx: Ctx, teamId: string, input: { title: string; kind: string; url: string }) {
  const scope = await authorize(ctx, "team.edit", teamId, "add documents");
  const url = safeHttpsUrl(input.url.trim());
  if (!url) throw new ValidationError("Links must start with https://.");
  const [row] = await ctx.db
    .insert(s.document)
    .values({ schoolId: scope.schoolId, teamId, title: text(input.title, "The title", 120), kind: text(input.kind, "The kind", 20), url, publishedAt: ctx.now })
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "publish", objectType: "document", objectId: row!.id, scope, before: null, after: row!, now: ctx.now });
  return row!;
}

export async function removeDocument(ctx: Ctx, id: string) {
  const [row] = await ctx.db.select().from(s.document).where(eq(s.document.id, id));
  if (!row?.teamId) throw new ValidationError("That document doesn't exist.");
  const scope = await authorize(ctx, "team.edit", row.teamId, "remove documents");
  await ctx.db.delete(s.document).where(eq(s.document.id, id));
  await recordChange(ctx.db, { actor: ctx.actor, verb: "delete", objectType: "document", objectId: id, scope, before: row, after: null, now: ctx.now });
}

export async function addSponsor(ctx: Ctx, teamId: string, input: { name: string; url?: string }) {
  const scope = await authorize(ctx, "team.edit", teamId, "add partners");
  const url = input.url?.trim() ? safeHttpsUrl(input.url.trim()) : null;
  if (input.url?.trim() && !url) throw new ValidationError("Links must start with https://.");
  const [row] = await ctx.db.insert(s.sponsor).values({ schoolId: scope.schoolId, teamId, name: text(input.name, "The name", 80), url }).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "create", objectType: "sponsor", objectId: row!.id, scope, before: null, after: row!, now: ctx.now });
  return row!;
}

export async function removeSponsor(ctx: Ctx, id: string) {
  const [row] = await ctx.db.select().from(s.sponsor).where(eq(s.sponsor.id, id));
  if (!row?.teamId) throw new ValidationError("That partner doesn't exist.");
  const scope = await authorize(ctx, "team.edit", row.teamId, "remove partners");
  await ctx.db.delete(s.sponsor).where(eq(s.sponsor.id, id));
  await recordChange(ctx.db, { actor: ctx.actor, verb: "delete", objectType: "sponsor", objectId: id, scope, before: row, after: null, now: ctx.now });
}

/** Every roster entry, drafts included, for the Studio editor. */
export async function listRosterForStudio(db: Db, teamId: string) {
  return db
    .select({
      id: s.rosterEntry.id,
      displayName: s.rosterEntry.displayName,
      jerseyNumber: s.rosterEntry.jerseyNumber,
      position: s.rosterEntry.position,
      grade: s.rosterEntry.grade,
      publishedAt: s.rosterEntry.publishedAt,
    })
    .from(s.rosterEntry)
    .where(eq(s.rosterEntry.teamId, teamId))
    .orderBy(s.rosterEntry.displayName);
}
