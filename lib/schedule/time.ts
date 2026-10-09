// Pacific time helpers. Every game date and time in the data is Pacific
// wall-clock time (America/Los_Angeles); these convert without a library.

export const TIME_ZONE = "America/Los_Angeles";

/** Real time when each ATHLETICS_NOW value was first read, per process. */
const pinnedStarts = new Map<string, number>();

/**
 * The current time. ATHLETICS_NOW sets where the clock starts for tests and
 * demos (Playwright sets it to the fixture snapshot time), and time moves on
 * from there, so changes still get distinct times. It is never set in
 * production.
 */
export function currentTime(): Date {
  const pinned = process.env.ATHLETICS_NOW;
  if (pinned) {
    const d = new Date(pinned);
    if (!Number.isNaN(d.getTime())) {
      if (!pinnedStarts.has(pinned)) pinnedStarts.set(pinned, Date.now());
      return new Date(d.getTime() + (Date.now() - pinnedStarts.get(pinned)!));
    }
  }
  return new Date();
}

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function pacificParts(instant: Date) {
  const p = Object.fromEntries(partsFormatter.formatToParts(instant).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year),
    month: Number(p.month),
    day: Number(p.day),
    hour: Number(p.hour),
    minute: Number(p.minute),
    second: Number(p.second),
  };
}

/** The Pacific calendar date of an instant, as YYYY-MM-DD. */
export function pacificDate(instant: Date): string {
  const p = pacificParts(instant);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** The instant a Pacific wall-clock date and time happens. Handles PDT/PST. */
export function pacificInstant(date: string, time: string): Date {
  const [y, mo, d] = date.split("-").map(Number) as [number, number, number];
  const [h, mi, s = 0] = time.split(":").map(Number) as [number, number, number?];
  const wall = Date.UTC(y, mo - 1, d, h, mi, s);
  // Guess with the offset at that moment, then correct once for DST edges.
  let guess = wall - offsetMs(new Date(wall));
  guess = wall - offsetMs(new Date(guess));
  return new Date(guess);
}

/** Pacific offset from UTC at an instant, in ms (negative: -7h or -8h). */
function offsetMs(instant: Date): number {
  const p = pacificParts(instant);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** YYYY-MM-DD plus n days. */
export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function utcNoon(date: string): Date {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, 12));
}

const fmt = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options });
const shortWeekday = fmt({ weekday: "short" });
const longWeekday = fmt({ weekday: "long" });
const monthDay = fmt({ month: "short", day: "numeric" });
const longMonthDay = fmt({ month: "long", day: "numeric" });
const monthYear = fmt({ month: "long", year: "numeric" });

/** "Thu" */
export const formatWeekday = (date: string) => shortWeekday.format(utcNoon(date));
/** "Thursday" */
export const formatLongWeekday = (date: string) => longWeekday.format(utcNoon(date));
/** "Oct 8" */
export const formatMonthDay = (date: string) => monthDay.format(utcNoon(date));
/** "Thursday, October 8" */
export const formatLongDate = (date: string) => `${longWeekday.format(utcNoon(date))}, ${longMonthDay.format(utcNoon(date))}`;
/** "Thu, Oct 8" */
export const formatShortDate = (date: string) => `${formatWeekday(date)}, ${formatMonthDay(date)}`;
/** "September 2027" */
export const formatMonthYear = (date: string) => monthYear.format(utcNoon(date));

/** "19:00:00" → "7:00 PM" */
export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number) as [number, number];
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** How far the app's clock (possibly pinned by ATHLETICS_NOW) is from the real one, in ms. */
export function clockOffsetMs(now: Date): number {
  return now.getTime() - Date.now();
}
