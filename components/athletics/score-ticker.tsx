"use client";

import { useState } from "react";

import type { TickerItem } from "../../lib/schedule/games";
import { PauseIcon, PlayIcon } from "./icons";
import styles from "./score-ticker.module.css";
import { StatusTag } from "./status-tag";

interface ScoreTickerProps {
  items: TickerItem[];
  /** "Scores" on the hub, "Scoreboard" on school pages. */
  label: string;
  variant: "hub" | "school";
  regionLabel: string;
}

/**
 * Scrolling scores (SPEC §4). It moves for more than five seconds, so it has
 * a pause button and pauses on hover and focus (WCAG 2.2.2); under
 * prefers-reduced-motion it doesn't move at all.
 */
export function ScoreTicker({ items, label, variant, regionLabel }: ScoreTickerProps) {
  const [paused, setPaused] = useState(false);
  if (items.length === 0) return null;
  const anyLive = items.some((i) => i.kind === "live");

  const renderItems = (copy: "main" | "duplicate") =>
    items.map((item) => (
      <li
        key={`${copy}-${item.key}`}
        className={[styles.item, copy === "duplicate" ? styles.duplicate : ""].join(" ")}
        aria-hidden={copy === "duplicate" ? true : undefined}
      >
        <StatusTag kind={item.kind} className={styles[item.kind]}>
          {item.tag}
        </StatusTag>
        <b>{item.lead}</b>
        {item.text}
      </li>
    ));

  return (
    <section className={`${styles.ticker} ${styles[variant]} ath-on-dark`} aria-label={regionLabel}>
      <div className={styles.inner}>
        <span className={styles.label}>
          {anyLive ? <span className={styles.dot} aria-hidden="true" /> : null}
          {label}
        </span>
        <div className={styles.viewport}>
          <ul className={styles.track} data-paused={paused}>
            {renderItems("main")}
            {renderItems("duplicate")}
          </ul>
        </div>
        <button
          type="button"
          className={styles.pause}
          aria-pressed={paused}
          aria-label={paused ? "Play scores" : "Pause scores"}
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
      </div>
    </section>
  );
}
