// Team page summaries (design/GHHS-Football.dc.html). Pure functions.

import type { TeamRecord } from "../db/schema";
import { byStart, gameState, result, type GameState, type GameView } from "./games";
import { formatRecord, ordinal } from "./school";

/** The record band: only what the published record has, in the comp's order. */
export function recordStats(record: TeamRecord): { value: string; label: string }[] {
  const stats: { value: string; label: string }[] = [];
  if (record.overall) stats.push({ value: formatRecord(record.overall), label: "Overall" });
  if (record.league) stats.push({ value: formatRecord(record.league), label: record.leagueRank ? `League · ${ordinal(record.leagueRank)}` : "League" });
  if (record.pointsFor !== undefined) stats.push({ value: String(record.pointsFor), label: "Points for" });
  if (record.pointsAgainst !== undefined) stats.push({ value: String(record.pointsAgainst), label: "Points against" });
  if (record.home) stats.push({ value: formatRecord(record.home), label: "Home" });
  if (record.away) stats.push({ value: formatRecord(record.away), label: "Away" });
  if (record.streak) stats.push({ value: record.streak, label: "Streak" });
  return stats;
}

export type ResultCell =
  | { kind: "final"; outcome: "W" | "L" | "T"; score: string }
  | { kind: "next" }
  | { kind: "live" }
  | { kind: "unreported" }
  | { kind: "upcoming" }
  | { kind: "postponed" }
  | { kind: "cancelled" };

export interface TeamRow {
  game: GameView;
  state: GameState;
  note: string | null;
  cell: ResultCell;
}

/** League / Non-league / the game's label; nothing when the source doesn't say. */
export function gameNote(game: GameView): string | null {
  if (game.label) return game.label;
  if (game.isLeague === true) return "League";
  if (game.isLeague === false) return "Non-league";
  return null;
}

/** Rows for the schedule & results table, with the next game marked. */
export function teamRows(games: GameView[], now: Date): TeamRow[] {
  const sorted = [...games].sort(byStart);
  const next = sorted.find((g) => ["tonight", "today", "upcoming"].includes(gameState(g, now)));
  return sorted.map((game) => {
    const state = gameState(game, now);
    const r = result(game);
    const cell: ResultCell =
      r !== null
        ? { kind: "final", outcome: r, score: `${game.scoreUs}–${game.scoreThem}` }
        : state === "live"
          ? { kind: "live" }
          : state === "unreported"
            ? { kind: "unreported" }
            : state === "postponed" || state === "cancelled"
              ? { kind: state }
              : game.id === next?.id
                ? { kind: "next" }
                : { kind: "upcoming" };
    return { game, state, note: gameNote(game), cell };
  });
}
