import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getAuth } from "../../../../lib/auth/server";
import { appDb } from "../../../../lib/data/db";
import { createPost, MAX_POST_PHOTOS, type PostInput } from "../../../../lib/feed/posts";
import { loadActor } from "../../../../lib/permissions";
import { photoStorage } from "../../../../lib/photos/storage";
import { currentTime, pacificDate } from "../../../../lib/schedule/time";
import { PermissionError, ValidationError } from "../../../../lib/studio/errors";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_POST_PHOTOS * MAX_FILE_BYTES + 1024 * 1024;
const KINDS = new Set(["photo", "score", "note"]);

const back = (request: Request, key: "saved" | "error", message: string, team?: string) =>
  Response.redirect(new URL(`/studio/post?${team ? `team=${encodeURIComponent(team)}&` : ""}${key}=${encodeURIComponent(message)}`, request.url), 303);

/**
 * Sideline posting (design/CMS-Sideline-Mobile.dc.html). A route handler so
 * phone photos can be larger than a server action allows (DECISIONS 92).
 */
export async function POST(request: Request) {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) return Response.redirect(new URL("/sign-in?next=%2Fstudio%2Fpost", request.url), 303);
  if (Number(requestHeaders.get("content-length") ?? 0) > MAX_REQUEST_BYTES) return back(request, "error", `Post up to ${MAX_POST_PHOTOS} photos of 25 MB each.`);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back(request, "error", "That post didn't come through. Try again.");
  }
  const field = (name: string) => String(form.get(name) ?? "");
  const teamId = field("teamId");
  const kind = field("kind");
  if (!KINDS.has(kind)) return back(request, "error", "Pick photos, a score update or a note.", teamId);

  const photos: NonNullable<PostInput["photos"]> = [];
  if (kind === "photo") {
    for (let i = 1; i <= MAX_POST_PHOTOS; i++) {
      const file = form.get(`photo${i}`);
      if (!(file instanceof File) || file.size === 0) continue;
      if (file.size > MAX_FILE_BYTES) return back(request, "error", "Each photo must be 25 MB or smaller.", teamId);
      photos.push({ data: Buffer.from(await file.arrayBuffer()), altText: field(`alt${i}`) });
    }
  }

  const db = await appDb();
  const now = currentTime();
  const actor = await loadActor(db, session.user.id, pacificDate(now));
  try {
    await createPost({ db, actor, now }, photoStorage(), {
      teamId,
      kind: kind as PostInput["kind"],
      body: field("body"),
      gameId: field("gameId") || null,
      photos,
    });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof PermissionError) return back(request, "error", error.message, teamId);
    throw error;
  }
  revalidatePath("/[school]", "layout");
  return back(request, "saved", "Posted to the team feed.", teamId);
}
