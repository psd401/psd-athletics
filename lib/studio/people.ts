// People and roles (SPEC §2, design/CMS-People-Roles.dc.html). Athletic
// directors and secretaries add people by their psd401.net address and end
// their access. Every change is audited and can be undone; the rule for who
// can give which role is canAssign() in lib/permissions.

import { randomUUID } from "node:crypto";

import { and, eq, gte, inArray, isNull, or } from "drizzle-orm";

import { recordChange } from "../audit";
import { DISTRICT_DOMAIN } from "../auth/domain";
import type { Db } from "../db/client";
import * as s from "../db/schema";
import { canAssign, type Role, type Scope } from "../permissions";
import { levelLabel } from "../schedule/games";
import { addDays, formatShortDate, pacificDate } from "../schedule/time";
import { PermissionError, ValidationError } from "./errors";
import type { Ctx } from "./team-content";

export const roleNames: Record<Role, string> = {
  district_ad: "District athletic director",
  school_ad: "School athletic director",
  secretary: "Athletic secretary",
  head_coach: "Head coach",
  assistant_coach: "Assistant coach",
  photographer: "Volunteer photographer",
};

/** What each role can do, for the Roles table (SPEC §2). */
export const roleSummaries: { role: string; publishes: string; photos: string; also: string }[] = [
  { role: roleNames.district_ad, publishes: "Any page at both schools", photos: "Takes down anything", also: "Posts to official school social accounts" },
  { role: roleNames.school_ad, publishes: "Any page at their school", photos: "Takes down at their school", also: "Sets rules for their coaches" },
  { role: roleNames.secretary, publishes: "Forms, contacts, school pages", photos: "Uploads to school albums", also: "Manages invitations" },
  { role: roleNames.head_coach, publishes: "Their team pages, stories, feed", photos: "Publishes their albums", also: "Responsible for their team's content" },
  { role: roleNames.assistant_coach, publishes: "Drafts; head coach can allow publishing", photos: "Upload, publish if allowed", also: "Sideline posting" },
  { role: roleNames.photographer, publishes: "Nothing", photos: "Uploads held for the coach", also: "No access to rosters" },
  { role: "AI agent", publishes: "Drafts as the person who connected it", photos: "Same as that person", also: "Every action logged and undoable" },
];

export const teamRoles = ["head_coach", "assistant_coach", "photographer"] as const satisfies Role[];
export const schoolRoles = ["school_ad", "secretary"] as const satisfies Role[];
const isTeamRole = (role: Role) => (teamRoles as readonly Role[]).includes(role);

export interface AssignInput {
  email: string;
  name: string;
  role: Role;
  /** For school roles. Team roles take the team's school. */
  schoolId?: string;
  /** For team roles. */
  teamId?: string;
  startsOn: string;
  endsOn?: string;
}

const isoDate = (value: string | undefined, required: boolean): string | null => {
  const v = (value ?? "").trim();
  if (!v && !required) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(`${v}T12:00:00Z`))) throw new ValidationError("Dates must look like 2026-10-09.");
  return v;
};

function districtEmail(value: string): string {
  const email = value.trim().toLowerCase();
  const [local, domain, ...rest] = email.split("@");
  if (!local || domain !== DISTRICT_DOMAIN || rest.length) throw new ValidationError(`Use their ${DISTRICT_DOMAIN} Google account.`);
  return email;
}

async function scopeFor(db: Db, input: Pick<AssignInput, "role" | "schoolId" | "teamId">): Promise<Scope> {
  if (isTeamRole(input.role)) {
    if (!input.teamId) throw new ValidationError("Pick a team for this role.");
    const [team] = await db.select({ schoolId: s.team.schoolId }).from(s.team).where(eq(s.team.id, input.teamId));
    if (!team) throw new ValidationError("That team doesn't exist.");
    return { schoolId: team.schoolId, teamId: input.teamId };
  }
  if (input.role === "district_ad") throw new PermissionError("The district athletic director role isn't assigned in the Studio.");
  if (!input.schoolId) throw new ValidationError("Pick a school for this role.");
  const [school] = await db.select({ id: s.school.id }).from(s.school).where(eq(s.school.id, input.schoolId));
  if (!school) throw new ValidationError("That school doesn't exist.");
  return { schoolId: school.id, teamId: null };
}

