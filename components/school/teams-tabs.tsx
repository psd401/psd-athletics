"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import styles from "./school.module.css";

export interface SeasonTeams {
  term: "fall" | "winter" | "spring";
  label: string;
  teams: { name: string; meta: string }[];
}

/** Teams by season as ARIA tabs: arrow keys move between seasons. */
export function TeamsTabs({ seasons, initial }: { seasons: SeasonTeams[]; initial: SeasonTeams["term"] }) {
  const [selected, setSelected] = useState(initial);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = seasons.find((s) => s.term === selected) ?? seasons[0];

  // The Teams menu links to #teams-<season>; open that season when it does.
  useEffect(() => {
    const fromHash = () => {
      const term = window.location.hash.replace("#teams-", "");
      if (seasons.some((s) => s.term === term)) setSelected(term as SeasonTeams["term"]);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [seasons]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = seasons.length - 1;
    const next = e.key === "ArrowRight" ? (index === last ? 0 : index + 1) : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    setSelected(seasons[next]!.term);
    tabs.current[next]?.focus();
  }

  return (
    <section className={styles.sec} id="teams" aria-labelledby="teams-title">
      <div className="ath-wrap">
        <div className={styles.secHead}>
          <h2 id="teams-title" className={`ath-display ${styles.h2}`}>
            Teams
          </h2>
          <div className={styles.chips} role="tablist" aria-label="Season">
            {seasons.map((season, i) => (
              <button
                key={season.term}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                id={`teams-tab-${season.term}`}
                type="button"
                role="tab"
                className={styles.chip}
                aria-selected={season.term === selected}
                aria-controls="teams-panel"
                tabIndex={season.term === selected ? 0 : -1}
                onClick={() => setSelected(season.term)}
                onKeyDown={(e) => onKeyDown(e, i)}
              >
                {season.label}
              </button>
            ))}
          </div>
        </div>
        {seasons.map((season) => (
          <span key={season.term} id={`teams-${season.term}`} />
        ))}
        <div id="teams-panel" role="tabpanel" aria-labelledby={`teams-tab-${current?.term}`} tabIndex={0}>
          <ul className={styles.teams}>
            {current?.teams.map((team) => (
              <li key={team.name}>
                <div className={styles.team}>
                  <h3 className={`ath-display ${styles.teamName}`}>{team.name}</h3>
                  <p className={styles.teamMeta}>{team.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
