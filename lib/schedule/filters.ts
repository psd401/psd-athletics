// Schedule filters (design/PHS-Schedule.dc.html). They live in the URL so a
// filtered view can be shared and subscribed to as a calendar.

import { levelLabel, type GameView, type Level } from "./games";

export interface ScheduleFilters {
  q: string;
  /** sport slug, or "" for all */
  sport: string;
  level: Level | "";
  where: "home" | "away" | "";
}

export const emptyFilters: ScheduleFilters = { q: "", sport: "", level: "", where: "" };

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: Params, key: string): string {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  const one = Array.isArray(value) ? value[0] : value;
  return (one ?? "").trim();
}

const levels = Object.keys(levelLabel) as Level[];

/** Unknown values fall back to "all", so a bad link still shows a schedule. */
export function parseFilters(params: Params): ScheduleFilters {
  const level = read(params, "level");
  const where = read(params, "where");
  const sport = read(params, "sport");
  return {
    q: read(params, "q").slice(0, 60),
    sport: /^[a-z0-9-]{1,40}$/.test(sport) ? sport : "",
    level: (levels as string[]).includes(level) ? (level as Level) : "",
    where: where === "home" || where === "away" ? where : "",
  };
}

export function filtersToQuery(filters: ScheduleFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.sport) params.set("sport", filters.sport);
  if (filters.level) params.set("level", filters.level);
  if (filters.where) params.set("where", filters.where);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasFilters(filters: ScheduleFilters): boolean {
  return Boolean(filters.q || filters.sport || filters.level || filters.where);
}

/** Search matches the opponent or the sport, ignoring case. */
export function filterGames(games: GameView[], filters: ScheduleFilters): GameView[] {
  const q = filters.q.toLowerCase();
  return games.filter(
    (g) =>
      (!filters.sport || g.sportSlug === filters.sport) &&
      (!filters.level || g.level === filters.level) &&
      (!filters.where || g.homeAway === filters.where) &&
      (!q || g.opponent.toLowerCase().includes(q) || g.sport.toLowerCase().includes(q)),
  );
}

/** A name for a filtered calendar: "Seahawks · Football · Varsity · Home". */
export function filterName(mascot: string, filters: ScheduleFilters, sportName: string | null): string {
  return [
    mascot,
    sportName,
    filters.level ? levelLabel[filters.level] : null,
    filters.where === "home" ? "Home" : filters.where === "away" ? "Away" : null,
    filters.q ? `“${filters.q}”` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
