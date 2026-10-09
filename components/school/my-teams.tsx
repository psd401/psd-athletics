"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { levelLabel, opponentLine, timeLabel, type GameView, type Level } from "../../lib/schedule/games";
import { formatShortDate, formatWeekday } from "../../lib/schedule/time";
import styles from "./phone.module.css";

export interface PickableTeam {
  id: string;
  sport: string;
  level: Level;
}

const storageKey = (slug: string) => `athletics:my-teams:${slug}`;

function load(slug: string): string[] {
  try {
    const raw = window.localStorage.getItem(storageKey(slug));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function save(slug: string, ids: string[]) {
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(ids));
  } catch {
    // Private windows can refuse storage; the picks just won't be remembered.
  }
}

/**
 * "My teams" on phones: the visitor picks teams on this device (no account,
 * nothing sent anywhere) and sees their next games or this week's.
 */
export function MyTeams({
  slug,
  teams,
  games,
  weekEnd,
}: {
  slug: string;
  teams: PickableTeam[];
  /** Upcoming games, soonest first. */
  games: GameView[];
  /** Last date of "This week". */
  weekEnd: string;
}) {
  const [mine, setMine] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [when, setWhen] = useState<"next" | "week">("next");
  const id = useId();

  useEffect(() => {
    // Read once after hydration: storage isn't available on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from browser storage
    setMine(load(slug));
  }, [slug]);

  const toggle = (teamId: string) => {
    const next = mine.includes(teamId) ? mine.filter((x) => x !== teamId) : [...mine, teamId];
    setMine(next);
    save(slug, next);
  };

  const myGames = games.filter((g) => mine.includes(g.teamId));
  const shown = when === "next" ? myGames.slice(0, 2) : myGames.filter((g) => g.startDate <= weekEnd);

  return (
    <section className={`${styles.phoneOnly} ${styles.section}`} aria-labelledby={`${id}-title`}>
      <div className={styles.head}>
        <h2 id={`${id}-title`} className={`ath-display ${styles.h2}`}>
          My teams
        </h2>
        <button type="button" className={styles.edit} aria-expanded={editing} aria-controls={`${id}-picker`} onClick={() => setEditing((v) => !v)}>
          {editing ? "Done" : mine.length ? "Edit" : "Pick teams"}
        </button>
      </div>
      {editing ? (
        <fieldset id={`${id}-picker`} className={styles.picker}>
          <legend>Teams to show on this phone</legend>
          {teams.map((t) => (
            <label key={t.id} className={styles.pick}>
              <input type="checkbox" checked={mine.includes(t.id)} onChange={() => toggle(t.id)} />
              {t.sport} · {levelLabel[t.level]}
            </label>
          ))}
        </fieldset>
      ) : null}
      {mine.length === 0 ? (
        <p className={styles.empty}>Pick your teams to see their next games here. Your picks stay on this phone.</p>
      ) : (
        <>
          <div className={styles.seg} role="group" aria-label="When">
            <button type="button" aria-pressed={when === "next"} onClick={() => setWhen("next")}>
              Next up
            </button>
            <button type="button" aria-pressed={when === "week"} onClick={() => setWhen("week")}>
              This week
            </button>
          </div>
          {shown.length === 0 ? (
            <p className={styles.empty}>No games for your teams {when === "next" ? "coming up" : "this week"}.</p>
          ) : (
            <ul className={styles.list}>
              {shown.map((g) => (
                <li key={g.id}>
                  <Link className={styles.item} href={`/${slug}/game/${g.id}`}>
                    <span className={styles.stamp} aria-hidden="true">
                      <span className="ath-label">{formatWeekday(g.startDate)}</span>
                      <span className="ath-display">{Number(g.startDate.slice(8))}</span>
                    </span>
                    <span className={styles.itemText}>
                      <span className={`ath-label ${styles.small}`}>
                        {g.sport} · {levelLabel[g.level]}
                      </span>
                      <b>{opponentLine(g)}</b>
                      <span className={styles.small}>
                        <span className="ath-visually-hidden">{formatShortDate(g.startDate)}, </span>
                        {timeLabel(g)}
                        {g.homeAway === "home" ? " · Home" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
