// Wording and summaries for a school's home page. Pure functions over games.

import type { TeamRecord } from "../db/schema";
import { byStart, gameState, levelLabel, opponentLine, recentForm, result, winStreak, type GameView, type Level } from "./games";
import { formatLongWeekday, formatWeekday } from "./time";

/** "3-2" → "3–2" (en dash, as in the comps). */
export const formatRecord = (record: string) => record.replace(/-/g, "–");

export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
}

const words = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
export const numberWord = (n: number) => words[n] ?? String(n);

/** "Friday night at Central Kitsap." · "Friday night at home." · "Saturday at Lincoln." */
export function heroHeadline(game: GameView): string {
  const day = formatLongWeekday(game.startDate);
  const when = game.startTime && game.startTime >= "17:00:00" ? `${day} night` : day;
  const where = game.homeAway === "home" ? "at home" : `at ${game.opponent}`;
  return `${when} ${where}.`;
}

/** "Game 6 · League · Away". League is left out when the source doesn't say. */
export function heroMeta(game: GameView, teamGames: GameView[]): string {
  const ordered = teamGames.filter((g) => g.status !== "cancelled").sort(byStart);
  const index = ordered.findIndex((g) => g.id === game.id);
  const parts = [index >= 0 ? `Game ${index + 1}` : null];
  if (game.isLeague === true) parts.push("League");
  if (game.isLeague === false) parts.push("Non-league");
  parts.push(game.homeAway === "home" ? "Home" : game.homeAway === "away" ? "Away" : "Neutral");
  return parts.filter(Boolean).join(" · ");
}

/** "3–2 · League 2–0", or whatever part of that is known. */
export function recordLine(record: TeamRecord): string {
  return [record.overall && formatRecord(record.overall), record.league && `League ${formatRecord(record.league)}`]
    .filter(Boolean)
    .join(" · ");
}

export interface FormCard {
  teamId: string;
  sport: string;
  sportSlug: string;
  level: Level;
  record: string;
  aside: string[];
  form: ("W" | "L" | "T")[];
  formLabel: string;
  next: string | null;
}

const resultWord = { W: "win", L: "loss", T: "tie" } as const;

function formLabel(form: ("W" | "L" | "T")[]): string {
  const count = form.length === 1 ? "Last game" : `Last ${numberWord(form.length)}`;
  if (form.length > 1 && form.every((r) => r === "W")) return `${count}: all wins`;
  return `${count}: ${form.map((r) => resultWord[r]).join(", ")}`;
}

function nextLine(teamGames: GameView[], now: Date): string | null {
  const next = teamGames.filter((g) => ["live", "tonight", "today", "upcoming"].includes(gameState(g, now))).sort(byStart)[0];
  if (!next) return null;
  const state = gameState(next, now);
  const when = state === "live" ? "now" : state === "tonight" ? "tonight" : state === "today" ? "today" : formatWeekday(next.startDate);
  return `Next: ${when} ${opponentLine(next)}`;
}

/**
 * Season form cards: varsity teams with at least one final, the marquee
 * sport first, then the most recently played. Records come from the
 * published record when there is one, otherwise from the finals we have.
 */
export function seasonFormCards(games: GameView[], now: Date, { marqueeSport, limit }: { marqueeSport: string | null; limit: number }): FormCard[] {
  const byTeam = new Map<string, GameView[]>();
  for (const g of games.filter((x) => x.level === "varsity")) byTeam.set(g.teamId, [...(byTeam.get(g.teamId) ?? []), g]);

  const cards = [...byTeam.values()]
    .filter((teamGames) => teamGames.some((g) => result(g) !== null))
    .map((teamGames) => {
      const first = teamGames[0]!;
      const finals = teamGames.filter((g) => result(g) !== null).sort(byStart);
      const lastPlayed = finals.at(-1)!.startDate;
      const wins = finals.filter((g) => result(g) === "W").length;
      const losses = finals.filter((g) => result(g) === "L").length;
      const streak = winStreak(teamGames);
      const aside: string[] = [];
      if (first.record.league) {
        aside.push(`League ${formatRecord(first.record.league)}`);
        if (first.record.leagueRank) aside.push(ordinal(first.record.leagueRank));
      } else if (streak >= 3) {
        aside.push(numberWord(streak)[0]!.toUpperCase() + numberWord(streak).slice(1), "straight");
      }
      const form = recentForm(teamGames, 5);
      return {
        lastPlayed,
        card: {
          teamId: first.teamId,
          sport: first.sport,
          sportSlug: first.sportSlug,
          level: first.level,
          record: formatRecord(first.record.overall ?? `${wins}-${losses}`),
          aside,
          form,
          formLabel: formLabel(form),
          next: nextLine(teamGames, now),
        } satisfies FormCard,
      };
    });

  cards.sort((a, b) => {
    if ((a.card.sportSlug === marqueeSport) !== (b.card.sportSlug === marqueeSport)) return a.card.sportSlug === marqueeSport ? -1 : 1;
    return a.lastPlayed < b.lastPlayed ? 1 : a.lastPlayed > b.lastPlayed ? -1 : 0;
  });
  return cards.slice(0, limit).map((c) => c.card);
}

/** A team tile's second line: its record, a streak, or its levels. */
export function teamMeta(record: TeamRecord, levels: Level[], streak: number): string {
  const line = recordLine(record);
  if (record.league && line) return line;
  if (record.overall && streak >= 3) return `${formatRecord(record.overall)} · Won ${streak} straight`;
  if (line) return line;
  return levels.map((l) => levelLabel[l]).join(" · ");
}

/** "Volleyball has won four straight." + "Beat Mount Tahoma 3–0 on Wednesday." */
export function streakNote(games: GameView[], minimum = 3): { headline: string; detail: string } | null {
  const byTeam = new Map<string, GameView[]>();
  for (const g of games.filter((x) => x.level === "varsity")) byTeam.set(g.teamId, [...(byTeam.get(g.teamId) ?? []), g]);
  const best = [...byTeam.values()]
    .map((teamGames) => ({ teamGames, streak: winStreak(teamGames) }))
    .filter((x) => x.streak >= minimum)
    .sort((a, b) => b.streak - a.streak)[0];
  if (!best) return null;
  const last = best.teamGames.filter((g) => result(g) !== null).sort(byStart).at(-1)!;
  return {
    headline: `${last.sport} has won ${numberWord(best.streak)} straight.`,
    detail: `Beat ${last.opponent} ${last.scoreUs}–${last.scoreThem} on ${formatLongWeekday(last.startDate)}.`,
  };
}
