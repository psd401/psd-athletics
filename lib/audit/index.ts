// Every change is audited, with an undo window (CLAUDE.md non-negotiable,
// SPEC §8). Callers make the change, then record it with before and after
// snapshots; undoChange puts the "before" back.

import { eq } from "drizzle-orm";

import type { Db } from "../db/client";
import * as s from "../db/schema";
import { can, type Actor, type Scope } from "../permissions";

export const UNDO_MINUTES = 30;

/** Object types that can be undone, and the table each lives in. */
const tables = {
  coach_note: s.coachNote,
  story: s.story,
  roster_entry: s.rosterEntry,
  document: s.document,
  sponsor: s.sponsor,
  role_assignment: s.roleAssignment,
  album: s.album,
  photo: s.photo,
} as const;

export type ObjectType = keyof typeof tables;
type Snapshot = Record<string, unknown> | null;

export async function recordChange(
  db: Db,
  {
    actor,
    verb,
    objectType,
    objectId,
    scope,
    before,
    after,
    now = new Date(),
    undoMinutes = UNDO_MINUTES,
  }: {
    actor: Actor;
    verb: string;
    objectType: ObjectType;
    objectId: string;
    scope: Scope;
    before: Snapshot;
    after: Snapshot;
    now?: Date;
    undoMinutes?: number;
  },
) {
  const [row] = await db
    .insert(s.auditLog)
    .values({
      actorPersonId: actor.personId,
      agentConnectionId: actor.agentConnectionId ?? null,
      verb,
      objectType,
      objectId,
      schoolId: scope.schoolId,
      teamId: scope.teamId,
      before,
      after,
      undoUntil: undoMinutes > 0 ? new Date(now.getTime() + undoMinutes * 60_000) : null,
      createdAt: now,
    })
    .returning();
  return row!;
}

/** JSON snapshots turn dates into strings; turn timestamp fields back into dates. */
function revive(snapshot: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(snapshot).map(([k, v]) => [k, typeof v === "string" && /At$/.test(k) && !Number.isNaN(Date.parse(v)) ? new Date(v) : v]),
  );
}

export type UndoResult = { ok: true } | { ok: false; reason: string };

/**
 * Undo one change inside its window. The person who made it can undo it;
 * so can anyone who could take the content down (the school or district AD).
 */
export async function undoChange(db: Db, { auditId, actor, now = new Date() }: { auditId: string; actor: Actor; now?: Date }): Promise<UndoResult> {
  const [entry] = await db.select().from(s.auditLog).where(eq(s.auditLog.id, auditId));
  if (!entry) return { ok: false, reason: "That change wasn't found." };
  if (entry.undoneAt) return { ok: false, reason: "This change was already undone." };
  if (!entry.undoUntil || entry.undoUntil.getTime() < now.getTime()) return { ok: false, reason: "The undo window has closed." };
  const scope: Scope = { schoolId: entry.schoolId ?? "", teamId: entry.teamId };
  if (entry.actorPersonId !== actor.personId && !can(actor, "content.takedown", scope)) {
    return { ok: false, reason: "You can't undo this change." };
  }
  if (!(entry.objectType in tables)) return { ok: false, reason: "This kind of change can't be undone." };

  const table = tables[entry.objectType as ObjectType];
  const before = entry.before as Snapshot;
  const after = entry.after as Snapshot;
  await db.transaction(async (tx) => {
    if (before === null) {
      await tx.delete(table).where(eq(table.id, entry.objectId));
    } else if (after === null) {
      await tx.insert(table).values(revive(before) as never);
    } else {
      const { id: _id, ...fields } = revive(before);
      void _id;
      await tx.update(table).set(fields as never).where(eq(table.id, entry.objectId));
    }
    await tx.update(s.auditLog).set({ undoneBy: actor.personId, undoneAt: now }).where(eq(s.auditLog.id, entry.id));
    await tx.insert(s.auditLog).values({
      actorPersonId: actor.personId,
      agentConnectionId: actor.agentConnectionId ?? null,
      verb: "undo",
      objectType: entry.objectType,
      objectId: entry.objectId,
      schoolId: entry.schoolId,
      teamId: entry.teamId,
      before: after,
      after: before,
      undoUntil: null,
      createdAt: now,
    });
  });
  return { ok: true };
}
