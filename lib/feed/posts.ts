// The team feed (SPEC §7, design/PHS-Feed-Mobile.dc.html,
// CMS-Sideline-Mobile.dc.html): short posts from coaches, as a photo, a
// score update or a note. Posts go live at once, except an AI agent's, which
// wait for a person. Score updates are words; the game's score stays whatever
// Arbiter says. No likes or comments.

import { randomUUID } from "node:crypto";

import { and, asc, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { recordChange } from "../audit";
import type { Db } from "../db/client";
import * as s from "../db/schema";
import { can, type Scope } from "../permissions";
import { fileName } from "../photos/albums";
import { processPhoto } from "../photos/ingest";
import type { PhotoStorage } from "../photos/storage";
import { opponentLine, type GameView } from "../schedule/games";
import { formatShortDate, pacificDate } from "../schedule/time";
import { PermissionError, ValidationError } from "../studio/errors";
import type { Ctx } from "../studio/team-content";

export const MAX_POST_PHOTOS = 4;

export interface PostInput {
  teamId: string;
  kind: "photo" | "score" | "note";
  body?: string;
  gameId?: string | null;
  photos?: { data: Buffer; altText: string }[];
}

async function teamScope(db: Db, teamId: string): Promise<Scope> {
  const [team] = await db.select({ schoolId: s.team.schoolId }).from(s.team).where(eq(s.team.id, teamId));
  if (!team) throw new ValidationError("That team doesn't exist.");
  return { schoolId: team.schoolId, teamId };
}

/** The team's published "Sideline" album for the day, created when needed. */
async function sidelineAlbum(ctx: Ctx, scope: Scope, gameId: string | null) {
  const title = `Sideline · ${formatShortDate(pacificDate(ctx.now))}`;
  const [existing] = await ctx.db
    .select()
    .from(s.album)
    .where(and(eq(s.album.teamId, scope.teamId!), eq(s.album.title, title)));
  if (existing) return existing;
  const [created] = await ctx.db
    .insert(s.album)
    .values({ teamId: scope.teamId!, gameId, title, createdBy: ctx.actor.personId, status: "published", publishedAt: ctx.now })
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "create", objectType: "album", objectId: created!.id, scope, before: null, after: created!, now: ctx.now });
  return created!;
}

export async function createPost(ctx: Ctx, storage: PhotoStorage, input: PostInput) {
  const scope = await teamScope(ctx.db, input.teamId);
  if (!can(ctx.actor, "feed.post", scope)) throw new PermissionError("Only this team's coaches can post to its feed.");
  const body = (input.body ?? "").trim();
  if (body.length > 500) throw new ValidationError("Keep posts to 500 characters or fewer.");
  const photos = input.photos ?? [];
  if (input.kind !== "photo" && !body) throw new ValidationError("Write something to post.");
  if (input.kind === "photo") {
    if (!photos.length) throw new ValidationError("Add at least one photo.");
    if (photos.length > MAX_POST_PHOTOS) throw new ValidationError(`Post up to ${MAX_POST_PHOTOS} photos at a time. Use an album for more.`);
    if (photos.some((p) => !p.altText.trim())) throw new ValidationError("Every photo needs an image description.");
    if (photos.some((p) => p.altText.trim().length > 300)) throw new ValidationError("Keep each image description to 300 characters or fewer.");
    if (ctx.actor.agentConnectionId) throw new ValidationError("Photo posts come from a person. An assistant can draft the words.");
  }
  if (input.kind === "score" && !input.gameId) throw new ValidationError("Pick the game this score is from.");
  let gameId: string | null = null;
  if (input.gameId) {
    const [game] = await ctx.db.select({ teamId: s.game.teamId }).from(s.game).where(eq(s.game.id, input.gameId));
    if (!game || game.teamId !== input.teamId) throw new ValidationError("Pick one of this team's games, or none.");
    gameId = input.gameId;
  }
  // Agents propose; people publish.
  const publishedAt = ctx.actor.agentConnectionId ? null : ctx.now;

  // Check every photo before anything is stored.
  const processed = await Promise.all(photos.map((p) => processPhoto(p.data)));

  const [post] = await ctx.db
    .insert(s.feedPost)
    .values({ teamId: input.teamId, kind: input.kind, body: body || null, gameId, authorId: ctx.actor.personId, publishedAt })
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "post", objectType: "feed_post", objectId: post!.id, scope, before: null, after: post!, now: ctx.now });

  if (processed.length) {
    const album = await sidelineAlbum(ctx, scope, gameId);
    for (const [i, p] of processed.entries()) {
      const id = randomUUID();
      const storageKey = `p/${id}`;
      for (const v of p.variants) await storage.put(`${storageKey}/${fileName[v.name]}`, v.data);
      const sizes: s.PhotoSizes = {};
      for (const v of p.variants) if (v.name !== "original") sizes[v.name] = { key: `${storageKey}/${fileName[v.name]}`, width: v.width, height: v.height };
      const [row] = await ctx.db
        .insert(s.photo)
        .values({
          id,
          albumId: album.id,
          storageKey,
          sizes,
          width: p.width,
          height: p.height,
          takenAt: p.takenAt,
          altText: photos[i]!.altText.trim().replace(/\s+/g, " "),
          uploadedBy: ctx.actor.personId,
          publishedAt: ctx.now,
        })
        .returning();
      await ctx.db.insert(s.feedPostPhoto).values({ postId: post!.id, photoId: id, position: i });
      await recordChange(ctx.db, { actor: ctx.actor, verb: "upload", objectType: "photo", objectId: id, scope, before: null, after: row!, now: ctx.now });
    }
    if (!album.coverPhotoId) {
      const [first] = await ctx.db.select({ photoId: s.feedPostPhoto.photoId }).from(s.feedPostPhoto).where(eq(s.feedPostPhoto.postId, post!.id)).orderBy(asc(s.feedPostPhoto.position));
      await ctx.db.update(s.album).set({ coverPhotoId: first!.photoId }).where(eq(s.album.id, album.id));
    }
  }
  return post!;
}

