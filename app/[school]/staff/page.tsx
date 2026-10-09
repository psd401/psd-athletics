import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { CoachDirectory, type CoachCard } from "../../../components/school/coach-directory";
import { Masthead, SchoolFooter, UtilityBar } from "../../../components/school/school-sections";
import styles from "../../../components/school/school.module.css";
import phone from "../../../components/school/phone.module.css";
import { PhoneTabBar } from "../../../components/school/phone-tabbar";

import seahawks from "../../../components/school/seahawks.module.css";
import s from "../../../components/school/staff.module.css";
import { appDb } from "../../../lib/data/db";
import { listHeadCoaches, listSchools, listTeams } from "../../../lib/data/queries";
import { schoolContent } from "../../../lib/schools/content";
import { initials } from "../../../lib/schedule/board";
import { currentTime, pacificDate } from "../../../lib/schedule/time";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ school: "ghh" }, { school: "phs" }];
}

const names: Record<string, string> = { ghh: "Tides", phs: "Seahawks" };

export async function generateMetadata({ params }: { params: Promise<{ school: string }> }): Promise<Metadata> {
  const { school } = await params;
  return { title: `Coaches & staff · ${names[school] ?? ""} Athletics` };
}

/** Athletics office and head coaches (design/PHS-Staff.dc.html), both schools. */
export default async function StaffPage({ params }: { params: Promise<{ school: string }> }) {
  const { school: slug } = await params;
  const content = schoolContent[slug];
  if (!content) notFound();
  await connection();
  const db = await appDb();
  const schools = await listSchools(db);
  const school = schools.find((x) => x.slug === slug);
  const other = schools.find((x) => x.slug !== slug);
  if (!school || !other) notFound();
  const today = pacificDate(currentTime());
  const [teams, coaches] = await Promise.all([listTeams(db, { schoolId: school.id }), listHeadCoaches(db, { schoolId: school.id, today })]);

  // One card per sport: the varsity team's head coach.
  const seen = new Set<string>();
  const cards: CoachCard[] = teams
    .filter((t) => t.level === "varsity")
    .filter((t) => (seen.has(`${t.term}-${t.sportSlug}`) ? false : (seen.add(`${t.term}-${t.sportSlug}`), true)))
    .map((t) => ({
      teamId: t.id,
      term: t.term,
      sport: t.sport,
      href: `/${slug}/teams/${t.sportSlug}`,
      coach: coaches.find((c) => c.teamId === t.id)?.name ?? null,
    }));

  return (
    <div data-school={slug} className={`${styles.page} ${phone.page}`}>
      <UtilityBar other={other} content={content} />
      <Masthead school={school} seasons={[]} current="staff" traditionNav={content.traditionNav} />
      <main>
        <section className={`${s.head} ath-on-dark`} aria-labelledby="staff-title">
          <div className={`ath-wrap ${s.headIn}`}>
            <div className={s.titleBlock}>
              <span className={`ath-label ${s.kicker}`}>{school.name} athletics</span>
              <h1 id="staff-title" className={`ath-display ${s.h1}`}>
                Coaches &amp; staff
              </h1>
              <span className={s.sub}>Coaches keep their own entries current in Athletics Studio.</span>
            </div>
          </div>
        </section>
        <div className={`ath-wrap ${s.body}`}>
          <section className={s.section} aria-labelledby="office-title">
            <h2 id="office-title" className={`ath-display ${s.h2}`}>
              Athletics office
            </h2>
            <ul className={s.office}>
              {school.contacts.map((c) => (
                <li key={c.name} className={seahawks.person}>
                  <span className={seahawks.avatar} aria-hidden="true">
                    {initials(c.name)}
                  </span>
                  <span className={seahawks.personText}>
                    <h3 className={seahawks.personName}>{c.name}</h3>
                    <span className={seahawks.personRole}>{c.role}</span>
                  </span>
                </li>
              ))}
              {school.contacts.some((c) => c.role === "Athletic Director") ? null : (
                <li className={seahawks.person}>
                  <span className={seahawks.avatar} aria-hidden="true">
                    AD
                  </span>
                  <span className={seahawks.personText}>
                    <h3 className={seahawks.personName}>[Athletic director]</h3>
                    <span className={seahawks.personRole}>Athletic Director</span>
                  </span>
                </li>
              )}
              <li className={`${seahawks.person} ${s.tip}`}>
                <span className={s.tipText}>
                  <b>Questions about eligibility, physicals or transfers?</b>
                  <span className={s.small}>Start with the athletics office. Coaches can&apos;t approve eligibility.</span>
                </span>
              </li>
            </ul>
          </section>
          <CoachDirectory cards={cards} />
        </div>
      </main>
      <SchoolFooter school={school} content={content} />
      <PhoneTabBar slug={slug} />
    </div>
  );
}
