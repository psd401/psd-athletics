// The MCP tools (SPEC §8), as plain functions over the same library the
// Studio uses, so permissions, validation and the audit log are shared.
// Agents propose; people publish: every write here makes a draft, and
// content_publish only says where the person publishes (DECISIONS 109).
// No student contact, medical or eligibility data is ever returned.

import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { SITE_URL } from "../config/site";
import type { Db } from "../db/client";
import * as s from "../db/schema";
import { listGames, type SchoolView, type TeamView } from "../data/queries";
import { createPost } from "../feed/posts";
import { can, type Actor, type Scope } from "../permissions";
import { resultLabel } from "../photos/cards";
import { memoryPhotoStorage } from "../photos/storage";
import { byStart, levelLabel } from "../schedule/games";
import { createStory, updateStory } from "../studio/stories";
import { PermissionError, ValidationError } from "../studio/errors";
import { addRosterEntry, removeRosterEntry, rosterFields } from "../studio/team-content";

export interface ToolContext {
  db: Db;
  actor: Actor;
  now: Date;
  schools: SchoolView[];
  teams: TeamView[];
}

const MAX_PAGE = 50;
const scope = (t: TeamView): Scope => ({ schoolId: t.schoolId, teamId: t.id });

function teamOf(ctx: ToolContext, teamId: string | undefined): TeamView {
  const team = ctx.teams.find((t) => t.id === teamId);
  if (!team) throw new ValidationError("No team with that id. Call psd_athletics_teams_list for ids.");
  return team;
}

function teamName(ctx: ToolContext, t: TeamView): string {
  const school = ctx.schools.find((x) => x.id === t.schoolId);
  return `${school?.shortName ?? ""} ${t.sport} · ${levelLabel[t.level]}`.trim();
}

const schoolSlug = (ctx: ToolContext, t: TeamView) => ctx.schools.find((x) => x.id === t.schoolId)?.slug ?? "";

/** Teams the person works with: coaching or photography grants, or every team at a school they run. */
function myTeams(ctx: ToolContext): TeamView[] {
  return ctx.teams.filter((t) => can(ctx.actor, "story.draft", scope(t)) || can(ctx.actor, "photo.upload", scope(t)));
}

// ---------------------------------------------------------------- read

export async function teamsList(ctx: ToolContext) {
  return {
    teams: myTeams(ctx).map((t) => {
      const sc = scope(t);
      const assistantCan = [
        can(ctx.actor, "story.draft", sc) ? "draft stories" : null,
        can(ctx.actor, "roster.edit", sc) ? "propose roster changes" : null,
        can(ctx.actor, "feed.post", sc) ? "draft feed posts" : null,
      ].filter((x): x is string => x !== null);
      return {
        team_id: t.id,
        school: ctx.schools.find((x) => x.id === t.schoolId)?.shortName ?? "",
        sport: t.sport,
        level: levelLabel[t.level],
        page: `${SITE_URL}/${schoolSlug(ctx, t)}/teams/${t.sportSlug}`,
        assistant_can: assistantCan,
        person_publishes: can(ctx.actor, "story.publish", sc),
      };
    }),
  };
}

export interface ScheduleInput {
  team_id?: string;
  from?: string;
  to?: string;
  cursor?: string;
  limit?: number;
}

/** Games for one team (any team: schedules are public) or the person's teams. Unknown values are null, never guessed. */
export async function scheduleGet(ctx: ToolContext, input: ScheduleInput) {
  const teams = input.team_id ? [teamOf(ctx, input.team_id)] : myTeams(ctx);
  const ids = new Set(teams.map((t) => t.id));
  const date = /^\d{4}-\d{2}-\d{2}$/;
  if ((input.from && !date.test(input.from)) || (input.to && !date.test(input.to))) throw new ValidationError("Dates look like 2026-10-09.");
  const all = (await listGames(ctx.db))
    .filter((g) => ids.has(g.teamId) && (!input.from || g.startDate >= input.from) && (!input.to || g.startDate <= input.to))
    .sort(byStart);
  const offset = Math.max(0, Number(input.cursor ?? 0) || 0);
  const limit = Math.min(MAX_PAGE, Math.max(1, input.limit ?? 20));
  const page = all.slice(offset, offset + limit);
  return {
    games: page.map((g) => ({
      game_id: g.id,
      team: teamName(ctx, ctx.teams.find((t) => t.id === g.teamId)!),
      date: g.startDate,
      start_time: g.startTime ? g.startTime.slice(0, 5) : null,
      opponent: g.opponent,
      home_or_away: g.homeAway,
      venue: g.venueName,
      status: g.status,
      result: resultLabel(g),
      game_page: `${SITE_URL}/${g.schoolSlug}/game/${g.id}`,
    })),
    next_cursor: offset + limit < all.length ? String(offset + limit) : null,
    total: all.length,
  };
}

