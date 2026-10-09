import { headers } from "next/headers";

import { getAuth } from "../../../../lib/auth/server";
import { appDb } from "../../../../lib/data/db";
import { can, loadActor } from "../../../../lib/permissions";
import { fileName, photoForServing } from "../../../../lib/photos/albums";
import { photoStorage } from "../../../../lib/photos/storage";
import { currentTime, pacificDate } from "../../../../lib/schedule/time";

const SIZES = new Set(["thumb", "card", "full"] as const);
type Size = "thumb" | "card" | "full";

const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

/**
 * Photo files by id and size. Published photos are public (short cache, so a
 * report or removal takes effect quickly). Held or draft photos are only for
 * people in the Studio who can work on that team. The private full-size copy
 * is never served here.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ photo: string; size: string }> }) {
  const { photo, size } = await params;
  if (!SIZES.has(size as Size)) return notFound();
  const requestHeaders = await headers();
  const db = await appDb();
  const served = await photoForServing(db, photo);
  if (!served) return notFound();

  if (!served.isPublic) {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) return notFound();
    const actor = await loadActor(db, session.user.id, pacificDate(currentTime()));
    const scope = { schoolId: served.schoolId, teamId: served.teamId };
    if (!can(actor, "photo.upload", scope) && !can(actor, "content.takedown", scope)) return notFound();
  }

  const data = await photoStorage().get(`${served.storageKey}/${fileName[size as Size]}`);
  if (!data) return notFound();
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": served.isPublic ? "public, max-age=300" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
