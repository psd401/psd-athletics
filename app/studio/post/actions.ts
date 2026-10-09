"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { publishPost, removePost } from "../../../lib/feed/posts";
import { requireStudio } from "../../../lib/studio/context";
import { PermissionError, ValidationError } from "../../../lib/studio/errors";

export async function removePostAction(postId: string) {
  const ctx = await requireStudio("/studio/post");
  try {
    await removePost(ctx, postId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof PermissionError) redirect(`/studio/post?error=${encodeURIComponent(error.message)}`);
    throw error;
  }
  revalidatePath("/[school]", "layout");
  redirect(`/studio/post?saved=${encodeURIComponent("Post removed from the feed.")}`);
}

export async function publishPostAction(postId: string) {
  const ctx = await requireStudio("/studio/post");
  try {
    await publishPost(ctx, postId);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof PermissionError) redirect(`/studio/post?error=${encodeURIComponent(error.message)}`);
    throw error;
  }
  revalidatePath("/[school]", "layout");
  redirect(`/studio/post?saved=${encodeURIComponent("Published to the team feed.")}`);
}
