// Stories (recaps, announcements) attached to a team and optionally a game
// (SPEC §4). Drafts are private; coaches publish their own teams' stories;
// every change is audited and can be undone.

import { and, desc, eq, isNotNull } from "drizzle-orm";

import { recordChange } from "../audit";
import type { Db } from "../db/client";
import * as s from "../db/schema";
import { can, type Action, type Scope } from "../permissions";
import { result, type GameView } from "../schedule/games";
import { formatLongDate } from "../schedule/time";
import { PermissionError, ValidationError } from "./errors";
import type { Ctx } from "./team-content";

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
  return slug || "story";
}

async function teamScope(db: Db, teamId: string): Promise<Scope> {
  const [team] = await db.select({ schoolId: s.team.schoolId }).from(s.team).where(eq(s.team.id, teamId));
  if (!team) throw new ValidationError("That team doesn't exist.");
  return { schoolId: team.schoolId, teamId };
}

function require(ctx: Ctx, action: Action, scope: Scope, what: string) {
  if (!can(ctx.actor, action, scope)) {
    throw new PermissionError(
      action === "story.publish"
        ? "You can draft this story, but publishing needs the head coach or an athletic director."
        : `You can't ${what} for this team.`,
    );
  }
}

const text = (value: string | undefined, field: string, max: number, required: boolean) => {
  const v = (value ?? "").trim();
  if (required && !v) throw new ValidationError(field === "body" ? "The story can't be empty." : `The ${field} can't be empty.`);
  if (v.length > max) throw new ValidationError(`The ${field} must be ${max} characters or fewer.`);
  return v;
};

async function uniqueSlug(db: Db, schoolId: string, title: string, exceptId?: string): Promise<string> {
  const base = slugify(title);
  for (let n = 1; n < 100; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const [taken] = await db
      .select({ id: s.story.id })
      .from(s.story)
      .where(and(eq(s.story.schoolId, schoolId), eq(s.story.slug, candidate)));
    if (!taken || taken.id === exceptId) return candidate;
  }
  throw new ValidationError("Too many stories with that title. Try a different one.");
}

async function checkGame(db: Db, teamId: string, gameId: string | null | undefined): Promise<string | null> {
  if (!gameId) return null;
  const [game] = await db.select({ teamId: s.game.teamId }).from(s.game).where(eq(s.game.id, gameId));
  if (!game || game.teamId !== teamId) throw new ValidationError("Pick one of this team's games, or none.");
  return gameId;
}

export interface StoryInput {
  teamId: string;
  gameId?: string | null;
  title: string;
  summary?: string;
  body: string;
}

export async function createStory(ctx: Ctx, input: StoryInput) {
  const scope = await teamScope(ctx.db, input.teamId);
  require(ctx, "story.draft", scope, "write stories");
  const title = text(input.title, "title", 120, true);
  const [row] = await ctx.db
    .insert(s.story)
    .values({
      schoolId: scope.schoolId,
      teamId: input.teamId,
      gameId: await checkGame(ctx.db, input.teamId, input.gameId),
      title,
      slug: await uniqueSlug(ctx.db, scope.schoolId, title),
      summary: text(input.summary, "summary", 240, false) || null,
      body: text(input.body, "body", 8000, true),
      authorId: ctx.actor.personId,
      draftedByAgent: ctx.actor.agentConnectionId !== undefined,
    })
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "create", objectType: "story", objectId: row!.id, scope, before: null, after: row!, now: ctx.now });
  return row!;
}

async function load(ctx: Ctx, id: string) {
  const [row] = await ctx.db.select().from(s.story).where(eq(s.story.id, id));
  if (!row?.teamId) throw new ValidationError("That story doesn't exist.");
  return { row, scope: { schoolId: row.schoolId, teamId: row.teamId } as Scope };
}

