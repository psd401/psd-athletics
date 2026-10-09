"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { PermissionError, ValidationError } from "../../../../lib/studio/errors";
import { requireStudio } from "../../../../lib/studio/context";
import {
  addDocument,
  addRosterEntry,
  addSponsor,
  postCoachNote,
  publishRoster,
  removeDocument,
  removeRosterEntry,
  removeSponsor,
} from "../../../../lib/studio/team-content";

type Step = (ctx: Awaited<ReturnType<typeof requireStudio>>, form: FormData) => Promise<string>;

/** Runs one team-page change and comes back to the page with a message. */
async function run(teamId: string, section: string, step: Step, form: FormData) {
  const page = `/studio/teams/${teamId}`;
  const ctx = await requireStudio(page);
  let message: string;
  let kind: "saved" | "error";
  try {
    message = await step(ctx, form);
    kind = "saved";
    revalidatePath(page);
  } catch (error) {
    if (!(error instanceof ValidationError || error instanceof PermissionError)) throw error;
    message = error.message;
    kind = "error";
  }
  redirect(`${page}?${kind}=${encodeURIComponent(message)}#${section}`);
}

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

export async function postNoteAction(teamId: string, form: FormData) {
  await run(teamId, "note", async (ctx, f) => {
    await postCoachNote(ctx, teamId, field(f, "body"));
    return "Note posted to the team page.";
  }, form);
}

export async function addRosterAction(teamId: string, form: FormData) {
  await run(teamId, "roster", async (ctx, f) => {
    const grade = field(f, "grade");
    await addRosterEntry(ctx, teamId, {
      displayName: field(f, "displayName"),
      jerseyNumber: field(f, "jerseyNumber"),
      position: field(f, "position"),
      grade: grade ? Number(grade) : null,
    });
    return "Added to the roster as a draft.";
  }, form);
}

export async function removeRosterAction(teamId: string, form: FormData) {
  await run(teamId, "roster", async (ctx, f) => {
    await removeRosterEntry(ctx, field(f, "id"));
    return "Removed from the roster.";
  }, form);
}

export async function publishRosterAction(teamId: string, form: FormData) {
  await run(teamId, "roster", async (ctx) => {
    const n = await publishRoster(ctx, teamId);
    return n ? `Published ${n} roster ${n === 1 ? "entry" : "entries"}.` : "Nothing new to publish.";
  }, form);
}

export async function addDocumentAction(teamId: string, form: FormData) {
  await run(teamId, "documents", async (ctx, f) => {
    await addDocument(ctx, teamId, { title: field(f, "title"), kind: field(f, "kind"), url: field(f, "url") });
    return "Document added to the team page.";
  }, form);
}

export async function removeDocumentAction(teamId: string, form: FormData) {
  await run(teamId, "documents", async (ctx, f) => {
    await removeDocument(ctx, field(f, "id"));
    return "Document removed.";
  }, form);
}

export async function addSponsorAction(teamId: string, form: FormData) {
  await run(teamId, "partners", async (ctx, f) => {
    await addSponsor(ctx, teamId, { name: field(f, "name"), url: field(f, "url") });
    return "Partner added.";
  }, form);
}

export async function removeSponsorAction(teamId: string, form: FormData) {
  await run(teamId, "partners", async (ctx, f) => {
    await removeSponsor(ctx, field(f, "id"));
    return "Partner removed.";
  }, form);
}
