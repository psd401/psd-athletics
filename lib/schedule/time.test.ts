// @vitest-environment node
import { afterEach, describe, expect, it } from "vitest";

import {
  addDays,
  currentTime,
  formatLongDate,
  formatMonthDay,
  formatShortDate,
  formatTime,
  formatWeekday,
  pacificDate,
  pacificInstant,
} from "./time";

describe("pacificInstant", () => {
  it("reads daylight time as UTC-7", () => {
    expect(pacificInstant("2026-10-09", "19:00:00").toISOString()).toBe("2026-10-10T02:00:00.000Z");
  });

  it("reads standard time as UTC-8", () => {
    expect(pacificInstant("2026-12-04", "19:00").toISOString()).toBe("2026-12-05T03:00:00.000Z");
  });

  it("handles the day the clocks change", () => {
    // Nov 1, 2026: 1:59 AM PDT, then 1:00 AM PST. Noon is PST.
    expect(pacificInstant("2026-11-01", "12:00").toISOString()).toBe("2026-11-01T20:00:00.000Z");
    // Mar 8, 2026: 2 AM PST jumps to 3 AM PDT. Noon is PDT.
    expect(pacificInstant("2026-03-08", "12:00").toISOString()).toBe("2026-03-08T19:00:00.000Z");
  });
});

describe("pacificDate", () => {
  it("uses the Pacific calendar day, not UTC's", () => {
    // 2026-10-09 02:00 UTC is still Oct 8 in Gig Harbor.
    expect(pacificDate(new Date("2026-10-09T02:00:00Z"))).toBe("2026-10-08");
    expect(pacificDate(new Date("2026-10-09T07:00:00Z"))).toBe("2026-10-09");
  });
});

describe("formatting", () => {
  it("formats times like the comps", () => {
    expect(formatTime("19:00:00")).toBe("7:00 PM");
    expect(formatTime("15:30:00")).toBe("3:30 PM");
    expect(formatTime("12:05")).toBe("12:05 PM");
    expect(formatTime("00:15")).toBe("12:15 AM");
  });

  it("formats dates without shifting the day", () => {
    expect(formatWeekday("2026-10-08")).toBe("Thu");
    expect(formatMonthDay("2026-10-08")).toBe("Oct 8");
    expect(formatShortDate("2026-09-19")).toBe("Sat, Sep 19");
    expect(formatLongDate("2026-10-15")).toBe("Thursday, October 15");
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-10-08", 7)).toBe("2026-10-15");
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
  });
});

describe("currentTime", () => {
  afterEach(() => {
    delete process.env.ATHLETICS_NOW;
  });

  it("uses ATHLETICS_NOW when it's set", () => {
    process.env.ATHLETICS_NOW = "2026-10-08T19:00:00-07:00";
    expect(currentTime().toISOString()).toBe("2026-10-09T02:00:00.000Z");
  });

  it("ignores an unreadable ATHLETICS_NOW", () => {
    process.env.ATHLETICS_NOW = "not a date";
    expect(Math.abs(currentTime().getTime() - Date.now())).toBeLessThan(1000);
  });
});
