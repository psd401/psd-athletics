"use server";

import { redirect } from "next/navigation";

import { revokeConnection } from "../../../lib/mcp/connection";
import { requireStudio } from "../../../lib/studio/context";

export async function turnOffAction(connectionId: string) {
  const ctx = await requireStudio("/studio/assistants");
  // Real time, not the app clock: it's compared with when tokens were issued.
  const ok = await revokeConnection(ctx.db, { connectionId, personId: ctx.person.id }, new Date());
  redirect(ok ? `/studio/assistants?saved=${encodeURIComponent("Turned off. It can't do anything until you connect it again.")}` : "/studio/assistants");
}
