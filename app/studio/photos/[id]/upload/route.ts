import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getAuth } from "../../../../../lib/auth/server";
import { appDb } from "../../../../../lib/data/db";
import { loadActor } from "../../../../../lib/permissions";
import { addPhotos } from "../../../../../lib/photos/albums";
import { photoStorage } from "../../../../../lib/photos/storage";
import { currentTime, pacificDate } from "../../../../../lib/schedule/time";
import { PermissionError, ValidationError } from "../../../../../lib/studio/errors";

const MAX_FILES = 20;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILES * MAX_FILE_BYTES + 1024 * 1024;

const back = (request: Request, albumId: string, key: "saved" | "error", message: string) =>
  Response.redirect(new URL(`/studio/photos/${albumId}?${key}=${encodeURIComponent(message)}`, request.url), 303);

/**
 * Photo upload for an album. A route handler rather than a server action so
 * only this endpoint accepts large bodies. The session cookie is SameSite=Lax,
 * and the Origin must match, so other sites can't post here.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return Response.redirect(new URL(`/sign-in?next=${encodeURIComponent(`/studio/photos/${id}`)}`, request.url), 303);
  if (Number(requestHeaders.get("content-length") ?? 0) > MAX_REQUEST_BYTES) return back(request, id, "error", `Upload up to ${MAX_FILES} photos at a time.`);

  let files: File[];
  try {
    files = (await request.formData()).getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  } catch {
    return back(request, id, "error", "That upload didn't come through. Try again.");
  }
  if (!files.length) return back(request, id, "error", "Choose at least one photo.");
  if (files.length > MAX_FILES) return back(request, id, "error", `Upload up to ${MAX_FILES} photos at a time.`);
  if (files.some((f) => f.size > MAX_FILE_BYTES)) return back(request, id, "error", "Each photo must be 25 MB or smaller.");

  const db = await appDb();
  const now = currentTime();
  const actor = await loadActor(db, session.user.id, pacificDate(now));
  try {
    const buffers = await Promise.all(files.map(async (f) => Buffer.from(await f.arrayBuffer())));
    const added = await addPhotos({ db, actor, now }, photoStorage(), id, buffers);
    revalidatePath("/studio/photos");
    const held = added.filter((p) => p.heldReason).length;
    const note = held ? ` ${held === added.length ? "They're" : `${held} are`} held for the coach to review.` : "";
    return back(request, id, "saved", `Added ${added.length} ${added.length === 1 ? "photo" : "photos"}. Location data removed.${note}`);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof PermissionError) return back(request, id, "error", error.message);
    throw error;
  }
}
