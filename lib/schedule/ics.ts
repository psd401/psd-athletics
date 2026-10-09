// iCalendar (RFC 5545) output for games. One event per game; feeds for a
// school, team or filtered view reuse calendar() in task 2.3.

import { levelLabel, opponentLine, startInstant, type GameView } from "./games";

/** Escape TEXT values (RFC 5545 §3.3.11). */
export function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Fold lines longer than 75 octets (RFC 5545 §3.1). */
export function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const len = new TextEncoder().encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (size + len > limit) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += len;
  }
  out.push(current);
  return out.join("\r\n ");
}

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function gameSummary(game: GameView): string {
  const level = game.level === "varsity" ? "" : ` (${levelLabel[game.level]})`;
  return `${game.schoolShortName} ${game.sport}${level} ${opponentLine(game)}`;
}

function eventLines(game: GameView, siteUrl: string, stamp: Date): string[] {
  const start = startInstant(game);
  const lines = [
    "BEGIN:VEVENT",
    `UID:${game.id}@athletics.psd401.net`,
    `DTSTAMP:${utcStamp(stamp)}`,
    // No end time: the schedule doesn't say how long a game runs. A game with
    // no listed start time is an all-day event on its date.
    start ? `DTSTART:${utcStamp(start)}` : `DTSTART;VALUE=DATE:${game.startDate.replace(/-/g, "")}`,
    `SUMMARY:${escapeText(gameSummary(game))}`,
  ];
  if (game.venueAddress) lines.push(`LOCATION:${escapeText(game.venueAddress)}`);
  const notes = [game.label, start ? null : "Start time not listed yet.", `Latest schedule: ${siteUrl}/${game.schoolSlug}`];
  lines.push(`DESCRIPTION:${escapeText(notes.filter(Boolean).join("\n"))}`);
  if (game.status === "cancelled") lines.push("STATUS:CANCELLED");
  lines.push("END:VEVENT");
  return lines;
}

export function calendar(games: GameView[], { name, siteUrl, stamp }: { name: string; siteUrl: string; stamp: Date }): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Peninsula School District//Athletics//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "X-WR-TIMEZONE:America/Los_Angeles",
    ...games.flatMap((g) => eventLines(g, siteUrl, stamp)),
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