/** Give someone a role, adding them by email if they're new. They can sign in with Google from the start date. */
export async function assignRole(ctx: Ctx, input: AssignInput) {
  const email = districtEmail(input.email);
  const name = input.name.trim();
  if (!name) throw new ValidationError("The name can't be empty.");
  if (name.length > 80) throw new ValidationError("The name must be 80 characters or fewer.");
  const scope = await scopeFor(ctx.db, input);
  if (!canAssign(ctx.actor, input.role, scope.schoolId)) {
    throw new PermissionError(`You can't add a ${roleNames[input.role].toLowerCase()} here. Ask the athletic director.`);
  }
  const startsOn = isoDate(input.startsOn, true)!;
  const endsOn = isoDate(input.endsOn, false);
  if (endsOn && endsOn < startsOn) throw new ValidationError("The end date can't be before the start date.");

  let [person] = await ctx.db.select({ id: s.person.id }).from(s.person).where(eq(s.person.email, email));
  if (!person) {
    // Not verified until they sign in with Google, which checks the domain again.
    [person] = await ctx.db.insert(s.person).values({ id: randomUUID(), name, email, emailVerified: false }).returning({ id: s.person.id });
  }
  const personId = person!.id;

  const same = await ctx.db
    .select({ id: s.roleAssignment.id })
    .from(s.roleAssignment)
    .where(
      and(
        eq(s.roleAssignment.personId, personId),
        eq(s.roleAssignment.role, input.role),
        scope.teamId ? eq(s.roleAssignment.teamId, scope.teamId) : eq(s.roleAssignment.schoolId, scope.schoolId),
        or(isNull(s.roleAssignment.endsOn), gte(s.roleAssignment.endsOn, startsOn)),
      ),
    );
  if (same.length) throw new ValidationError("They already have that role.");

  const [row] = await ctx.db
    .insert(s.roleAssignment)
    .values({
      personId,
      role: input.role,
      schoolId: scope.teamId ? null : scope.schoolId,
      teamId: scope.teamId,
      startsOn,
      endsOn,
      source: "manual",
    })
    .returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "assign", objectType: "role_assignment", objectId: row!.id, scope, before: null, after: row!, now: ctx.now });
  return row!;
}

/**
 * End someone's role. A role that has started ends yesterday, so access
 * stops today; one that hasn't started is removed.
 */
export async function endRole(ctx: Ctx, assignmentId: string) {
  const [before] = await ctx.db
    .select({ row: s.roleAssignment, teamSchool: s.team.schoolId })
    .from(s.roleAssignment)
    .leftJoin(s.team, eq(s.roleAssignment.teamId, s.team.id))
    .where(eq(s.roleAssignment.id, assignmentId));
  if (!before) throw new ValidationError("That role wasn't found.");
  const { row } = before;
  const schoolId = before.teamSchool ?? row.schoolId;
  if (row.personId === ctx.actor.personId) throw new PermissionError("You can't end your own access. Ask another athletic director.");
  if (!schoolId || !canAssign(ctx.actor, row.role, schoolId)) throw new PermissionError("You can't end this role. Ask the athletic director.");
  const scope: Scope = { schoolId, teamId: row.teamId };
  const today = pacificDate(ctx.now);

  if (row.startsOn >= today) {
    await ctx.db.delete(s.roleAssignment).where(eq(s.roleAssignment.id, row.id));
    await recordChange(ctx.db, { actor: ctx.actor, verb: "remove", objectType: "role_assignment", objectId: row.id, scope, before: row, after: null, now: ctx.now });
    return null;
  }
  const [after] = await ctx.db.update(s.roleAssignment).set({ endsOn: addDays(today, -1) }).where(eq(s.roleAssignment.id, row.id)).returning();
  await recordChange(ctx.db, { actor: ctx.actor, verb: "end", objectType: "role_assignment", objectId: row.id, scope, before: row, after: after!, now: ctx.now });
  return after!;
}

