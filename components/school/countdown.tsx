"use client";

import { useEffect, useState } from "react";

import { StatusTag } from "../athletics/status-tag";
import styles from "./countdown.module.css";

interface CountdownProps {
  /** ISO instant the game starts. */
  startsAt: string;
  /** Server clock minus the browser's at render, so a pinned demo clock carries over. */
  clockOffsetMs: number;
  /** Server-rendered "now", so the first client render matches the HTML. */
  initialNow: number;
  label: string;
}

export function remaining(startsAt: number, now: number) {
  let left = Math.max(0, startsAt - now);
  const d = Math.floor(left / 86_400_000);
  left -= d * 86_400_000;
  const h = Math.floor(left / 3_600_000);
  left -= h * 3_600_000;
  const m = Math.floor(left / 60_000);
  left -= m * 60_000;
  const s = Math.floor(left / 1000);
  return { started: startsAt <= now, d, h, m, s };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Counts down to the start, then shows Live (SPEC §4). */
export function Countdown({ startsAt, clockOffsetMs, initialNow, label }: CountdownProps) {
  const start = new Date(startsAt).getTime();
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    const tick = () => setNow(Date.now() + clockOffsetMs);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [clockOffsetMs]);

  const t = remaining(start, now);
  if (t.started) {
    return (
      <p className={styles.live}>
        <StatusTag kind="live" /> Game on. Follow the scoreboard for updates.
      </p>
    );
  }
  return (
    <div className={styles.count} role="timer" aria-label={label}>
      <div>
        <b>{pad(t.d)}</b>
        <span>Days</span>
      </div>
      <div>
        <b>{pad(t.h)}</b>
        <span>Hours</span>
      </div>
      <div>
        <b>{pad(t.m)}</b>
        <span>Min</span>
      </div>
      <div>
        <b>{pad(t.s)}</b>
        <span>Sec</span>
      </div>
    </div>
  );
}

/** "1:23:45", "2 days 03:10:05", or null once started. */
export function compactRemaining(startsAt: number, now: number): string | null {
  const t = remaining(startsAt, now);
  if (t.started) return null;
  const clock = `${t.h > 0 || t.d > 0 ? `${pad(t.h)}:` : ""}${pad(t.m)}:${pad(t.s)}`;
  return t.d > 0 ? `${t.d} ${t.d === 1 ? "day" : "days"} ${clock}` : clock;
}

/** One-line countdown for the game-day page; says Live at the start time. */
export function CompactCountdown({
  startsAt,
  clockOffsetMs,
  initialNow,
  unit,
  startLabel,
  className,
}: {
  startsAt: string;
  clockOffsetMs: number;
  initialNow: number;
  /** "Kickoff" or "Start" */
  unit: string;
  /** "7:30 PM" */
  startLabel: string;
  className?: string;
}) {
  const start = new Date(startsAt).getTime();
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    const tick = () => setNow(Date.now() + clockOffsetMs);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [clockOffsetMs]);
  const text = compactRemaining(start, now);
  return (
    <div className={className} role="timer" aria-label={`Time until ${unit.toLowerCase()}`}>
      <span className="ath-label">{text ? `${unit} in` : `${unit} was ${startLabel}`}</span>
      <span className="ath-display">{text ?? "Live"}</span>
    </div>
  );
}
