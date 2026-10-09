import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import "../../vendor/nexus/bundle.css";
import { StudioNav, type NavItem } from "../../components/studio/studio-nav";
import styles from "../../components/studio/studio.module.css";
import { getAuth } from "../../lib/auth/server";
import { peopleSchools, requireStudio } from "../../lib/studio/context";

export const metadata: Metadata = { title: "Athletics Studio" };

async function signOut() {
  "use server";
  const auth = await getAuth();
  await auth.api.signOut({ headers: await headers() });
  redirect("/sign-in");
}

const roleWords = {
  district_ad: "District athletic director",
  school_ad: "Athletic director",
  secretary: "Athletic secretary",
  head_coach: "Head coach",
  assistant_coach: "Assistant coach",
  photographer: "Volunteer photographer",
} as const;

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const ctx = await requireStudio();
  const first = ctx.actor.grants[0];
  const team = first?.teamId ? ctx.teams.find((t) => t.id === first.teamId) : null;
  const school = ctx.schools.find((s) => s.id === (team?.schoolId ?? first?.schoolId));
  const brand = school ? `${school.shortName} ${school.mascot}` : "Peninsula Athletics";
  const tagline = first ? `${team ? `${team.sport} · ` : ""}${roleWords[first.role].toLowerCase()}` : "No role assigned yet";

  // Pages are added here as they're built.
  const items: NavItem[] = [{ href: "/studio", label: "Today" }];
  if (ctx.myTeams.length > 0) items.push({ href: "/studio/teams", label: "Team pages" }, { href: "/studio/stories", label: "Stories" });
  const photoTeams = ctx.teams.some((t) => ctx.can("photo.upload", { schoolId: t.schoolId, teamId: t.id }));
  const oversees = ctx.schools.some((s) => ctx.can("content.takedown", { schoolId: s.id, teamId: null }));
  if (ctx.teams.some((t) => ctx.can("feed.post", { schoolId: t.schoolId, teamId: t.id }))) items.push({ href: "/studio/post", label: "Post" });
  if (photoTeams || oversees) items.push({ href: "/studio/photos", label: "Photos" });
  if (peopleSchools(ctx).length > 0) items.push({ href: "/studio/people", label: "People and roles" });
  items.push({ href: "/studio/activity", label: "Activity" });
  items.push({ href: "/studio/assistants", label: "Assistants" });

  return (
    <div data-theme="nexus" className={styles.shell}>
      <header className="nx-header">
        <span className="nx-header__mark">Athletics Studio</span>
        <div className={styles.user}>
          <span className={styles.userName}>{ctx.person.name}</span>
          <form action={signOut}>
            <button type="submit" className={`nx-btn nx-btn--sm nx-btn--secondary ${styles.headerButton}`}>
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className={styles.body}>
        <StudioNav brand={brand} tagline={tagline} items={items} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
