"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStudio } from "../../../lib/studio/context";
import { PermissionError, ValidationError } from "../../../lib/studio/errors";
import { createStory, publishStory, unpublishStory, updateStory } from "../../../lib/studio/stories";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

function fail(error: unknown, back: string): never {
  if (error instanceof ValidationError || error instanceof PermissionError) redirect(`${back}${back.includes("?") ? "&" : "?"}error=${encodeURIComponent(error.message)}`);
  throw error;
}

function refreshPublic() {
  // Stories show on school homes, team pages and story pages.
  revalidatePath("/[school]", "layout");
}

export async function createStoryAction(form: FormData) {
  const ctx = await requireStudio("/studio/stories/new");
  let id: string;
  try {
    const story = await createStory(ctx, {
      teamId: field(form, "teamId"),
      gameId: field(form, "gameId") || null,
      title: field(form, "title"),
      summary: field(form, "summary"),
      body: field(form, "body"),
    });
    id = story.id;
  } catch (error) {
    fail(error, `/studio/stories/new?team=${encodeURIComponent(field(form, "teamId"))}`);
  }
  redirect(`/studio/stories/${id}?saved=${encodeURIComponent("Draft saved. Only people in the Studio can see it.")}`);
}

export async function saveStoryAction(id: string, form: FormData) {
  const ctx = await requireStudio(`/studio/stories/${id}`);
  try {
    await updateStory(ctx, id, { title: field(form, "title"), summary: field(form, "summary"), body: field(form, "body") });
  } catch (error) {
    fail(error, `/studio/stories/${id}`);
  }
  refreshPublic();
  redirect(`/studio/stories/${id}?saved=${encodeURIComponent("Saved.")}`);
}

export async function publishStoryAction(id: string) {
  const ctx = await requireStudio(`/studio/stories/${id}`);
  try {
    await publishStory(ctx, id);
  } catch (error) {
    fail(error, `/studio/stories/${id}`);
  }
  refreshPublic();
  redirect(`/studio/stories/${id}?saved=${encodeURIComponent("Published to the team page and school home.")}`);
}

export async function unpublishStoryAction(id: string) {
  const ctx = await requireStudio(`/studio/stories/${id}`);
  try {
    await unpublishStory(ctx, id);
  } catch (error) {
    fail(error, `/studio/stories/${id}`);
  }
  refreshPublic();
  redirect(`/studio/stories/${id}?saved=${encodeURIComponent("Unpublished. It's a draft again.")}`);
}
