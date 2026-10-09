import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { ScoreTicker } from "../../components/athletics/score-ticker";
import { SchoolHero } from "../../components/school/school-hero";
import {
  FanZone,
  LatestFinals,
  Masthead,
  Partners,
  SchoolAlerts,
  SchoolFooter,
  SeasonForm,
  Tradition,
  UtilityBar,
} from "../../components/school/school-sections";
import { SchoolWeek, type WeekGame } from "../../components/school/school-week";
import { AthleticsOffice, FishBowlChampions, LiveNow, MatchHero, Pillars } from "../../components/school/seahawks-sections";
import { WeekBoard } from "../../components/school/week-board";
import styles from "../../components/school/school.module.css";
import phone from "../../components/school/phone.module.css";
import { MyTeams } from "../../components/school/my-teams";
import { PhoneTabBar } from "../../components/school/phone-tabbar";
import { QuickLinks } from "../../components/school/quick-links";
import { TeamsTabs, type SeasonTeams } from "../../components/school/teams-tabs";
import { appDb } from "../../lib/data/db";
import { listGames, listHonors, listSchools, listTeams } from "../../lib/data/queries";
import { schoolContent } from "../../lib/schools/content";
import { byStart, gameState, groupByDay, latestFinals, latestFishBowl, marqueeGame, tickerItems, winStreak } from "../../lib/schedule/games";
import { boardDays } from "../../lib/schedule/board";
import { seasonFormCards, streakNote, teamMeta } from "../../lib/schedule/school";
import { addDays, clockOffsetMs, currentTime, formatLongDate, formatMonthDay, formatWeekday, pacificDate } from "../../lib/schedule/time";

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ school: "ghh" }, { school: "phs" }];
}

const names: Record<string, string> = { ghh: "Gig Harbor Tides Athletics", phs: "Peninsula Seahawks Athletics" };

export async function generateMetadata({ params }: { params: Promise<{ school: string }> }): Promise<Metadata> {
  const { school } = await params;
  return { title: names[school] ?? "Peninsula Athletics" };
}

const WEEK_DAYS = 8;
const terms = [
  ["fall", "Fall"],
  ["winter", "Winter"],
  ["spring", "Spring"],
] as const;

/** Fall runs Aug–Nov, winter Dec–Feb, spring Mar–Jul. */
function currentTerm(date: string): "fall" | "winter" | "spring" {
  const month = Number(date.slice(5, 7));
  return month >= 8 && month <= 11 ? "fall" : month === 12 || month <= 2 ? "winter" : "spring";
}

