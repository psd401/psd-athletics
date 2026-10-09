// Albums and photos (SPEC §7). Coaches publish their own albums; volunteer
// photographers' uploads wait for the coach; nothing publishes without an
// image description; a family report hides a photo at once. Every Studio
// change is audited and can be undone. The MCP server will call these too.

import { randomUUID } from "node:crypto";

import { and, asc, count, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { recordChange } from "../audit";
import type { Db } from "../db/client";
import * as s from "../db/schema";
import { can, type Action, type Scope } from "../permissions";
import { pacificInstant } from "../schedule/time";
import { PermissionError, ValidationError } from "../studio/errors";
import type { Ctx } from "../studio/team-content";
import { processPhoto } from "./ingest";
import type { PhotoStorage } from "./storage";

export const HELD_FOR_COACH = "Waiting for the coach to review";
const REPORTED = "Reported by a family; waiting for review";
const REMOVED = "Removed in the Studio";
const REMOVED_AFTER_REPORT = "Removed after a report";

const FILE_NAMES = { thumb: "thumb.webp", card: "card.webp", full: "full.webp", original: "original.jpg" } as const;
export const fileName = FILE_NAMES;

async function teamScope(db: Db, teamId: string): Promise<Scope> {
  const [team] = await db.select({ schoolId: s.team.schoolId }).from(s.team).where(eq(s.team.id, teamId));
  if (!team) throw new ValidationError("That team doesn't exist.");
  return { schoolId: team.schoolId, teamId };
}

async function loadAlbum(db: Db, albumId: string) {
  const [album] = await db.select().from(s.album).where(eq(s.album.id, albumId));
  if (!album) throw new ValidationError("That album doesn't exist.");
  return { album, scope: await teamScope(db, album.teamId) };
}

async function loadPhoto(db: Db, photoId: string) {
  const [row] = await db.select({ photo: s.photo, album: s.album }).from(s.photo).innerJoin(s.album, eq(s.photo.albumId, s.album.id)).where(eq(s.photo.id, photoId));
  if (!row) throw new ValidationError("That photo doesn't exist.");
  return { ...row, scope: await teamScope(db, row.album.teamId) };
}

function need(ctx: Ctx, actions: Action[], scope: Scope, message: string) {
  if (!actions.some((a) => can(ctx.actor, a, scope))) throw new PermissionError(message);
}

const COACH_ONLY = "Only the head coach or an athletic director can do that.";

export async function createAlbum(ctx: Ctx, input: { teamId: string; title: string; gameId?: string | null }) {
  const scope = await teamScope(ctx.db, input.teamId);
  need(ctx, ["photo.upload"], scope, "You can't add photos for this team.");
  const title = input.title.trim();
  if (!title) throw new ValidationError("The album needs a title.");
  if (title.length > 120) throw new ValidationError("The title must be 120 characters or fewer.");
  let gameId: string | null = null;
  if (input.gameId) {
    const [game] = await ctx.db.select({ teamId: s.game.teamId }).from(s.game).where(eq(s.game.id, input.gameId));
    if (!game || game.teamId !== input.teamId) throw new ValidationError("Pick one of this team's games, or none.");
    gameId = input.gameId;
  }
  const [row] = await ctx.db.insert(s.album).values({ teamId: input.teamId, gameId, title, createdBy: ctx.actor.personId }).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "create", objectType: "album", objectId: row!.id, scope, before: null, after: row!, now: ctx.now });
  return row!;
}

/**
 * Process and store photos. Every file is checked before any is stored, so a
 * bad file in a batch stores nothing. People who can't publish albums have
 * their photos held for the coach.
 */
