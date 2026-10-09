// Month grid for the schedule's month view: weeks start on Sunday.

import { addDays } from "./time";

export interface MonthCell {
  date: string;
  inMonth: boolean;
}

/** "2026-10" → the Sunday-first weeks covering October 2026. */
export function monthGrid(month: string): MonthCell[][] {
  const first = `${month}-01`;
  const [y, m] = month.split("-").map(Number) as [number, number];
  const startDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const start = addDays(first, -startDow);
  const weeks = Math.ceil((startDow + daysInMonth) / 7);
  return Array.from({ length: weeks }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = addDays(start, w * 7 + d);
      return { date, inMonth: date.startsWith(month) };
    }),
  );
}

/** Months ("YYYY-MM") that have at least one of the dates, in order. */
export function monthsOf(dates: string[]): string[] {
  return [...new Set(dates.map((d) => d.slice(0, 7)))].sort();
}
