"use client";

import Link from "next/link";
import { useState } from "react";

import { initials } from "../../lib/schedule/board";
import school from "./school.module.css";
import seahawks from "./seahawks.module.css";
import styles from "./staff.module.css";

export interface CoachCard {
  teamId: string;
  term: "fall" | "winter" | "spring";
  sport: string;
  href: string;
  coach: string | null;
}

const seasons: ["all" | CoachCard["term"], string][] = [
  ["all", "All seasons"],
  ["fall", "Fall"],
  ["winter", "Winter"],
  ["spring", "Spring"],
];
const termLabel = { fall: "Fall", winter: "Winter", spring: "Spring" } as const;

/** Head coaches by season with search (design/PHS-Staff.dc.html). */
export function CoachDirectory({ cards }: { cards: CoachCard[] }) {
  const [season, setSeason] = useState<"all" | CoachCard["term"]>("all");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const shown = cards.filter(
    (c) => (season === "all" || c.term === season) && (!query || c.sport.toLowerCase().includes(query) || c.coach?.toLowerCase().includes(query)),
  );

  return (
    <section className={styles.section} aria-labelledby="coaches-title">
      <div className={styles.coachesHead}>
        <h2 id="coaches-title" className={`ath-display ${styles.h2}`}>
          Head coaches
        </h2>
        <label className={styles.search} htmlFor="staff-q" style={{ boxShadow: "inset 0 0 0 1.5px var(--ath-line-strong)" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="ath-visually-hidden">Search coaches and sports</span>
          <input id="staff-q" type="search" placeholder="Search a sport or name" value={q} onChange={(e) => setQ(e.target.value.slice(0, 60))} />
        </label>
        <div className={school.chips} role="group" aria-label="Season">
          {seasons.map(([value, label]) => (
            <button key={value} type="button" className={school.chip} aria-pressed={season === value} onClick={() => setSeason(value)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="ath-visually-hidden" aria-live="polite">
        {shown.length} {shown.length === 1 ? "team" : "teams"} shown
      </p>
      {shown.length > 0 ? (
        <ul className={styles.grid}>
          {shown.map((c) => (
            <li key={c.teamId} className={styles.coach}>
              <div className={styles.coachTop}>
                <span className={`${seahawks.avatar} ${styles.coachAvatar}`} aria-hidden="true">
                  {initials(c.sport)}
                </span>
                <span className={styles.coachText}>
                  <span className={`ath-label ${styles.coachSport}`}>
                    {termLabel[c.term]} · {c.sport}
                  </span>
                  {c.coach ? <h3 className={styles.coachName}>{c.coach}</h3> : <p className={styles.notListed}>Head coach not listed yet</p>}
                </span>
              </div>
              <div className={styles.coachLinks}>
                <Link className={`${seahawks.btn} ${seahawks.btnGhost}`} href={c.href}>
                  {c.sport} team page
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>No sport or coach matches that search.</div>
      )}
      <p className={styles.small}>
        Coach email addresses aren&apos;t shown here. A &ldquo;Message the coach&rdquo; button that delivers to the coach&apos;s district inbox is
        coming; until then, the athletics office can pass a message along.
      </p>
    </section>
  );
}