/** A school's home page, one template for both schools (design/GHHS-Home.dc.html). */
export default async function SchoolPage({ params }: { params: Promise<{ school: string }> }) {
  const { school: slug } = await params;
  const content = schoolContent[slug];
  if (!content) notFound();
  await connection(); // Live/Tonight/Final and the countdown depend on the time of the request.

  const now = currentTime();
  const today = pacificDate(now);
  const db = await appDb();
  const schools = await listSchools(db);
  const school = schools.find((s) => s.slug === slug);
  const other = schools.find((s) => s.slug !== slug);
  if (!school || !other) notFound();
  const [allGames, honors, teams] = await Promise.all([
    listGames(db),
    listHonors(db, { schoolId: school.id }),
    listTeams(db, { schoolId: school.id }),
  ]);

  const games = allGames.filter((g) => g.schoolId === school.id);
  const marquee = marqueeGame(games, now);
  const tonight =
    games
      .filter((g) => g.id !== marquee?.id && ["live", "tonight", "today"].includes(gameState(g, now)))
      .sort((a, b) => Number(b.homeAway === "home") - Number(a.homeAway === "home") || byStart(a, b))[0] ?? null;

  const week: WeekGame[] = groupByDay(games, today, WEEK_DAYS).flatMap((d) =>
    d.games.map((game) => ({
      game,
      state: gameState(game, now),
      dow: formatWeekday(d.date),
      day: String(Number(d.date.slice(8))),
      dateLabel: formatLongDate(d.date),
    })),
  );

  const seasons: SeasonTeams[] = terms.map(([term, label]) => {
    const inTerm = teams.filter((t) => t.term === term);
    const sports = [...new Map(inTerm.map((t) => [t.sportSlug, t.sport])).entries()];
    return {
      term,
      label,
      teams: sports.map(([sportSlug, sport]) => {
        const levels = inTerm.filter((t) => t.sportSlug === sportSlug);
        const varsity = levels.find((t) => t.level === "varsity");
        const streak = varsity ? winStreak(games.filter((g) => g.teamId === varsity.id)) : 0;
        return {
          name: sport,
          meta: teamMeta(varsity?.record ?? {}, levels.map((t) => t.level), streak),
          href: `/${slug}/teams/${sportSlug}`,
        };
      }),
    };
  });

  const masthead = (
    <Masthead
      school={school}
      traditionNav={content.traditionNav}
      seasons={seasons.map((s) => ({ term: s.term, label: s.label, sports: s.teams.map((t) => ({ name: t.name, href: t.href })) }))}
    />
  );
  const ticker = (
    <ScoreTicker
      items={tickerItems(games, now, { mode: "school", finals: 4 })}
      label={content.scoreboardLabel}
      variant="school"
      regionLabel={`${school.mascot} scores`}
    />
  );
  const sourceLabel = week.length > 0 && week.every((w) => w.game.source === "arbiter") ? "Synced from Arbiter" : "Fall schedule snapshot";
  const finals = <LatestFinals games={latestFinals(games, 8)} />;
  const upcoming = games
    .filter((g) => ["live", "tonight", "today", "upcoming"].includes(gameState(g, now)))
    .sort(byStart)
    .slice(0, 40);
  const myTeams = (
    <MyTeams
      slug={slug}
      teams={teams.filter((t) => t.term === currentTerm(today)).map((t) => ({ id: t.id, sport: t.sport, level: t.level }))}
      games={upcoming}
      weekEnd={addDays(today, 7)}
    />
  );
  const teamsTabs = <TeamsTabs seasons={seasons} initial={currentTerm(today)} />;
  const alerts = <SchoolAlerts school={school} content={content} teams={teams.filter((t) => t.term === currentTerm(today))} />;

  if (content.layout === "seahawks") {
    // design/PHS-Home.dc.html: match-card hero, live strip, week board, champions band, pillars, office.
    const live = games.filter((g) => gameState(g, now) === "live").sort(byStart)[0] ?? null;
    const board = boardDays(week.map(({ game, state }) => ({ game, state })), today, 7);
    return (
      <div data-school={slug} className={`${styles.page} ${phone.page}`}>
        <UtilityBar other={other} content={content} />
        {masthead}
        <main>
          {ticker}
          <MatchHero schoolView={school} content={content} marquee={marquee} now={now} clockOffsetMs={clockOffsetMs(now)} />
          <LiveNow game={live} />
          {myTeams}
          <WeekBoard
            days={board}
            kicker={`Week of ${formatMonthDay(today)} · ${sourceLabel}`}
            schoolSlug={slug}
            mascot={school.mascot}
            featureId={marquee?.id ?? null}
          />
          {finals}
          <FishBowlChampions result={latestFishBowl(allGames)} schoolId={school.id} />
          {teamsTabs}
          <Pillars schoolView={school} content={content} honors={honors} />
          <AthleticsOffice schoolView={school} content={content} />
          {alerts}
          <QuickLinks slug={slug} content={content} />
        </main>
        <SchoolFooter school={school} content={content} />
        <PhoneTabBar slug={slug} current="home" />
      </div>
    );
  }

  return (
    <div data-school={slug} className={`${styles.page} ${phone.page}`}>
      <UtilityBar other={other} content={content} />
      {masthead}
      <main>
        {ticker}
        <SchoolHero
          school={school}
          content={content}
          marquee={marquee}
          marqueeTeamGames={marquee ? games.filter((g) => g.teamId === marquee.teamId) : []}
          tonight={tonight}
          streak={streakNote(games)}
          now={now}
          clockOffsetMs={clockOffsetMs(now)}
        />
        {myTeams}
        <SchoolWeek
          schoolSlug={slug}
          mascot={school.mascot}
          games={week}
          rangeLabel={`${formatMonthDay(today)} – ${formatMonthDay(addDays(today, WEEK_DAYS))} · ${sourceLabel}`}
          sport={marquee ? { slug: marquee.sportSlug, name: marquee.sport } : null}
        />
        {finals}
        <SeasonForm schoolSlug={slug} cards={seasonFormCards(games, now, { marqueeSport: marquee?.sportSlug ?? null, limit: 3 })} />
        {teamsTabs}
        <Tradition school={school} content={content} honors={honors} />
        <FanZone school={school} content={content} />
        {alerts}
        <Partners content={content} />
        <QuickLinks slug={slug} content={content} />
      </main>
      <SchoolFooter school={school} content={content} />
      <PhoneTabBar slug={slug} current="home" />
    </div>
  );
}
