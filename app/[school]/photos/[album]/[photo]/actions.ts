"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appDb } from "../../../../../lib/data/db";
import { reportPhoto } from "../../../../../lib/photos/albums";
import { currentTime } from "../../../../../lib/schedule/time";
import { ValidationError } from "../../../../../lib/studio/errors";

/** "Report this photo": hides it at once (SPEC §7). No sign-in. */
export async function reportPhotoAction(slug: string, albumId: string, photoId: string, form: FormData) {
  const back = `/${slug}/photos/${albumId}/${photoId}`;
  try {
    await reportPhoto(await appDb(), photoId, { contact: String(form.get("contact") ?? ""), reason: String(form.get("reason") ?? "") }, currentTime());
  } catch (error) {
    if (error instanceof ValidationError) redirect(`${back}?error=${encodeURIComponent(error.message)}`);
    throw error;
  }
  revalidatePath("/[school]", "layout");
  revalidatePath("/studio/photos");
  redirect(`/${slug}/photos?reported=1`);
}
