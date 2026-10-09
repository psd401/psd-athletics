// The one permission module (CLAUDE.md non-negotiable). The Studio and the
// MCP server both call `can()`; an agent acts with exactly the grants of the
// person who connected it (SPEC §2, §8). Every rule here is in
// lib/permissions/permissions.test.ts.

import { and, eq, gte, isNull, lte, or } from "drizzle-orm";

import type { Db } from "../db/client";
import * as s from "../db/schema";

export type Role = (typeof s.roleEnum.enumValues)[number];

export type Action =
  | "team.edit" // coach note, documents, partners on a team page
  | "roster.view"
  | "roster.edit"
  | "story.draft"
  | "story.publish"
  | "feed.post"
  | "photo.upload"
  | "album.publish"
  | "schedule.confirm" // confirm a held Arbiter change so followers get a text
  | "content.takedown"
  | "school.edit" // school pages, forms, contacts
  | "people.invite"
  | "people.manage" // assign and end roles
  | "rules.manage"
  | "social.share"; // post to an official school account

export interface Grant {
  role: Role;
  /** Null only for the district AD. */
  schoolId: string | null;
  /** Set for coaches and photographers. */
  teamId: string | null;
}

export interface Actor {
  personId: string;
  grants: Grant[];
  /** Teams whose head coach lets assistants publish (a `rule` row). */
  assistantsMayPublish: Set<string>;
  /** Set when an AI agent is acting for this person. Grants are unchanged. */
  agentConnectionId?: string;
}

export interface Scope {
  schoolId: string;
  /** Null for school-level things (school pages, people, rules). */
  teamId: string | null;
}

const schoolActions: Record<"school_ad" | "secretary", Action[]> = {
  school_ad: [
    "team.edit",
    "roster.view",
    "roster.edit",
    "story.draft",
    "story.publish",
    "feed.post",
    "photo.upload",
    "album.publish",
    "schedule.confirm",
    "content.takedown",
    "school.edit",
    "people.invite",
    "people.manage",
    "rules.manage",
  ],
  secretary: ["school.edit", "photo.upload", "people.invite"],
};

const teamActions: Record<"head_coach" | "assistant_coach" | "photographer", Action[]> = {
  head_coach: [
    "team.edit",
    "roster.view",
    "roster.edit",
    "story.draft",
    "story.publish",
    "feed.post",
    "photo.upload",
    "album.publish",
    "schedule.confirm",
  ],
  assistant_coach: ["roster.view", "story.draft", "feed.post", "photo.upload"],
  photographer: ["photo.upload"],
};

/** Publishing actions an assistant gains when the head coach allows it. */
const assistantPublishActions: Action[] = ["story.publish", "album.publish"];

function grantAllows(grant: Grant, action: Action, scope: Scope, actor: Actor): boolean {
  switch (grant.role) {
    case "district_ad":
      return true;
    case "school_ad":
    case "secretary": {
      if (grant.schoolId !== scope.schoolId) return false;
      const actions = schoolActions[grant.role];
      // A secretary uploads to school albums, not team albums.
      if (grant.role === "secretary" && scope.teamId !== null) return false;
      return actions.includes(action);
    }
    case "head_coach":
    case "assistant_coach":
    case "photographer": {
      if (scope.teamId === null || grant.teamId !== scope.teamId || grant.schoolId !== scope.schoolId) return false;
      if (teamActions[grant.role].includes(action)) return true;
      return grant.role === "assistant_coach" && assistantPublishActions.includes(action) && actor.assistantsMayPublish.has(scope.teamId);
    }
  }
}

/** True when any of the actor's current grants allows the action on the scope. */
export function can(actor: Actor, action: Action, scope: Scope): boolean {
  if (action === "social.share") return actor.grants.some((g) => g.role === "district_ad");
  return actor.grants.some((g) => grantAllows(g, action, scope, actor));
}

/**
 * The actor for a signed-in person on `today`: role assignments that have
 * started and not ended, with each team grant's school filled in.
 */
export async function loadActor(db: Db, personId: string, today: string, agentConnectionId?: string): Promise<Actor> {
  const rows = await db
    .select({ role: s.roleAssignment.role, schoolId: s.roleAssignment.schoolId, teamId: s.roleAssignment.teamId, teamSchool: s.team.schoolId })
    .from(s.roleAssignment)
    .leftJoin(s.team, eq(s.roleAssignment.teamId, s.team.id))
    .where(
      and(
        eq(s.roleAssignment.personId, personId),
        lte(s.roleAssignment.startsOn, today),
        or(isNull(s.roleAssignment.endsOn), gte(s.roleAssignment.endsOn, today)),
      ),
    );
  const grants: Grant[] = rows.map((r) => ({ role: r.role, schoolId: r.teamSchool ?? r.schoolId, teamId: r.teamId }));
  const teamIds = grants.filter((g) => g.role === "assistant_coach" && g.teamId).map((g) => g.teamId!);
  const rules = teamIds.length
    ? await db.select({ teamId: s.rule.teamId, settings: s.rule.settings }).from(s.rule).where(eq(s.rule.kind, "publish"))
    : [];
  const assistantsMayPublish = new Set(
    rules.filter((r) => r.teamId && teamIds.includes(r.teamId) && r.settings.assistantsMayPublish === true).map((r) => r.teamId!),
  );
  return { personId, grants, assistantsMayPublish, agentConnectionId };
}

/** Teams the actor can do `action` for, given the teams that exist. */
export function teamsFor(actor: Actor, action: Action, teams: { id: string; schoolId: string }[]): string[] {
  return teams.filter((t) => can(actor, action, { schoolId: t.schoolId, teamId: t.id })).map((t) => t.id);
}
