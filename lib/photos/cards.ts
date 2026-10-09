// Album cards for the public site: published albums with their game's result.

import { eq } from "drizzle-orm";

import { appDb } from "../data/db";
import { listGames, listSchools } from "../data/queries";
import type { Db } from "../db/client";
import * as s from "../db/schema";
import { result, type GameView } from "../schedule/games";
import { getPublishedAlbum, listPublishedAlbums, type PublicAlbum } from "./albums";

export type AlbumCard = PublicAlbum & { result: string | null };

/** "W 31–28" for a final, else null. Never invented: no final, no label. */
export function resultLabel(game: GameView | undefined): string | null {
  if (!game) return null;
  const r = result(game);
  if (!r || game.scoreUs === null || game.scoreThem === null) return null;
  return `${r} ${game.scoreUs}–${game.scoreThem}`;
}

export async function albumCards(db: Db, { schoolId, teamId, limit }: { schoolId: string; teamId?: string; limit?: number }): Promise<AlbumCard[]> {
  const [albums, games] = await Promise.all([listPublishedAlbums(db, { schoolId, teamId, limit }), listGames(db, { schoolId })]);
  return albums.map((a) => ({ ...a, result: resultLabel(games.find((g) => g.id === a.gameId)) }));
}

/**
 * A published album with its visible photos, found only under its own
 * school's address, with the team and game it belongs to. Null otherwise.
 */
export async function loadPublicAlbum(slug: string, albumId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(albumId)) return null;
  const db = await appDb();
  const schools = await listSchools(db);
  const school = schools.find((x) => x.slug === slug);
  const other = schools.find((x) => x.slug !== slug);
  const found = await getPublishedAlbum(db, albumId);
  if (!school || !other || !found || found.schoolId !== school.id || !found.photos.length) return null;
  const [team] = await db
    .select({ sport: s.sport.name, sportSlug: s.sport.slug })
    .from(s.team)
    .innerJoin(s.sport, eq(s.team.sportId, s.sport.id))
    .where(eq(s.team.id, found.album.teamId));
  const game = (await listGames(db, { schoolId: school.id })).find((g) => g.id === found.album.gameId);
  return { school, other, album: found.album, photos: found.photos, game, sport: team?.sport ?? "", sportSlug: team?.sportSlug ?? "" };
}
