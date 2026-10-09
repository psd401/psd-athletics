import { connection } from "next/server";

import { ScoreTicker } from "../components/athletics/score-ticker";
import { HubHeader } from "../components/hub/hub-header";
import { HubHero } from "../components/hub/hub-hero";
import { AlertsSignup, FamiliesGrid, FishBowlBand, HubFooter, SchoolCards } from "../components/hub/hub-sections";
import { HubWeek, type WeekDay } from "../components/hub/hub-week";
import styles from "../components/hub/hub.module.css";
import { appDb } from "../lib/data/db";
import { listGames, listHonors, listSchools, listTeams } from "../lib/data/queries";
import { gameState, groupByDay, latestFishBowl, marqueeGame, tickerItems } from "../lib/schedule/games";
import { addDays, currentTime, formatLongDate, formatMonthDay, formatWeekday, pacificDate } from "../lib/schedule/time";

const WEEK_DAYS = 7;

/** District hub, athletics.psd401.net (design/Main.dc.html). */
export default async function HubPage() {
  await connection(); // Live/Tonight/Final depend on the time of the request.
  const now = currentTime();
  const today = pacificDate(now);
  const db = await appDb();
  const [games, schools, honors, teams] = await Promise.all([
    listGames(db),
    listSchools(db),
    listHonors(db, { featuredOnHub: true }),
    listTeams(db),
  ]);

  const tides = schools.find((s) => s.id === "ghhs");
  const hawks = schools.find((s) => s.id === "phs");
  if (!tides || !hawks) throw new Error("Both schools must be in the database");
  const side = (school: typeof tides) => ({
    slug: school.slug,
    name: school.name,
    shortName: school.shortName,
    mascot: school.mascot,
    founded: school.founded,
    marquee: marqueeGame(games.filter((g) => g.schoolId === school.id), now),
  });

  const days: WeekDay[] = groupByDay(games, today, WEEK_DAYS).map((d) => ({
    date: d.date,
    dow: formatWeekday(d.date),
    label: d.date === today ? `${formatMonthDay(d.date)} · Today` : formatMonthDay(d.date),
    games: d.games.map((game) => ({ game, state: gameState(game, now) })),
  }));
  const weekGames = days.flatMap((d) => d.games);
  const sourceLine = weekGames.length > 0 && weekGames.every(({ game }) => game.source === "arbiter")
    ? "Synced from Arbiter"
    : "From the fall schedule snapshot";

  const fishBowl = latestFishBowl(games);
  const cards = [tides, hawks].map((school) => {
    const list = honors.filter((h) => h.schoolId === school.id);
    const won = fishBowl?.sides.find((s) => s.winner)?.schoolId === school.id;
    return { school, honors: won && fishBowl ? [...list, { figure: fishBowl.date.slice(0, 4), title: "Fish Bowl winners" }] : list };
  });

  return (
    <div data-school="hub" className={styles.page}>
      <HubHeader />
      <main>
        <HubHero tides={side(tides)} hawks={side(hawks)} now={now} />
        <div id="scores">
          <ScoreTicker
            items={tickerItems(games, now, { mode: "hub", finals: 5 })}
            label="Scores"
            variant="hub"
            regionLabel="Live scores and tonight's games"
          />
        </div>
        <HubWeek
          days={days}
          rangeLabel={`${formatLongDate(today)} – ${formatLongDate(addDays(today, WEEK_DAYS))}`}
          sourceLine={sourceLine}
        />
        <FishBowlBand result={fishBowl} />
        <SchoolCards schools={cards} />
        <FamiliesGrid />
        <AlertsSignup teams={teams.filter((t) => t.term === "fall")} schools={schools} />
      </main>
      <HubFooter schools={[tides, hawks]} />
    </div>
  );
}