/** What's waiting for the person to read and publish. */
export async function draftsList(ctx: ToolContext) {
  const teams = myTeams(ctx);
  const ids = teams.map((t) => t.id);
  if (!ids.length) return { stories: [], roster: [], feed_posts: [] };
  const [stories, roster, posts] = await Promise.all([
    ctx.db
      .select({ id: s.story.id, title: s.story.title, teamId: s.story.teamId, draftedByAgent: s.story.draftedByAgent })
      .from(s.story)
      .where(and(eq(s.story.status, "draft"), inArray(s.story.teamId, ids)))
      .orderBy(desc(s.story.updatedAt))
      .limit(MAX_PAGE),
    ctx.db.select({ teamId: s.rosterEntry.teamId }).from(s.rosterEntry).where(and(inArray(s.rosterEntry.teamId, ids), isNull(s.rosterEntry.publishedAt))),
    ctx.db
      .select({ id: s.feedPost.id, teamId: s.feedPost.teamId, body: s.feedPost.body, kind: s.feedPost.kind })
      .from(s.feedPost)
      .where(and(inArray(s.feedPost.teamId, ids), isNull(s.feedPost.publishedAt)))
      .orderBy(desc(s.feedPost.createdAt))
      .limit(MAX_PAGE),
  ]);
  const name = (id: string | null) => teamName(ctx, teams.find((t) => t.id === id)!);
  const counts = new Map<string, number>();
  for (const r of roster) counts.set(r.teamId, (counts.get(r.teamId) ?? 0) + 1);
  return {
    stories: stories.map((x) => ({ story_id: x.id, team: name(x.teamId), title: x.title, drafted_by_assistant: x.draftedByAgent, review_in_studio: `${SITE_URL}/studio/stories/${x.id}` })),
    roster: [...counts.entries()].map(([teamId, n]) => ({ team: name(teamId), unpublished_entries: n, review_in_studio: `${SITE_URL}/studio/teams/${teamId}` })),
    feed_posts: posts.map((p) => ({ post_id: p.id, team: name(p.teamId), kind: p.kind, body: p.body, review_in_studio: `${SITE_URL}/studio/post` })),
  };
}

// ---------------------------------------------------------------- drafts

export interface StoryDraftInput {
  story_id?: string;
  team_id?: string;
  game_id?: string;
  title: string;
  summary?: string;
  body: string;
  dry_run?: boolean;
}

export async function storyDraft(ctx: ToolContext, input: StoryDraftInput) {
  const dryRun = input.dry_run !== false;
  if (input.story_id) {
    const [story] = await ctx.db.select().from(s.story).where(eq(s.story.id, input.story_id));
    if (!story?.teamId) throw new ValidationError("No story with that id. Call psd_athletics_drafts_list for ids.");
    if (story.status === "published") throw new ValidationError("That story is published. A person edits published stories in the Studio.");
    if (!can(ctx.actor, "story.draft", { schoolId: story.schoolId, teamId: story.teamId })) throw new PermissionError("You can't edit stories for this team.");
    if (dryRun) return { dry_run: true, would: "update the draft story", story_id: story.id, title: input.title.trim(), note: "Call again with dry_run: false to save." };
    const saved = await updateStory(ctx, story.id, { title: input.title, summary: input.summary, body: input.body, gameId: input.game_id });
    return { dry_run: false, story_id: saved.id, status: saved.status, review_in_studio: `${SITE_URL}/studio/stories/${saved.id}` };
  }
  const team = teamOf(ctx, input.team_id);
  if (!can(ctx.actor, "story.draft", scope(team))) throw new PermissionError("You can't write stories for this team.");
  if (!input.title.trim() || !input.body.trim()) throw new ValidationError("A story needs a title and a body.");
  if (dryRun) return { dry_run: true, would: "create a draft story", team: teamName(ctx, team), title: input.title.trim(), note: "Call again with dry_run: false to save. It stays a draft until a person publishes it." };
  const saved = await createStory(ctx, { teamId: team.id, gameId: input.game_id ?? null, title: input.title, summary: input.summary, body: input.body });
  return { dry_run: false, story_id: saved.id, status: saved.status, review_in_studio: `${SITE_URL}/studio/stories/${saved.id}` };
}

export interface RosterUpdateInput {
  team_id: string;
  add?: { display_name: string; jersey_number?: string; position?: string; grade?: number }[];
  remove?: string[];
  dry_run?: boolean;
}