export async function addPhotos(ctx: Ctx, storage: PhotoStorage, albumId: string, files: Buffer[]) {
  const { scope } = await loadAlbum(ctx.db, albumId);
  need(ctx, ["photo.upload"], scope, "You can't add photos for this team.");
  if (files.length === 0) throw new ValidationError("Choose at least one photo.");
  const processed = await Promise.all(files.map((f) => processPhoto(f)));
  const held = can(ctx.actor, "album.publish", scope) ? null : HELD_FOR_COACH;

  const rows = [];
  for (const p of processed) {
    const id = randomUUID();
    const storageKey = `p/${id}`;
    for (const v of p.variants) await storage.put(`${storageKey}/${FILE_NAMES[v.name]}`, v.data);
    const sizes: s.PhotoSizes = {};
    for (const v of p.variants) if (v.name !== "original") sizes[v.name] = { key: `${storageKey}/${FILE_NAMES[v.name]}`, width: v.width, height: v.height };
    const [row] = await ctx.db
      .insert(s.photo)
      .values({ id, albumId, storageKey, sizes, width: p.width, height: p.height, takenAt: p.takenAt, heldReason: held, uploadedBy: ctx.actor.personId })
      .returning();
    await recordChange(ctx.db, { actor: ctx.actor, verb: "upload", objectType: "photo", objectId: id, scope, before: null, after: row!, now: ctx.now });
    rows.push(row!);
  }
  return rows;
}

/** Image descriptions: the coach, or the person who uploaded the photo. */
export async function describePhoto(ctx: Ctx, photoId: string, altText: string) {
  const { photo: before, scope } = await loadPhoto(ctx.db, photoId);
  const mine = before.uploadedBy === ctx.actor.personId && can(ctx.actor, "photo.upload", scope);
  if (!mine) need(ctx, ["album.publish", "content.takedown"], scope, COACH_ONLY);
  const text = altText.trim().replace(/\s+/g, " ");
  if (!text) throw new ValidationError("The image description can't be empty.");
  if (text.length > 300) throw new ValidationError("Keep the image description to 300 characters or fewer.");
  const [after] = await ctx.db.update(s.photo).set({ altText: text }).where(eq(s.photo.id, photoId)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "describe", objectType: "photo", objectId: photoId, scope, before, after: after!, now: ctx.now });
  return after!;
}

export async function releasePhoto(ctx: Ctx, photoId: string) {
  const { photo: before, scope } = await loadPhoto(ctx.db, photoId);
  need(ctx, ["album.publish"], scope, COACH_ONLY);
  const [after] = await ctx.db.update(s.photo).set({ heldReason: null }).where(eq(s.photo.id, photoId)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "release", objectType: "photo", objectId: photoId, scope, before, after: after!, now: ctx.now });
  return after!;
}

/** Take a photo off the site. Files are kept so the removal can be undone. */
export async function removePhoto(ctx: Ctx, photoId: string) {
  const { photo: before, scope } = await loadPhoto(ctx.db, photoId);
  const ownDraft = before.uploadedBy === ctx.actor.personId && before.publishedAt === null;
  if (!ownDraft) need(ctx, ["album.publish", "content.takedown"], scope, COACH_ONLY);
  const [after] = await ctx.db.update(s.photo).set({ hiddenReason: REMOVED }).where(eq(s.photo.id, photoId)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "remove", objectType: "photo", objectId: photoId, scope, before, after: after!, now: ctx.now });
  return after!;
}

/** Publish an album: every photo that isn't held or removed goes live, and each must have a description. */
export async function publishAlbum(ctx: Ctx, albumId: string) {
  const { album: before, scope } = await loadAlbum(ctx.db, albumId);
  need(ctx, ["album.publish"], scope, "Publishing needs the head coach or an athletic director.");
  const ready = await ctx.db
    .select()
    .from(s.photo)
    .where(and(eq(s.photo.albumId, albumId), isNull(s.photo.heldReason), isNull(s.photo.hiddenReason)))
    .orderBy(asc(s.photo.takenAt), asc(s.photo.createdAt));
  if (!ready.length) throw new ValidationError("There are no photos ready to publish. Release or add photos first.");
  const missing = ready.filter((p) => !p.altText?.trim()).length;
  if (missing) {
    throw new ValidationError(`Add an image description to every photo before publishing. ${missing} ${missing === 1 ? "photo still needs" : "photos still need"} one.`);
  }
  const newIds = ready.filter((p) => !p.publishedAt).map((p) => p.id);
  if (newIds.length) await ctx.db.update(s.photo).set({ publishedAt: ctx.now }).where(inArray(s.photo.id, newIds));
  const cover = before.coverPhotoId && ready.some((p) => p.id === before.coverPhotoId) ? before.coverPhotoId : ready[0]!.id;
  const [after] = await ctx.db
    .update(s.album)
    .set({ status: "published", publishedAt: before.publishedAt ?? ctx.now, coverPhotoId: cover })
    .where(eq(s.album.id, albumId))
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "publish", objectType: "album", objectId: albumId, scope, before, after: after!, now: ctx.now });
  return after!;
}

