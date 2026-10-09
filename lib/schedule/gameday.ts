// Game-day page helpers (design/GHHS-GameDay-Mobile.dc.html).

import type { TeamRecord } from "../db/schema";
import { byStart, gameState, type GameView } from "./games";
import { formatRecord, ordinal } from "./school";

/** Up to two stat tiles from the published record: overall + league, and the last-three note. */
export function gameDayStats(record: TeamRecord, mascot: string): { value: string; label: string }[] {
  const stats: { value: string; label: string }[] = [];
  if (record.overall) {
    const league = record.league ? ` · ${formatRecord(record.league)} league${record.leagueRank ? `, ${ordinal(record.leagueRank)}` : ""}` : "";
    stats.push({ value: formatRecord(record.overall), label: `${mascot}${league}` });
  }
  const m = record.lastThree ? /^(\d+-\d+)\s*(.*)$/.exec(record.lastThree) : null;
  if (m?.[1]) {
    const unit = m[2] ? `${m[2][0]!.toUpperCase()}${m[2].slice(1)}, last three` : "Last three";
    stats.push({ value: formatRecord(m[1]), label: unit });
  }
  return stats;
}

/** The school's next games after this one that aren't over. */
export function upNext(schoolGames: GameView[], current: GameView, now: Date, limit: number): GameView[] {
  return schoolGames
    .filter((g) => g.id !== current.id && byStart(g, current) > 0)
    .filter((g) => ["live", "tonight", "today", "upcoming"].includes(gameState(g, now)))
    .sort(byStart)
    .slice(0, limit);
}

/** "Football" → "Kickoff"; everything else starts. */
export const startWord = (sportSlug: string) => (sportSlug === "football" ? "Kickoff" : "Start");
