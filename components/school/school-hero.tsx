import Image from "next/image";

import type { SchoolView } from "../../lib/data/queries";
import type { SchoolContent } from "../../lib/schools/content";
import { gameState, levelLabel, opponentLine, startInstant, timeLabel, type GameView } from "../../lib/schedule/games";
import { formatRecord, heroHeadline, heroMeta, ordinal, recordLine } from "../../lib/schedule/school";
import { formatShortDate } from "../../lib/schedule/time";
import { mapsUrl } from "../athletics/game-actions";
import { CalendarAddIcon, CheckIcon, PinIcon, TicketIcon, WatchIcon } from "../athletics/icons";
import { StatusTag } from "../athletics/status-tag";
import { Countdown } from "./countdown";
import styles from "./school.module.css";

/** One wave contour, as in the comp: a curve, then smooth segments every 270 units. */
function wavePath(y: number): string {
  const segments = Array.from({ length: 6 }, (_, i) => `S ${450 + i * 270} ${i % 2 ? y + 30 : y - 30}, ${540 + i * 270} ${y}`);
  return `M0 ${y} C 90 ${y - 30}, 180 ${y + 30}, 270 ${y} ${segments.join(" ")}`;
}

function Motif({ kind }: { kind: SchoolContent["motif"] }) {
  return (
    <svg className={styles.motif} viewBox="0 0 1800 700" preserveAspectRatio="none" aria-hidden="true">
      {kind === "waves"
        ? [420, 452, 484, 516, 548, 580, 612, 644].map((y) => <path key={y} d={wavePath(y)} />)
        : [1000, 1060, 1120, 1180, 1240, 1300].map((x) => <path key={x} d={`M${x} 360 L${x + 220} 480 L${x} 600`} />)}
    </svg>
  );
}

function TonightCard({ game, now }: { game: GameView; now: Date }) {
  const state = gameState(game, now);
  const where = game.homeAway === "home" ? "at home" : "away";
  const label = state === "live" ? "Live" : `${state === "today" ? "Today" : "Tonight"} · ${where}`;
  const r = game.record;
  return (
    <div className={`${styles.glass} ${styles.tonight}`}>
      <div className={styles.tonightHead}>
        <StatusTag kind={state === "live" ? "live" : "tonight"}>{label}</StatusTag>
        <span className={`ath-label ${styles.tonightTime}`}>{timeLabel(game)}</span>
      </div>
      <h2 className={`ath-display ${styles.tonightTitle}`}>
        {game.sport}
        {game.level === "varsity" ? "" : ` ${levelLabel[game.level]}`}
        <br />
        {opponentLine(game)}
      </h2>
      {r.overall || r.league || r.lastThree ? (
        <ul className={styles.stats}>
          {r.overall ? (
            <li>
              <b>{formatRecord(r.overall)}</b> overall
            </li>
          ) : null}
          {r.league ? (
            <li>
              <b>{formatRecord(r.league)}</b> league{r.leagueRank ? ` · ${ordinal(r.leagueRank)}` : ""}
            </li>
          ) : null}
          {r.lastThree ? (
            <li>
              <b>{formatRecord(r.lastThree.replace(/ goals$/, ""))}</b> last three
            </li>
          ) : null}
        </ul>
      ) : null}
      <div className={styles.heroButtons}>
        {game.ticketUrl ? (
          <a className={`${styles.btn} ${styles.btnAccent}`} href={game.ticketUrl}>
            <TicketIcon />
            Buy tickets
          </a>
        ) : null}
        {game.venueAddress ? (
          <a className={`${styles.btn} ${styles.btnLine}`} href={mapsUrl(game.venueAddress)}>
            <PinIcon />
            Directions
          </a>
        ) : null}
        <a className={`${styles.btn} ${styles.btnLine}`} href={`/api/games/${game.id}/ics`}>
          <CalendarAddIcon />
          Add to calendar
        </a>
      </div>
    </div>
  );
}

