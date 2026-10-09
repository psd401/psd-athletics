"use client";

import Link from "next/link";
import { useState } from "react";

import { filterBoard, type BoardDay, type LevelFilter } from "../../lib/schedule/board";
import { CalendarAddIcon } from "../athletics/icons";
import styles from "./seahawks.module.css";
import school from "./school.module.css";

const options: [LevelFilter, string][] = [
  ["all", "All levels"],
  ["varsity", "Varsity"],
  ["sub", "JV & Freshman"],
];

/** "The week ahead" as a board of days with a level filter (design/PHS-Home.dc.html). */
export function WeekBoard({
  days,
  kicker,
  schoolSlug,
  mascot,
  featureId,
}: {
  days: BoardDay[];
  kicker: string;
  schoolSlug: string;
  mascot: string;
  /** The marquee game, drawn as the feature card. */
  featureId: string | null;
}) {
  const [filter, setFilter] = useState<LevelFilter>("all");
  const shown = filterBoard(days, filter);
  const count = shown.reduce((n, d) => n + d.cards.length, 0);
  return (
    <section className={school.sec} id="week" aria-labelledby="week-title">
      <div className="ath-wrap">
        <div className={school.secHead}>
          <div className={school.secTitle}>
            <span className={`ath-label ${school.kicker}`}>{kicker}</span>
            <h2 id="week-title" className={`ath-display ${school.h2}`}>
              The week ahead
            </h2>
          </div>
          <div className={school.chips} role="group" aria-label="Filter by level">
            {options.map(([value, label]) => (
              <button key={value} type="button" className={school.chip} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <p className="ath-visually-hidden" aria-live="polite">
          {count} {count === 1 ? "game" : "games"} shown
        </p>
        <div className={styles.board}>
          {shown.map((day) => (
            <div className={styles.col} key={day.date}>
              <h3 className={`${styles.colHead} ${day.isToday ? styles.colToday : ""}`}>
                <span className={`ath-display ${styles.colDow}`}>{day.isToday ? "Today" : day.dow}</span>{" "}
                <span className={`ath-label ${styles.colDate}`}>{day.label}</span>
              </h3>
              {day.cards.length === 0 ? (
                <p className={styles.nogames}>No games</p>
              ) : (
                <ul className={styles.cards}>
                  {day.cards.map((card) => (
                    <li key={card.key}>
                      <Link
                        className={`${styles.evt} ${card.game.id === featureId ? styles.feature : ""}`}
                        href={`/${schoolSlug}/teams/${card.game.sportSlug}${card.levels.includes("varsity") ? "" : `?level=${card.levels[0]}`}`}
                      >
                        <span className={styles.lvl}>{card.levelText}</span>
                        <span className={styles.evtSport}>{card.sport}</span>
                        <span className={styles.evtOpp}>{card.opponent}</span>
                        <span className={styles.evtTime}>{card.time}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        <div className={school.weekMore}>
          <Link className={`${school.btn} ${school.btnBrand}`} href={`/${schoolSlug}/schedule`}>
            Full {mascot} schedule
          </Link>
          <Link className={`${school.btn} ${school.btnGhost}`} href={`/${schoolSlug}/schedule`}>
            <CalendarAddIcon />
            Subscribe to the {mascot} calendar
          </Link>
        </div>
      </div>
    </section>
  );
}