/** Directory information only (first name, last initial; jersey; position; grade). New rows stay unpublished. */
export async function rosterUpdate(ctx: ToolContext, input: RosterUpdateInput) {
  const team = teamOf(ctx, input.team_id);
  if (!can(ctx.actor, "roster.edit", scope(team))) throw new PermissionError("You can't edit the roster for this team.");
  const add = (input.add ?? []).slice(0, MAX_PAGE).map((a) => ({ displayName: a.display_name, jerseyNumber: a.jersey_number, position: a.position, grade: a.grade ?? null }));
  const checked = add.map((a) => rosterFields(a));
  const removeIds = (input.remove ?? []).slice(0, MAX_PAGE);
  const removing = removeIds.length ? await ctx.db.select().from(s.rosterEntry).where(inArray(s.rosterEntry.id, removeIds)) : [];
  for (const r of removing) {
    if (r.teamId !== team.id) throw new ValidationError("A roster entry belongs to another team.");
    if (r.publishedAt) throw new ValidationError(`${r.displayName} is on the published roster. A person removes published entries in the Studio.`);
  }
  if (removing.length !== removeIds.length) throw new ValidationError("A roster entry id wasn't found. Call psd_athletics_drafts_list or check the Studio.");
  if (input.dry_run !== false) {
    return { dry_run: true, would_add: checked.map((c) => c.displayName), would_remove: removing.map((r) => r.displayName), note: "Call again with dry_run: false to save." };
  }
  for (const a of add) await addRosterEntry(ctx, team.id, a);
  for (const r of removing) await removeRosterEntry(ctx, r.id);
  return {
    dry_run: false,
    added: add.length,
    removed: removing.length,
    note: "New entries stay off the site until a coach publishes the roster in the Studio.",
    review_in_studio: `${SITE_URL}/studio/teams/${team.id}`,
  };
}

export interface FeedPostInput {
  team_id: string;
  kind: "note" | "score";
  body: string;
  game_id?: string;
  dry_run?: boolean;
}

/** A note or score update for the team feed. From an assistant it's always a draft. */
export async function feedPost(ctx: ToolContext, input: FeedPostInput) {
  const team = teamOf(ctx, input.team_id);
  if (!can(ctx.actor, "feed.post", scope(team))) throw new PermissionError("Only this team's coaches can post to its feed.");
  if (input.dry_run !== false) return { dry_run: true, would: `draft a ${input.kind} for ${teamName(ctx, team)}`, body: input.body.trim(), note: "Call again with dry_run: false to save the draft." };
  // Photos never come through MCP (DECISIONS 109), so no storage is touched.
  const post = await createPost(ctx, memoryPhotoStorage(), { teamId: team.id, kind: input.kind, body: input.body, gameId: input.game_id ?? null });
  return { dry_run: false, post_id: post.id, status: post.publishedAt ? "published" : "draft", review_in_studio: `${SITE_URL}/studio/post` };
}

// ---------------------------------------------------------------- publish

export type PublishInput = { kind: "story"; id: string } | { kind: "roster"; team_id: string } | { kind: "feed_post"; id: string };

/** Never publishes. Returns the Studio page where the person reads and publishes, and whether they can. */
export async function contentPublish(ctx: ToolContext, input: PublishInput) {
  const why = "Agents propose; people publish. Open the link to read it and publish.";
  if (input.kind === "story") {
    const [story] = await ctx.db.select().from(s.story).where(eq(s.story.id, input.id));
    if (!story?.teamId) throw new ValidationError("No story with that id. Call psd_athletics_drafts_list for ids.");
    return { published: false, why, publish_in_studio: `${SITE_URL}/studio/stories/${story.id}`, you_can_publish: can(ctx.actor, "story.publish", { schoolId: story.schoolId, teamId: story.teamId }) };
  }
  if (input.kind === "roster") {
    const team = teamOf(ctx, input.team_id);
    return { published: false, why, publish_in_studio: `${SITE_URL}/studio/teams/${team.id}`, you_can_publish: can(ctx.actor, "roster.edit", scope(team)) };
  }
  const [post] = await ctx.db.select({ teamId: s.feedPost.teamId }).from(s.feedPost).where(eq(s.feedPost.id, input.id));
  if (!post) throw new ValidationError("No feed post with that id. Call psd_athletics_drafts_list for ids.");
  const team = teamOf(ctx, post.teamId);
  return { published: false, why, publish_in_studio: `${SITE_URL}/studio/post?team=${team.id}`, you_can_publish: can(ctx.actor, "feed.post", scope(team)) };
}
