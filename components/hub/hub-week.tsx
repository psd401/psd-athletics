"use client";

import { useState } from "react";

import { homeAwayLabel, levelLabel, opponentLine, timeLabel, type GameState, type GameView } from "../../lib/schedule/games";
import Link from "next/link";

import { GameActions } from "../athletics/game-actions";
import { ArrowIcon } from "../athletics/icons";
import { StatusTag } from "../athletics/status-tag";
import styles from "./hub.module.css";

export interface WeekDay {
  date: string;
  dow: string;
  label: string;
  games: { game: GameView; state: GameState }[];
}

type SchoolFilter = "all" | "ghhs" | "phs";

const schoolOptions: [SchoolFilter, string][] = [
  ["all", "Both schools"],
  ["ghhs", "Tides"],
  ["phs", "Seahawks"],
];

/** The combined week with school and home-only filters (design/Main.dc.html). */
export function HubWeek({ days, rangeLabel, sourceLine }: { days: WeekDay[]; rangeLabel: string; sourceLine: string }) {
  const [school, setSchool] = useState<SchoolFilter>("all");
  const [homeOnly, setHomeOnly] = useState(false);

  const shown = days
    .map((d) => ({
      ...d,
      games: d.games.filter(({ game }) => (school === "all" || game.schoolId === school) && (!homeOnly || game.homeAway === "home")),
    }))
    .filter((d) => d.games.length > 0);
  const total = shown.reduce((n, d) => n + d.games.length, 0);

  return (
    <section className={styles.sec} id="week" aria-labelledby="week-title">
      <div className="ath-wrap">
        <div className={styles.secHead}>
          <div className={styles.secTitle}>
            <span className={`ath-label ${styles.kicker}`}>{rangeLabel}</span>
            <h2 id="week-title" className={`ath-display ${styles.h2}`}>
              This week on the Peninsula
            </h2>
          </div>
          <div className={styles.filters}>
            <div className={styles.seg} role="group" aria-label="Show games for">
              {schoolOptions.map(([value, label]) => (
                <button key={value} type="button" aria-pressed={school === value} onClick={() => setSchool(value)}>
                  {label}
                </button>
              ))}
            </div>
            <button type="button" className={styles.toggle} aria-pressed={homeOnly} onClick={() => setHomeOnly((v) => !v)}>
              <span className={styles.knob} aria-hidden="true" />
              Home games only
            </button>
          </div>
        </div>
        <p className={styles.countLine} aria-live="polite">
          {total} {total === 1 ? "game" : "games"} · {sourceLine} · Times Pacific
        </p>
        {shown.map((day) => (
          <div className={styles.day} key={day.date}>
            <h3 className={styles.dayLabel}>
              <span className={`ath-display ${styles.dow}`}>{day.dow}</span>{" "}
              <span className={`ath-label ${styles.dayDate}`}>{day.label}</span>
            </h3>
            <ul className={styles.events}>
              {day.games.map(({ game, state }) => (
                <li className={styles.ev} key={game.id}>
                  <div className={styles.evWhen}>
                    <span className={styles.evTime}>{timeLabel(game)}</span>
                    {state === "live" ? <StatusTag kind="live" /> : null}
                    {state === "tonight" ? <StatusTag kind="tonight" /> : null}
                    {state === "today" ? <StatusTag kind="tonight">Today</StatusTag> : null}
                    {state === "final" ? <StatusTag kind="final" /> : null}
                    {game.updatedFields.length > 0 ? <StatusTag kind="updated" /> : null}
                  </div>
                  <div className={styles.evSchool}>
                    <span className={`${styles.schoolTag} ${game.schoolId === "ghhs" ? styles.tagTides : styles.tagHawks}`}>
                      {game.mascot}
                    </span>
                  </div>
                  <div className={styles.evMain}>
                    <p className={styles.evTitle}>
                      {game.sport} <span className={styles.evLevel}>· {levelLabel[game.level]}</span>
                    </p>
                    <span className={styles.evSub}>
                      <StatusTag kind={game.homeAway === "away" ? "away" : "home"}>{homeAwayLabel(game)}</StatusTag>
                      {opponentLine(game)}
                    </span>
                  </div>
                  <GameActions game={game} className={styles.evActions} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        {total === 0 ? <div className={styles.empty}>No games match these filters this week. Try showing both schools.</div> : null}
        <div className={styles.weekMore}>
          <Link className={`${styles.pill} ${styles.pillDark}`} href="/ghh/schedule">
            Gig Harbor schedule
            <ArrowIcon />
          </Link>
          <Link className={`${styles.pill} ${styles.pillDark}`} href="/phs/schedule">
            Peninsula schedule
            <ArrowIcon />
          </Link>
          <span className={styles.weekMoreNote}>Each schedule has calendar links for Google, Apple and Outlook.</span>
        </div>
      </div>
    </section>
  );
}
