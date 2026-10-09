"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Role } from "../../../lib/permissions";
import { requireStudio } from "../../../lib/studio/context";
import { PermissionError, ValidationError } from "../../../lib/studio/errors";
import { assignRole, endRole, roleNames } from "../../../lib/studio/people";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");
const back = (form: FormData) => {
  const school = field(form, "view");
  return school ? `/studio/people?school=${encodeURIComponent(school)}` : "/studio/people";
};
const withParam = (url: string, key: string, value: string) => `${url}${url.includes("?") ? "&" : "?"}${key}=${encodeURIComponent(value)}`;

function fail(error: unknown, url: string): never {
  if (error instanceof ValidationError || error instanceof PermissionError) redirect(withParam(url, "error", error.message));
  throw error;
}

export async function assignRoleAction(form: FormData) {
  const ctx = await requireStudio("/studio/people");
  const role = field(form, "role") as Role;
  if (!(role in roleNames)) fail(new ValidationError("Pick a role."), back(form));
  try {
    await assignRole(ctx, {
      email: field(form, "email"),
      name: field(form, "name"),
      role,
      schoolId: field(form, "schoolId") || undefined,
      teamId: field(form, "teamId") || undefined,
      startsOn: field(form, "startsOn"),
      endsOn: field(form, "endsOn") || undefined,
    });
  } catch (error) {
    fail(error, back(form));
  }
  revalidatePath("/studio", "layout");
  redirect(withParam(back(form), "saved", `Added ${field(form, "name").trim()} as ${roleNames[role].toLowerCase()}. They sign in with Google.`));
}

export async function endRoleAction(assignmentId: string, form: FormData) {
  const ctx = await requireStudio("/studio/people");
  let ended: Awaited<ReturnType<typeof endRole>>;
  try {
    ended = await endRole(ctx, assignmentId);
  } catch (error) {
    fail(error, back(form));
  }
  revalidatePath("/studio", "layout");
  redirect(withParam(back(form), "saved", ended ? "Access ended today." : "Removed before it started."));
}