export async function unpublishAlbum(ctx: Ctx, albumId: string) {
  const { album: before, scope } = await loadAlbum(ctx.db, albumId);
  need(ctx, ["album.publish", "content.takedown"], scope, COACH_ONLY);
  const [after] = await ctx.db.update(s.album).set({ status: "draft" }).where(eq(s.album.id, albumId)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "unpublish", objectType: "album", objectId: albumId, scope, before, after: after!, now: ctx.now });
  return after!;
}

// ------------------------------------------------------------ reports

/** A family's "Report this photo": hides it at once (SPEC §7). Public; no sign-in. */
export async function reportPhoto(db: Db, photoId: string, input: { contact: string; reason: string }, now: Date) {
  const served = await photoForServing(db, photoId);
  if (!served?.isPublic) throw new ValidationError("That photo isn't on the site.");
  const contact = input.contact.trim();
  const reason = input.reason.trim();
  if (!contact) throw new ValidationError("Add an email or phone number so we can follow up.");
  if (contact.length > 120) throw new ValidationError("The contact must be 120 characters or fewer.");
  if (!reason) throw new ValidationError("Tell us what's wrong with the photo.");
  if (reason.length > 500) throw new ValidationError("Keep the reason to 500 characters or fewer.");
  return db.transaction(async (tx) => {
    await tx.update(s.photo).set({ hiddenReason: REPORTED }).where(eq(s.photo.id, photoId));
    const [report] = await tx.insert(s.photoReport).values({ photoId, reporterContact: contact, reason, createdAt: now }).returning();
    return report!;
  });
}

export async function decideReport(ctx: Ctx, reportId: string, decision: "kept" | "removed") {
  const [report] = await ctx.db.select().from(s.photoReport).where(eq(s.photoReport.id, reportId));
  if (!report) throw new ValidationError("That report doesn't exist.");
  if (report.status !== "open") throw new ValidationError("That report was already decided.");
  const { photo: before, scope } = await loadPhoto(ctx.db, report.photoId);
  need(ctx, ["album.publish", "content.takedown"], scope, COACH_ONLY);
  const [after] = await ctx.db
    .update(s.photo)
    .set({ hiddenReason: decision === "kept" ? null : REMOVED_AFTER_REPORT })
    .where(eq(s.photo.id, report.photoId))
    .returning();
  const [decided] = await ctx.db
    .update(s.photoReport)
    .set({ status: decision, decidedBy: ctx.actor.personId, decidedAt: ctx.now })
    .where(eq(s.photoReport.id, reportId))
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: decision === "kept" ? "keep-after-report" : "remove-after-report", objectType: "photo", objectId: report.photoId, scope, before, after: after!, now: ctx.now });
  return decided!;
}

// ------------------------------------------------------------ reading

export interface PublicPhoto {
  id: string;
  altText: string;
  width: number;
  height: number;
  takenAt: Date | null;
  credit: string | null;
}

export interface PublicAlbum {
  id: string;
  title: string;
  teamId: string;
  gameId: string | null;
  sport: string;
  sportSlug: string;
  publishedAt: Date;
  photoCount: number;
  cover: PublicPhoto | null;
}

const visible = and(isNotNull(s.photo.publishedAt), isNull(s.photo.hiddenReason), isNull(s.photo.heldReason));

const toPublic = (p: typeof s.photo.$inferSelect): PublicPhoto => ({
  id: p.id,
  altText: p.altText ?? "",
  width: p.width,
  height: p.height,
  takenAt: p.takenAt,
  credit: p.credit,
});

