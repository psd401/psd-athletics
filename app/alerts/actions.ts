"use server";

import { redirect } from "next/navigation";

import { confirmFollow, startFollow, stopFollow } from "../../lib/alerts/follow";
import { appSenders } from "../../lib/alerts/sender";
import { appDb } from "../../lib/data/db";
import { currentTime } from "../../lib/schedule/time";
import { ValidationError } from "../../lib/studio/errors";

const field = (form: FormData, name: string) => String(form.get(name) ?? "");
const isId = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

/** Every alerts sign-up form posts here: the hub, both school homes and /alerts. */
export async function startFollowAction(form: FormData) {
  const teamId = field(form, "teamId");
  let followerId: string;
  try {
    ({ followerId } = await startFollow(
      await appDb(),
      appSenders(),
      { contact: field(form, "contact"), teamIds: [teamId], wantsChanges: form.get("changes") === "on", wantsFinals: form.get("finals") === "on" },
      currentTime(),
    ));
  } catch (error) {
    if (error instanceof ValidationError) redirect(`/alerts?error=${encodeURIComponent(error.message)}${isId(teamId) ? `&team=${teamId}` : ""}`);
    throw error;
  }
  redirect(`/alerts/confirm?f=${followerId}`);
}

export async function confirmFollowAction(followerId: string, form: FormData) {
  try {
    await confirmFollow(await appDb(), { followerId, code: field(form, "code") }, currentTime());
  } catch (error) {
    if (error instanceof ValidationError) redirect(`/alerts/confirm?f=${followerId}&error=${encodeURIComponent(error.message)}`);
    throw error;
  }
  redirect(`/alerts/confirm?f=${followerId}&done=1`);
}

export async function stopFollowAction(followerId: string, token: string) {
  const ok = await stopFollow(await appDb(), followerId, token, currentTime());
  redirect(ok ? "/alerts/stop?done=1" : "/alerts/stop?bad=1");
}
