import { and, desc, eq, inArray, or, type SQL } from "drizzle-orm";

import type { Db } from "../db/client";
import * as s from "../db/schema";
import { can, type Actor, type Role } from "../permissions";
import { roleNames } from "./people";

export interface ActivityItem {
  id: string;
  verb: string;
  objectType: string;
  objectId: string;
  actorName: string;
  viaAgent: boolean;
  createdAt: Date;
  undoUntil: Date | null;
  undoneAt: Date | null;
  canUndo: boolean;
  /** A short label for what changed: a title, a name, or the start of a note. */
  summary: string | null;
}

/** "Bus leaves at 4:15", "Alex R.", a story's title. Never more than 60 characters. */
export function summarize(snapshot: unknown): string | null {
  if (!snapshot || typeof snapshot !== "object") return null;
  const o = snapshot as Record<string, unknown>;
  const value = [o.title, o.displayName, o.name, o.body].find((v): v is string => typeof v === "string" && v.trim().length > 0);
  if (!value) return null;
  const one = value.trim().replace(/\s+/g, " ");
  return one.length > 60 ? `${one.slice(0, 57)}…` : one;
}

/**
 * What the person can see in the activity log: their own changes, and every
 * change at a school where they could take content down (the ADs).
 */
export async function listActivity(db: Db, actor: Actor, schoolIds: string[], now: Date, limit = 50): Promise<ActivityItem[]> {
  const overseen = schoolIds.filter((id) => can(actor, "content.takedown", { schoolId: id, teamId: null }));
  const conditions: SQL[] = [eq(s.auditLog.actorPersonId, actor.personId)];
  if (overseen.length) conditions.push(inArray(s.auditLog.schoolId, overseen));
  const rows = await db
    .select({ log: s.auditLog, name: s.person.name })
    .from(s.auditLog)
    .innerJoin(s.person, eq(s.auditLog.actorPersonId, s.person.id))
    .where(and(or(...conditions)))
    .orderBy(desc(s.auditLog.createdAt))
    .limit(limit);
  // Role snapshots carry a person id, not a name; look the names up.
  const rolePeople = rows.flatMap(({ log }) => {
    const snap = (log.after ?? log.before) as Record<string, unknown> | null;
    return log.objectType === "role_assignment" && typeof snap?.personId === "string" ? [snap.personId] : [];
  });
  const names = new Map(
    rolePeople.length ? (await db.select({ id: s.person.id, name: s.person.name }).from(s.person).where(inArray(s.person.id, rolePeople))).map((p) => [p.id, p.name]) : [],
  );
  const roleSummary = (snap: Record<string, unknown> | null) =>
    snap && typeof snap.personId === "string" && typeof snap.role === "string" && snap.role in roleNames
      ? `${names.get(snap.personId) ?? "Someone"} · ${roleNames[snap.role as Role]}`
      : null;
  return rows.map(({ log, name }) => {
    const open = !log.undoneAt && log.undoUntil !== null && log.undoUntil.getTime() > now.getTime() && log.verb !== "undo";
    const allowed =
      log.actorPersonId === actor.personId || can(actor, "content.takedown", { schoolId: log.schoolId ?? "", teamId: log.teamId });
    return {
      id: log.id,
      verb: log.verb,
      objectType: log.objectType,
      objectId: log.objectId,
      actorName: name,
      viaAgent: log.agentConnectionId !== null,
      createdAt: log.createdAt,
      undoUntil: log.undoUntil,
      undoneAt: log.undoneAt,
      canUndo: open && allowed,
      summary:
        log.objectType === "role_assignment"
          ? roleSummary((log.after ?? log.before) as Record<string, unknown> | null)
          : summarize(log.after ?? log.before),
    };
  });
}

const objectWords: Record<string, string> = {
  coach_note: "coach's note",
  story: "story",
  roster_entry: "roster entry",
  document: "document",
  sponsor: "team partner",
  role_assignment: "role",
};

/** "published a story", "undid a change to a coach's note" */
export function describeChange(verb: string, objectType: string): string {
  const what = objectWords[objectType] ?? objectType.replace(/_/g, " ");
  const verbs: Record<string, string> = {
    create: `added a ${what}`,
    update: `edited a ${what}`,
    delete: `removed a ${what}`,
    publish: `published a ${what}`,
    unpublish: `unpublished a ${what}`,
    undo: `undid a change to a ${what}`,
    assign: `gave someone a ${what}`,
    end: `ended a ${what}`,
    remove: `removed a ${what}`,
  };
  return verbs[verb] ?? `${verb} a ${what}`;
}
