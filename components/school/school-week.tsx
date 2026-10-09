"use client";

import { useState } from "react";

import { levelLabel, opponentLine, timeLabel, type GameState, type GameView } from "../../lib/schedule/games";
import { GameActions } from "../athletics/game-actions";
import { StatusTag } from "../athletics/status-tag";
import styles from "./school.module.css";

export interface WeekGame {
  game: GameView;
  state: GameState;
  dow: string;
  day: string;
  dateLabel: string;
}

type Filter = "all" | "home" | "away" | "sport";

/** This week as cards, with All / Home / Away / marquee-sport chips (design/GHHS-Home.dc.html). */
export function SchoolWeek({
  games,
  rangeLabel,
  sport,
}: {
  games: WeekGame[];
  rangeLabel: string;
  /** The marquee sport's chip, e.g. Football. */
  sport: { slug: string; name: string } | null;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const options: [Filter, string][] = [
    ["all", "All games"],
    ["home", "Home"],
    ["away", "Away"],
    ...(sport ? ([["sport", sport.name]] as [Filter, string][]) : []),
  ];
  const shown = games.filter(({ game }) =>
    filter === "all"
      ? true
      : filter === "home"
        ? game.homeAway === "home"
        : filter === "away"
          ? game.homeAway === "away"
          : game.sportSlug === sport?.slug,
  );

  return (
    <section className={styles.sec} id="week" aria-labelledby="week-title">
      <div className="ath-wrap">
        <div className={styles.secHead}>
          <div className={styles.secTitle}>
            <span className={`ath-label ${styles.kicker}`}>{rangeLabel}</span>
            <h2 id="week-title" className={`ath-display ${styles.h2}`}>
              This week
            </h2>
          </div>
          <div className={styles.chips} role="group" aria-label="Filter games">
            {options.map(([value, label]) => (
              <button key={value} type="button" className={styles.chip} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="ath-visually-hidden" aria-live="polite">
          {shown.length} {shown.length === 1 ? "game" : "games"} shown
        </p>
        {shown.length > 0 ? (
          <ul className={styles.games}>
            {shown.map(({ game, state, dow, day, dateLabel }) => (
              <li key={game.id}>
                <article className={styles.game} aria-label={`${game.sport} ${opponentLine(game)}, ${dateLabel}`}>
                  <div className={styles.gameTop}>
                    <div className={`${styles.stamp} ${game.homeAway === "home" ? "" : styles.stampAway}`} aria-hidden="true">
                      <span className={`ath-label ${styles.stampDow}`}>{dow}</span>
                      <span className={`ath-display ${styles.stampDay}`}>{day}</span>
                    </div>
                    <div className={styles.gameWhat}>
                      <span className={`ath-label ${styles.gameSport}`}>
                        {game.sport} · {levelLabel[game.level]}
                      </span>
                      <h3 className={styles.gameOpp}>{opponentLine(game)}</h3>
                    </div>
                  </div>
                  <div className={styles.gameWhen}>
                    <span>
                      <span className="ath-visually-hidden">{dateLabel}, </span>
                      {timeLabel(game)} · {game.homeAway === "home" ? "Home" : game.homeAway === "away" ? "Away" : "Neutral"}
                    </span>
                    {state === "live" ? <StatusTag kind="live" /> : null}
                    {state === "tonight" ? <StatusTag kind="tonight" /> : null}
                    {state === "today" ? <StatusTag kind="tonight">Today</StatusTag> : null}
                    {game.updatedFields.length > 0 ? <StatusTag kind="updated" /> : null}
                  </div>
                  <GameActions game={game} directionsLabel="Map" className={styles.gameActions} />
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>No games match this filter this week.</div>
        )}
      </div>
    </section>
  );
}