/** Published albums with at least one visible photo, newest first. */
export async function listPublishedAlbums(db: Db, { schoolId, teamId, limit = 24 }: { schoolId: string; teamId?: string; limit?: number }): Promise<PublicAlbum[]> {
  const albums = await db
    .select({ album: s.album, sport: s.sport })
    .from(s.album)
    .innerJoin(s.team, eq(s.album.teamId, s.team.id))
    .innerJoin(s.sport, eq(s.team.sportId, s.sport.id))
    .where(and(eq(s.team.schoolId, schoolId), eq(s.album.status, "published"), teamId ? eq(s.album.teamId, teamId) : undefined))
    .orderBy(desc(s.album.publishedAt))
    .limit(limit);
  if (!albums.length) return [];
  const ids = albums.map((a) => a.album.id);
  const counts = await db.select({ albumId: s.photo.albumId, n: count() }).from(s.photo).where(and(inArray(s.photo.albumId, ids), visible)).groupBy(s.photo.albumId);
  const firsts = await db.select().from(s.photo).where(and(inArray(s.photo.albumId, ids), visible)).orderBy(asc(s.photo.takenAt), asc(s.photo.createdAt));
  return albums
    .map(({ album, sport }) => {
      const photoCount = counts.find((c) => c.albumId === album.id)?.n ?? 0;
      const cover = firsts.find((p) => p.id === album.coverPhotoId) ?? firsts.find((p) => p.albumId === album.id);
      return {
        id: album.id,
        title: album.title,
        teamId: album.teamId,
        gameId: album.gameId,
        sport: sport.name,
        sportSlug: sport.slug,
        publishedAt: album.publishedAt!,
        photoCount,
        cover: cover ? toPublic(cover) : null,
      };
    })
    .filter((a) => a.photoCount > 0);
}

export async function getPublishedAlbum(db: Db, albumId: string) {
  const [row] = await db
    .select({ album: s.album, schoolId: s.team.schoolId })
    .from(s.album)
    .innerJoin(s.team, eq(s.album.teamId, s.team.id))
    .where(and(eq(s.album.id, albumId), eq(s.album.status, "published")));
  if (!row) return null;
  const photos = await db.select().from(s.photo).where(and(eq(s.photo.albumId, albumId), visible)).orderBy(asc(s.photo.takenAt), asc(s.photo.createdAt));
  return { album: row.album, schoolId: row.schoolId, photos: photos.map(toPublic) };
}

/** What the media route needs: where the files are and whether anyone may see them. */
export async function photoForServing(db: Db, photoId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(photoId)) return null;
  const [row] = await db
    .select({ photo: s.photo, album: s.album, schoolId: s.team.schoolId })
    .from(s.photo)
    .innerJoin(s.album, eq(s.photo.albumId, s.album.id))
    .innerJoin(s.team, eq(s.album.teamId, s.team.id))
    .where(eq(s.photo.id, photoId));
  if (!row) return null;
  const { photo, album } = row;
  const isPublic = album.status === "published" && photo.publishedAt !== null && photo.hiddenReason === null && photo.heldReason === null;
  return { storageKey: photo.storageKey, isPublic, schoolId: row.schoolId, teamId: album.teamId };
}

// ------------------------------------------------------------ game matching

/** A photo belongs to a game taken from an hour before the start to four hours after. */
const BEFORE_MS = 60 * 60_000;
const AFTER_MS = 4 * 60 * 60_000;

/** The game most of the photos were taken during, or null (SPEC §7). Games without a start time never match. */
export function suggestGame(games: { id: string; startDate: string; startTime: string | null }[], takenAts: (Date | null)[]): string | null {
  const tally = new Map<string, number>();
  for (const t of takenAts) {
    if (!t) continue;
    for (const g of games) {
      if (!g.startTime) continue;
      const start = pacificInstant(g.startDate, g.startTime).getTime();
      if (t.getTime() >= start - BEFORE_MS && t.getTime() <= start + AFTER_MS) tally.set(g.id, (tally.get(g.id) ?? 0) + 1);
    }
  }
  const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
  if (!ranked.length || (ranked[1] && ranked[1][1] === ranked[0]![1])) return null;
  return ranked[0]![0];
}