interface SchoolHeroProps {
  school: SchoolView;
  content: SchoolContent;
  marquee: GameView | null;
  marqueeTeamGames: GameView[];
  tonight: GameView | null;
  streak: { headline: string; detail: string } | null;
  now: Date;
  clockOffsetMs: number;
}

/** Next-game hero with a live countdown (design/GHHS-Home.dc.html). */
export function SchoolHero({ school, content, marquee, marqueeTeamGames, tonight, streak, now, clockOffsetMs }: SchoolHeroProps) {
  const start = marquee ? startInstant(marquee) : null;
  const unit = marquee?.sportSlug === "football" ? "kickoff" : "start";
  return (
    <section className={`${styles.hero} ath-on-dark`} id="top" aria-label="Next game">
      <Image className={styles.heroShot} src={content.heroPhoto} alt="" fill priority sizes="100vw" />
      <Motif kind={content.motif} />
      <span className={`ath-display ${styles.heroGhost}`} aria-hidden="true">
        {content.ghostText}
      </span>
      <div className={`ath-wrap ${styles.heroGrid}`}>
        <div className={styles.heroMain}>
          {marquee ? (
            <>
              <div className={styles.heroTags}>
                <StatusTag kind="next" className={styles.heroSportTag}>
                  {levelLabel[marquee.level]} {marquee.sport}
                </StatusTag>
                <span className={`ath-label ${styles.heroMeta}`}>{heroMeta(marquee, marqueeTeamGames)}</span>
              </div>
              <h1 className={`ath-display ${styles.heroTitle}`}>{heroHeadline(marquee)}</h1>
              <div className={styles.matchup}>
                <div className={styles.side}>
                  <span className={`ath-display ${styles.sideName}`}>{school.mascot}</span>
                  {recordLine(marquee.record) ? <span className={`ath-label ${styles.sideMeta}`}>{recordLine(marquee.record)}</span> : null}
                </div>
                <span className={`ath-display ${styles.at}`}>{marquee.homeAway === "away" ? "at" : "vs"}</span>
                <div className={styles.side}>
                  <span className={`ath-display ${styles.sideName}`}>{marquee.opponent}</span>
                  <span className={`ath-label ${styles.sideMeta}`}>
                    {formatShortDate(marquee.startDate)} · {marquee.startTime ? `${timeLabel(marquee)} ${unit}` : "Time TBA"}
                  </span>
                </div>
              </div>
              {start && gameState(marquee, now) !== "final" ? (
                <Countdown
                  startsAt={start.toISOString()}
                  clockOffsetMs={clockOffsetMs}
                  initialNow={now.getTime()}
                  label={`Time until ${unit}`}
                />
              ) : null}
              <div className={styles.heroButtons}>
                {marquee.venueAddress ? (
                  <a className={`${styles.btn} ${styles.btnAccent}`} href={mapsUrl(marquee.venueAddress)}>
                    <PinIcon />
                    Directions to {marquee.venueName}
                  </a>
                ) : null}
                {marquee.streamUrl ? (
                  <a className={`${styles.btn} ${styles.btnLine}`} href={marquee.streamUrl}>
                    <WatchIcon />
                    Watch on NFHS Network
                  </a>
                ) : null}
                <a className={`${styles.btn} ${marquee.venueAddress ? styles.btnLine : styles.btnAccent}`} href={`/api/games/${marquee.id}/ics`}>
                  <CalendarAddIcon />
                  Add to calendar
                </a>
              </div>
            </>
          ) : (
            <h1 className={`ath-display ${styles.heroTitle}`}>
              {school.shortName} {school.mascot}
            </h1>
          )}
        </div>
        <div className={styles.heroAside}>
          {tonight ? <TonightCard game={tonight} now={now} /> : null}
          {streak ? (
            <div className={`${styles.glass} ${styles.streak}`}>
              <span className={styles.streakIcon}>
                <CheckIcon />
              </span>
              <p className={styles.streakText}>
                <b>{streak.headline}</b> {streak.detail}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
