import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getAuth } from "../auth/server";
import { appDb } from "../data/db";
import { listSchools, listTeams, type SchoolView, type TeamView } from "../data/queries";
import { can, loadActor, type Action, type Actor } from "../permissions";
import { currentTime, pacificDate } from "../schedule/time";

export interface StudioContext {
  person: { id: string; name: string; email: string };
  actor: Actor;
  db: Awaited<ReturnType<typeof appDb>>;
  now: Date;
  today: string;
  schools: SchoolView[];
  /** Every team, for scoping. */
  teams: TeamView[];
  /** Teams the person can draft stories or edit pages for. */
  myTeams: TeamView[];
  can: (action: Action, scope: { schoolId: string; teamId: string | null }) => boolean;
}

/** The signed-in person and what they can do. Sends signed-out visitors to sign-in. */
export async function requireStudio(next = "/studio"): Promise<StudioContext> {
  const requestHeaders = await headers();
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  const db = await appDb();
  const now = currentTime();
  const today = pacificDate(now);
  const actor = await loadActor(db, session.user.id, today);
  const [schools, teams] = await Promise.all([listSchools(db), listTeams(db)]);
  const check = (action: Action, scope: { schoolId: string; teamId: string | null }) => can(actor, action, scope);
  const myTeams = teams.filter(
    (t) => check("story.draft", { schoolId: t.schoolId, teamId: t.id }) || check("photo.upload", { schoolId: t.schoolId, teamId: t.id }),
  );
  return {
    person: { id: session.user.id, name: session.user.name, email: session.user.email },
    actor,
    db,
    now,
    today,
    schools,
    teams,
    myTeams,
    can: check,
  };
}

/** True when the person can manage people anywhere (school or district AD). */
export function managesPeople(ctx: Pick<StudioContext, "schools" | "can">): boolean {
  return ctx.schools.some((s) => ctx.can("people.manage", { schoolId: s.id, teamId: null }));
}
