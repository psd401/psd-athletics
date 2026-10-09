import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Motif } from "../../../components/school/school-hero";
import { Masthead, SchoolFooter, UtilityBar } from "../../../components/school/school-sections";
import { ScheduleView } from "../../../components/school/schedule-view";
import styles from "../../../components/school/school.module.css";
import phone from "../../../components/school/phone.module.css";
import { PhoneTabBar } from "../../../components/school/phone-tabbar";

import { SITE_URL } from "../../../lib/config/site";
import { appDb } from "../../../lib/data/db";
import { listGames, listSchools } from "../../../lib/data/queries";
import { schoolContent } from "../../../lib/schools/content";
import { parseFilters } from "../../../lib/schedule/filters";
import { byStart, gameState, levelLabel, type Level } from "../../../lib/schedule/games";
import { monthsOf } from "../../../lib/schedule/month";
import { currentTime, pacificDate } from "../../../lib/schedule/time";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ school: "ghh" }, { school: "phs" }];
}

const names: Record<string, string> = { ghh: "Tides", phs: "Seahawks" };

export async function generateMetadata({ params }: { params: Promise<{ school: string }> }): Promise<Metadata> {
  const { school } = await params;
  return { title: `Schedule · ${names[school] ?? ""} Athletics` };
}

const levelOrder = Object.keys(levelLabel) as Level[];

/** Master schedule, both schools (design/PHS-Schedule.dc.html). */
export default async function SchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ school: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { school: slug } = await params;
  const content = schoolContent[slug];
  if (!content) notFound();
  await connection();

  const query = await searchParams;
  const now = currentTime();
  const today = pacificDate(now);
  const db = await appDb();
  const schools = await listSchools(db);
  const school = schools.find((s) => s.slug === slug);
  const other = schools.find((s) => s.slug !== slug);
  if (!school || !other) notFound();
  const games = await listGames(db, { schoolId: school.id });
  const sorted = [...games].sort(byStart);

  const sports = [...new Map(sorted.map((g) => [g.sportSlug, g.sport])).entries()].map(([s, name]) => ({ slug: s, name }));
  const levels = levelOrder.filter((l) => sorted.some((g) => g.level === l));
  const firstYear = sorted[0]?.startDate.slice(0, 4);
  const allFromArbiter = sorted.length > 0 && sorted.every((g) => g.source === "arbiter");

  return (
    <div data-school={slug} className={`${styles.page} ${phone.page}`}>
      <UtilityBar other={other} content={content} />
      <Masthead school={school} seasons={[]} current="schedule" />
      <main>
        <ScheduleView
          schoolSlug={slug}
          mascot={school.mascot}
          games={sorted.map((game) => ({ game, state: gameState(game, now) }))}
          today={today}
          months={monthsOf(sorted.map((g) => g.startDate))}
          sports={sports}
          levels={levels}
          initialFilters={parseFilters(query)}
          initialView={query.view === "month" ? "month" : "list"}
          siteUrl={SITE_URL}
          kicker={`Every level · every sport${firstYear ? ` · ${firstYear}–${String(Number(firstYear) + 1).slice(2)}` : ""}`}
          sourceLine={`${allFromArbiter ? "Synced from Arbiter" : "Fall schedule snapshot"} · Times Pacific`}
          motif={<Motif kind={content.motif} />}
        />
      </main>
      <SchoolFooter school={school} content={content} />
      <PhoneTabBar slug={slug} current="schedule" />
    </div>
  );
}
