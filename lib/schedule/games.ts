// Pure schedule logic shared by the hub, school pages and calendar feeds.
// Nothing here reads the database or the clock; callers pass `now`.

import type { TeamRecord } from "../db/schema";
import { addDays, formatTime, formatWeekday, pacificDate, pacificInstant } from "./time";

export type Level = "varsity" | "jv" | "c_team" | "freshman";
export type GameStatus = "scheduled" | "live" | "final" | "postponed" | "cancelled";

/** One game as pages see it: plain data, safe to pass to Client Components. */
export interface GameView {
  id: string;
  schoolId: string;
  schoolSlug: string;
  schoolShortName: string;
  mascot: string;
  teamId: string;
  sport: string;
  sportSlug: string;
  level: Level;
  opponent: string;
  homeAway: "home" | "away" | "neutral";
  /** YYYY-MM-DD, Pacific */
  startDate: string;
  /** HH:MM:SS, Pacific; null when the source doesn't list a time */
  startTime: string | null;
  status: GameStatus;
  scoreUs: number | null;
  scoreThem: number | null;
  isLeague: boolean | null;
  label: string | null;
  streamUrl: string | null;
  ticketUrl: string | null;
  venueName: string | null;
  venueAddress: string | null;
  record: TeamRecord;
  source: "fixture" | "arbiter";
  updatedFields: string[];
}

export type GameState = "live" | "tonight" | "today" | "upcoming" | "final" | "unreported" | "postponed" | "cancelled";

/** Evening starts here: games from 5 PM (or with no listed time) are "Tonight". */
const EVENING = "17:00:00";

/**
 * Live and Final come from the source's status; the clock only decides
 * Tonight/Today/Upcoming, and flags past games with no reported result.
 */
export function gameState(game: GameView, now: Date): GameState {
  if (game.status === "live" || game.status === "final" || game.status === "postponed" || game.status === "cancelled") {
    return game.status;
  }
  const today = pacificDate(now);
  if (game.startDate < today) return "unreported";
  if (game.startDate > today) return "upcoming";
  return game.startTime === null || game.startTime >= EVENING ? "tonight" : "today";
}

export function result(game: GameView): "W" | "L" | "T" | null {
  if (game.status !== "final" || game.scoreUs === null || game.scoreThem === null) return null;
  if (game.scoreUs > game.scoreThem) return "W";
  if (game.scoreUs < game.scoreThem) return "L";
  return "T";
}

export const levelLabel: Record<Level, string> = {
  varsity: "Varsity",
  jv: "JV",
  c_team: "C-team",
  freshman: "Freshman",
};

/** "vs Silas" at home, "@ Silas" away. */
export function opponentLine(game: GameView): string {
  return game.homeAway === "away" ? `@ ${game.opponent}` : `vs ${game.opponent}`;
}

export const homeAwayLabel = (game: GameView) =>
  game.homeAway === "home" ? "Home" : game.homeAway === "away" ? "Away" : "Neutral";

/** "7:30 PM", "Now" for a live game with no listed time, "Time TBA" otherwise. */
export function timeLabel(game: GameView): string {
  if (game.startTime) return formatTime(game.startTime);
  return game.status === "live" ? "Now" : "Time TBA";
}

export function startInstant(game: GameView): Date | null {
  return game.startTime ? pacificInstant(game.startDate, game.startTime) : null;
}

export function byStart(a: GameView, b: GameView): number {
  if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1;
  // Live games first, then by time; unknown times last.
  if ((a.status === "live") !== (b.status === "live")) return a.status === "live" ? -1 : 1;
  if (a.startTime === b.startTime) return a.sport.localeCompare(b.sport);
  if (a.startTime === null) return 1;
  if (b.startTime === null) return -1;
  return a.startTime < b.startTime ? -1 : 1;
}

export interface DayGroup {
  date: string;
  games: GameView[];
}

/** Games from `from` for `days` days (inclusive of `from`), grouped by day, empty days dropped. */
export function groupByDay(games: GameView[], from: string, days: number): DayGroup[] {
  const to = addDays(from, days);
  const inRange = games.filter((g) => g.startDate >= from && g.startDate <= to).sort(byStart);
  const groups: DayGroup[] = [];
  for (const game of inRange) {
    const last = groups.at(-1);
    if (last?.date === game.startDate) last.games.push(game);
    else groups.push({ date: game.startDate, games: [game] });
  }
  return groups;
}

const notOver = (g: GameView, now: Date) => {
  const state = gameState(g, now);
  return state === "live" || state === "tonight" || state === "today" || state === "upcoming";
};

/**
 * The game a school's hero counts down to: the next varsity football game
 * that isn't over, otherwise the next varsity game (PLAN §4, QUESTIONS 22).
 */
export function marqueeGame(schoolGames: GameView[], now: Date): GameView | null {
  const upcoming = schoolGames.filter((g) => g.level === "varsity" && notOver(g, now)).sort(byStart);
  return upcoming.find((g) => g.sportSlug === "football") ?? upcoming[0] ?? null;
}