export async function updateStory(ctx: Ctx, id: string, input: Omit<StoryInput, "teamId">) {
  const { row: before, scope } = await load(ctx, id);
  require(ctx, "story.draft", scope, "edit stories");
  // Editing a published story is publishing new words.
  if (before.status === "published") require(ctx, "story.publish", scope, "edit published stories");
  const title = text(input.title, "title", 120, true);
  const [after] = await ctx.db
    .update(s.story)
    .set({
      title,
      slug: title === before.title ? before.slug : await uniqueSlug(ctx.db, before.schoolId, title, before.id),
      summary: text(input.summary, "summary", 240, false) || null,
      body: text(input.body, "body", 8000, true),
      gameId: input.gameId === undefined ? before.gameId : await checkGame(ctx.db, before.teamId!, input.gameId),
    })
    .where(eq(s.story.id, id))
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "update", objectType: "story", objectId: id, scope, before, after: after!, now: ctx.now });
  return after!;
}

export async function publishStory(ctx: Ctx, id: string) {
  const { row: before, scope } = await load(ctx, id);
  require(ctx, "story.publish", scope, "publish stories");
  const [after] = await ctx.db.update(s.story).set({ status: "published", publishedAt: before.publishedAt ?? ctx.now }).where(eq(s.story.id, id)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "publish", objectType: "story", objectId: id, scope, before, after: after!, now: ctx.now });
  return after!;
}

export async function unpublishStory(ctx: Ctx, id: string) {
  const { row: before, scope } = await load(ctx, id);
  if (!can(ctx.actor, "story.publish", scope) && !can(ctx.actor, "content.takedown", scope)) {
    throw new PermissionError("Only the head coach or an athletic director can unpublish this story.");
  }
  const [after] = await ctx.db.update(s.story).set({ status: "draft", publishedAt: null }).where(eq(s.story.id, id)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "unpublish", objectType: "story", objectId: id, scope, before, after: after!, now: ctx.now });
  return after!;
}

export interface PublishedStory {
  id: string;
  schoolId: string;
  teamId: string | null;
  slug: string;
  title: string;
  summary: string | null;
  body: string;
  publishedAt: Date;
  sport: string | null;
  sportSlug: string | null;
}

/** Published stories, newest first, for a school or a team. */
export async function listPublishedStories(db: Db, { schoolId, teamId, limit = 20 }: { schoolId: string; teamId?: string; limit?: number }): Promise<PublishedStory[]> {
  const rows = await db
    .select({ story: s.story, sport: s.sport })
    .from(s.story)
    .leftJoin(s.team, eq(s.story.teamId, s.team.id))
    .leftJoin(s.sport, eq(s.team.sportId, s.sport.id))
    .where(and(eq(s.story.schoolId, schoolId), eq(s.story.status, "published"), isNotNull(s.story.publishedAt), teamId ? eq(s.story.teamId, teamId) : undefined))
    .orderBy(desc(s.story.publishedAt))
    .limit(limit);
  return rows.map(({ story, sport }) => ({
    id: story.id,
    schoolId: story.schoolId,
    teamId: story.teamId,
    slug: story.slug,
    title: story.title,
    summary: story.summary,
    body: story.body,
    publishedAt: story.publishedAt!,
    sport: sport?.name ?? null,
    sportSlug: sport?.slug ?? null,
  }));
}

/**
 * A factual start for a recap from a final score: who, the score, where,
 * when. No athlete names (SPEC §8: names wait for the coach). Null when the
 * game has no final.
 */
export function factsFromGame(game: GameView): { title: string; body: string } | null {
  const r = result(game);
  if (!r || game.scoreUs === null || game.scoreThem === null) return null;
  const score = `${Math.max(game.scoreUs, game.scoreThem)}–${Math.min(game.scoreUs, game.scoreThem)}`;
  const verb = r === "W" ? "beat" : r === "L" ? "fell to" : "tied";
  const where = game.homeAway === "home" ? "at home" : game.homeAway === "away" ? "on the road" : "at a neutral site";
  const title = `${game.mascot} ${verb} ${game.opponent} ${score}`;
  const body = `${game.schoolShortName} ${verb} ${game.opponent} ${score} ${where} on ${formatLongDate(game.startDate)}.`;
  return { title, body };
}

/** One published story by its school and slug, or null. */
export async function getPublishedStory(db: Db, schoolId: string, slug: string): Promise<PublishedStory | null> {
  const rows = await listPublishedStories(db, { schoolId, limit: 200 });
  return rows.find((r) => r.slug === slug) ?? null;
}
