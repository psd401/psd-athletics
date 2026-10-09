// The week board (design/PHS-Home.dc.html): one column per day.

import { byStart, levelLabel, opponentLine, timeLabel, type GameState, type GameView, type Level } from "./games";
import { addDays, formatMonthDay, formatWeekday } from "./time";

const levelOrder = Object.keys(levelLabel) as Level[];

export interface BoardCard {
  key: string;
  /** Lead game, for links and status. */
  game: GameView;
  state: GameState;
  levels: Level[];
  levelText: string;
  sport: string;
  opponent: string;
  time: string;
}

export interface BoardDay {
  date: string;
  dow: string;
  label: string;
  isToday: boolean;
  cards: BoardCard[];
}

/**
 * Days from `today` through `today + days`: every weekday, and weekend days
 * only when they have games. Games of the same sport, opponent and start
 * at different levels share a card ("JV · Freshman").
 */
export function boardDays(
  games: { game: GameView; state: GameState }[],
  today: string,
  days: number,
): BoardDay[] {
  const out: BoardDay[] = [];
  for (let i = 0; i <= days; i++) {
    const date = addDays(today, i);
    const dayGames = games.filter((g) => g.game.startDate === date).sort((a, b) => byStart(a.game, b.game));
    const dow = formatWeekday(date);
    if (dayGames.length === 0 && (dow === "Sat" || dow === "Sun")) continue;
    const cards: BoardCard[] = [];
    for (const g of dayGames) {
      const match = cards.find(
        (c) => c.game.sportSlug === g.game.sportSlug && c.game.opponent === g.game.opponent && c.game.startTime === g.game.startTime && c.game.homeAway === g.game.homeAway,
      );
      if (match) {
        match.levels.push(g.game.level);
        match.levels.sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));
        match.levelText = match.levels.map((l) => levelLabel[l]).join(" · ");
        continue;
      }
      cards.push({
        key: g.game.id,
        game: g.game,
        state: g.state,
        levels: [g.game.level],
        levelText: levelLabel[g.game.level],
        sport: g.game.sport,
        opponent: opponentLine(g.game),
        time: g.state === "live" ? "Live now" : timeLabel(g.game),
      });
    }
    out.push({ date, dow, label: formatMonthDay(date), isToday: date === today, cards });
  }
  return out;
}

export type LevelFilter = "all" | "varsity" | "sub";

export function filterBoard(days: BoardDay[], filter: LevelFilter): BoardDay[] {
  if (filter === "all") return days;
  return days.map((d) => ({
    ...d,
    cards: d.cards.filter((c) => (filter === "varsity" ? c.levels.includes("varsity") : c.levels.some((l) => l !== "varsity"))),
  }));
}

/** "AB" from "Ross Filkins": initials for an office contact's avatar. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0]!.toUpperCase())
    .slice(0, 2)
    .join("");
}