export interface PersonRow {
  assignmentId: string;
  personId: string;
  name: string;
  email: string;
  role: Role;
  schoolId: string | null;
  /** "Gig Harbor · Girls Soccer · Varsity", or "Gig Harbor" for school roles. */
  scope: string;
  startsOn: string;
  endsOn: string | null;
  /** "Active" once they've signed in, "Invited" before, "Starts Mon, Nov 16" for later starts. */
  status: string;
}

/** Current and upcoming role assignments at the given schools (and district roles when asked). */
export async function listPeople(db: Db, { schoolIds, today, includeDistrict = false }: { schoolIds: string[]; today: string; includeDistrict?: boolean }): Promise<PersonRow[]> {
  const rows = await db
    .select({ a: s.roleAssignment, person: s.person, teamSchool: s.team.schoolId, level: s.team.level, sport: s.sport.name })
    .from(s.roleAssignment)
    .innerJoin(s.person, eq(s.roleAssignment.personId, s.person.id))
    .leftJoin(s.team, eq(s.roleAssignment.teamId, s.team.id))
    .leftJoin(s.sport, eq(s.team.sportId, s.sport.id))
    .where(or(isNull(s.roleAssignment.endsOn), gte(s.roleAssignment.endsOn, today)));
  const schools = await db.select({ id: s.school.id, shortName: s.school.shortName }).from(s.school);
  const personIds = [...new Set(rows.map((r) => r.person.id))];
  const signedIn = new Set(
    personIds.length ? (await db.select({ userId: s.account.userId }).from(s.account).where(inArray(s.account.userId, personIds))).map((r) => r.userId) : [],
  );
  const order: Role[] = ["district_ad", "school_ad", "secretary", "head_coach", "assistant_coach", "photographer"];

  return rows
    .map(({ a, person, teamSchool, level, sport }) => {
      const schoolId = teamSchool ?? a.schoolId;
      const schoolName = schools.find((x) => x.id === schoolId)?.shortName;
      const scope = a.role === "district_ad" ? "Both schools" : [schoolName, sport, level ? levelLabel[level] : null].filter(Boolean).join(" · ");
      const status = a.startsOn > today ? `Starts ${formatShortDate(a.startsOn)}` : signedIn.has(person.id) ? "Active" : "Invited";
      return { assignmentId: a.id, personId: person.id, name: person.name, email: person.email, role: a.role, schoolId, scope, startsOn: a.startsOn, endsOn: a.endsOn, status };
    })
    .filter((r) => (r.schoolId ? schoolIds.includes(r.schoolId) : includeDistrict))
    .sort((x, y) => order.indexOf(x.role) - order.indexOf(y.role) || x.scope.localeCompare(y.scope) || x.name.localeCompare(y.name));
}

/** A CSV cell; leading = + - @ get a quote so spreadsheets don't run them. */
function cell(value: string | null): string {
  let v = value ?? "";
  if (/^[=+\-@\t\r]/.test(v)) v = `'${v}`;
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** The access list ADs export each season (design "Export access list"). */
export function accessListCsv(rows: PersonRow[]): string {
  const lines = [["Name", "Email", "Role", "School and team", "Starts", "Ends", "Status"].join(",")];
  for (const r of rows) lines.push([r.name, r.email, roleNames[r.role], r.scope, r.startsOn, r.endsOn, r.status].map(cell).join(","));
  return lines.join("\r\n") + "\r\n";
}
