"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAlbum,
  decideReport,
  describePhoto,
  publishAlbum,
  releasePhoto,
  removePhoto,
  setAlbumGame,
  unpublishAlbum,
} from "../../../lib/photos/albums";
import { requireStudio } from "../../../lib/studio/context";
import { PermissionError, ValidationError } from "../../../lib/studio/errors";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");
const withParam = (url: string, key: string, value: string) => `${url}${url.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;

function fail(error: unknown, url: string): never {
  if (error instanceof ValidationError || error instanceof PermissionError) redirect(withParam(url, "error", error.message));
  throw error;
}

function refreshPublic() {
  // Albums show on team pages and school photo pages.
  revalidatePath("/[school]", "layout");
}

async function run(url: string, saved: string, change: (ctx: Awaited<ReturnType<typeof requireStudio>>) => Promise<unknown>) {
  const ctx = await requireStudio(url);
  try {
    await change(ctx);
  } catch (error) {
    fail(error, url);
  }
  refreshPublic();
  redirect(withParam(url, "saved", saved));
}

export async function createAlbumAction(form: FormData) {
  const ctx = await requireStudio("/studio/photos/new");
  let id: string;
  try {
    id = (await createAlbum(ctx, { teamId: field(form, "teamId"), title: field(form, "title"), gameId: field(form, "gameId") || null })).id;
  } catch (error) {
    fail(error, `/studio/photos/new?team=${encodeURIComponent(field(form, "teamId"))}`);
  }
  redirect(`/studio/photos/${id}?saved=${encodeURIComponent("Album started. Add photos below.")}`);
}

export async function describePhotoAction(albumId: string, photoId: string, form: FormData) {
  await run(`/studio/photos/${albumId}`, "Description saved.", (ctx) => describePhoto(ctx, photoId, field(form, "altText")));
}

export async function releasePhotoAction(albumId: string, photoId: string) {
  await run(`/studio/photos/${albumId}`, "Photo released. It posts when you publish.", (ctx) => releasePhoto(ctx, photoId));
}

export async function removePhotoAction(albumId: string, photoId: string) {
  await run(`/studio/photos/${albumId}`, "Photo removed from the album.", (ctx) => removePhoto(ctx, photoId));
}

export async function publishAlbumAction(albumId: string) {
  await run(`/studio/photos/${albumId}`, "Published to the team page and the school photo page.", (ctx) => publishAlbum(ctx, albumId));
}

export async function unpublishAlbumAction(albumId: string) {
  await run(`/studio/photos/${albumId}`, "Unpublished. The album is a draft again.", (ctx) => unpublishAlbum(ctx, albumId));
}

export async function setAlbumGameAction(albumId: string, form: FormData) {
  await run(`/studio/photos/${albumId}`, "Game saved.", (ctx) => setAlbumGame(ctx, albumId, field(form, "gameId") || null));
}

export async function decideReportAction(reportId: string, decision: "kept" | "removed") {
  await run(
    "/studio/photos",
    decision === "kept" ? "Photo restored to the site." : "Photo stays down.",
    (ctx) => decideReport(ctx, reportId, decision),
  );
}