/** Results of the team's last `n` finals, oldest first. */
export function recentForm(teamGames: GameView[], n: number): ("W" | "L" | "T")[] {
  return teamGames
    .filter((g) => result(g) !== null)
    .sort(byStart)
    .slice(-n)
    .map((g) => result(g)!);
}

/** Consecutive wins ending with the team's most recent final. */
export function winStreak(teamGames: GameView[]): number {
  const form = recentForm(teamGames, teamGames.length);
  let streak = 0;
  for (let i = form.length - 1; i >= 0 && form[i] === "W"; i--) streak++;
  return streak;
}

/** Most recent finals first. */
export function latestFinals(games: GameView[], limit: number): GameView[] {
  return games
    .filter((g) => result(g) !== null)
    .sort((a, b) => -byStart(a, b))
    .slice(0, limit);
}

export interface TickerItem {
  key: string;
  kind: "live" | "tonight" | "final" | "next";
  tag: string;
  lead: string;
  text: string;
}

function tickerItem(game: GameView, now: Date, mode: "hub" | "school"): TickerItem | null {
  const state = gameState(game, now);
  const lead = mode === "hub" ? game.schoolShortName : game.sport;
  const sport = mode === "hub" ? `${game.sport} ` : "";
  if (state === "live") {
    return { key: game.id, kind: "live", tag: "Live", lead, text: `${sport}${opponentLine(game)}` };
  }
  if (state === "tonight" || state === "today") {
    const when = mode === "school" ? `, ${state}` : "";
    return { key: game.id, kind: "tonight", tag: timeLabel(game), lead, text: `${sport}${opponentLine(game)}${when}` };
  }
  if (state === "final") {
    if (mode === "hub") {
      return {
        key: game.id,
        kind: "final",
        tag: "Final",
        lead,
        text: `${game.sport} ${game.scoreUs}, ${game.opponent} ${game.scoreThem}`,
      };
    }
    const prefix = game.homeAway === "away" ? "@ " : "";
    return {
      key: game.id,
      kind: "final",
      tag: "Final",
      lead: `${game.sport} ${game.scoreUs}`,
      text: `${prefix}${game.opponent} ${game.scoreThem}`,
    };
  }
  if (state === "upcoming") {
    const time = game.startTime ? (mode === "hub" ? ` ${timeLabel(game)}` : `, ${timeLabel(game)}`) : "";
    return { key: game.id, kind: "next", tag: formatWeekday(game.startDate), lead, text: `${sport}${opponentLine(game)}${time}` };
  }
  return null;
}

/**
 * Scoreboard ticker: live games, today's games, recent finals, then each
 * school's next marquee game. `mode` changes the wording: the hub leads with
 * the school, a school page leads with the sport.
 */
export function tickerItems(
  games: GameView[],
  now: Date,
  { mode, finals }: { mode: "hub" | "school"; finals: number },
): TickerItem[] {
  const sorted = [...games].sort(byStart);
  const today = sorted.filter((g) => {
    const s = gameState(g, now);
    return s === "live" || s === "tonight" || s === "today";
  });
  const recent = latestFinals(sorted, finals);
  const schools = [...new Set(sorted.map((g) => g.schoolId))];
  const next = schools
    .map((id) => marqueeGame(sorted.filter((g) => g.schoolId === id), now))
    .filter((g): g is GameView => g !== null && gameState(g, now) === "upcoming");
  const seen = new Set<string>();
  return [...today, ...recent, ...next]
    .filter((g) => (seen.has(g.id) ? false : (seen.add(g.id), true)))
    .map((g) => tickerItem(g, now, mode))
    .filter((x): x is TickerItem => x !== null);
}

export interface FishBowlResult {
  date: string;
  hostShortName: string;
  sides: { schoolId: string; schoolShortName: string; mascot: string; score: number; winner: boolean }[];
}

/** The latest Fish Bowl with a final score, from either school's schedule. */
export function latestFishBowl(games: GameView[]): FishBowlResult | null {
  const finals = games.filter((g) => g.label === "The Fish Bowl" && result(g) !== null).sort((a, b) => -byStart(a, b));
  const game = finals[0];
  if (!game) return null;
  const other = finals.find((g) => g.startDate === game.startDate && g.schoolId !== game.schoolId);
  const host = game.homeAway === "home" ? game.schoolShortName : (other?.schoolShortName ?? game.opponent);
  const sides = [
    { schoolId: game.schoolId, schoolShortName: game.schoolShortName, mascot: game.mascot, score: game.scoreUs! },
    other
      ? { schoolId: other.schoolId, schoolShortName: other.schoolShortName, mascot: other.mascot, score: other.scoreUs! }
      : { schoolId: "", schoolShortName: game.opponent, mascot: "", score: game.scoreThem! },
  ].map((s, _, all) => ({ ...s, winner: s.score > Math.min(...all.map((x) => x.score)) }));
  sides.sort((a, b) => b.score - a.score);
  return { date: game.startDate, hostShortName: host, sides };
}