/** Take a post off the feed (it becomes a draft, so undo brings it back). The author, the head coach or an AD. */
export async function removePost(ctx: Ctx, postId: string) {
  const [before] = await ctx.db.select().from(s.feedPost).where(eq(s.feedPost.id, postId));
  if (!before) throw new ValidationError("That post doesn't exist.");
  const scope = await teamScope(ctx.db, before.teamId);
  const ownPost = before.authorId === ctx.actor.personId && can(ctx.actor, "feed.post", scope);
  if (!ownPost && !can(ctx.actor, "team.edit", scope) && !can(ctx.actor, "content.takedown", scope)) {
    throw new PermissionError("Only the person who posted it, the head coach or an athletic director can remove this post.");
  }
  const [after] = await ctx.db.update(s.feedPost).set({ publishedAt: null }).where(eq(s.feedPost.id, postId)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "remove", objectType: "feed_post", objectId: postId, scope, before, after: after!, now: ctx.now });
  return after!;
}

/** Publish a draft post (an assistant's). A person with feed.post on the team; never an agent. */
export async function publishPost(ctx: Ctx, postId: string) {
  if (ctx.actor.agentConnectionId) throw new PermissionError("A person publishes posts. Open the Studio to publish this one.");
  const [before] = await ctx.db.select().from(s.feedPost).where(eq(s.feedPost.id, postId));
  if (!before) throw new ValidationError("That post doesn't exist.");
  const scope = await teamScope(ctx.db, before.teamId);
  if (!can(ctx.actor, "feed.post", scope)) throw new PermissionError("Only this team's coaches can publish to its feed.");
  const [after] = await ctx.db.update(s.feedPost).set({ publishedAt: before.publishedAt ?? ctx.now }).where(eq(s.feedPost.id, postId)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "publish", objectType: "feed_post", objectId: postId, scope, before, after: after!, now: ctx.now });
  return after!;
}

export interface FeedPhoto {
  id: string;
  altText: string;
  width: number;
  height: number;
}

export interface FeedItem {
  id: string;
  teamId: string;
  kind: "photo" | "score" | "note";
  body: string | null;
  gameId: string | null;
  publishedAt: Date;
  sport: string;
  sportSlug: string;
  level: (typeof s.levelEnum.enumValues)[number];
  photos: FeedPhoto[];
}

/** Published posts at a school, newest first, optionally for some teams. Photo posts whose photos are all gone are left out. */
export async function listFeed(db: Db, { schoolId, teamIds, limit = 30 }: { schoolId: string; teamIds?: string[]; limit?: number }): Promise<FeedItem[]> {
  if (teamIds && !teamIds.length) return [];
  const rows = await db
    .select({ post: s.feedPost, sport: s.sport, level: s.team.level })
    .from(s.feedPost)
    .innerJoin(s.team, eq(s.feedPost.teamId, s.team.id))
    .innerJoin(s.sport, eq(s.team.sportId, s.sport.id))
    .where(and(eq(s.team.schoolId, schoolId), isNotNull(s.feedPost.publishedAt), teamIds ? inArray(s.feedPost.teamId, teamIds) : undefined))
    .orderBy(desc(s.feedPost.publishedAt))
    .limit(limit);
  if (!rows.length) return [];
  const photos = await db
    .select({ postId: s.feedPostPhoto.postId, position: s.feedPostPhoto.position, photo: s.photo })
    .from(s.feedPostPhoto)
    .innerJoin(s.photo, eq(s.feedPostPhoto.photoId, s.photo.id))
    .where(
      and(
        inArray(s.feedPostPhoto.postId, rows.map((r) => r.post.id)),
        isNotNull(s.photo.publishedAt),
        isNull(s.photo.hiddenReason),
        isNull(s.photo.heldReason),
      ),
    )
    .orderBy(asc(s.feedPostPhoto.position));
  return rows
    .map(({ post, sport, level }) => ({
      id: post.id,
      teamId: post.teamId,
      kind: post.kind,
      body: post.body,
      gameId: post.gameId,
      publishedAt: post.publishedAt!,
      sport: sport.name,
      sportSlug: sport.slug,
      level,
      photos: photos
        .filter((p) => p.postId === post.id)
        .map(({ photo }) => ({ id: photo.id, altText: photo.altText ?? "", width: photo.width, height: photo.height })),
    }))
    .filter((p) => p.kind !== "photo" || p.photos.length > 0 || p.body);
}

/** "vs Capital, Tue, Oct 6" for each game id, for post headers. */
export function gameLabels(games: GameView[]): Record<string, string> {
  return Object.fromEntries(games.map((g) => [g.id, `${opponentLine(g)}, ${formatShortDate(g.startDate)}`]));
}
