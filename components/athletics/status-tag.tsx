import type { ReactNode } from "react";

import styles from "./status-tag.module.css";

export type StatusKind = "live" | "tonight" | "final" | "updated" | "home" | "away" | "next";

const words: Record<StatusKind, string> = {
  live: "Live",
  tonight: "Tonight",
  final: "Final",
  updated: "Updated",
  home: "Home",
  away: "Away",
  next: "Next",
};

interface StatusTagProps {
  kind: StatusKind;
  /** Replaces the default word, e.g. a start time on a tonight tag. */
  children?: ReactNode;
  className?: string;
}

/**
 * A game or venue status. Status is never color alone (docs/BRAND.md): the
 * tag always carries a word, and the live and tonight dots are decorative.
 */
export function StatusTag({ kind, children, className }: StatusTagProps) {
  const pulses = kind === "live" || kind === "tonight";
  return (
    <span className={[styles.tag, styles[kind], className].filter(Boolean).join(" ")}>
      {pulses ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children ?? words[kind]}
    </span>
  );
}
