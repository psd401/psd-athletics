// @vitest-environment node
import { describe, expect, it } from "vitest";

import { calendar, escapeText, foldLine, gameSummary } from "./ics";
import { makeGame } from "./test-games";

const stamp = new Date("2026-10-08T12:00:00Z");
const siteUrl = "https://athletics.psd401.net";

describe("calendar", () => {
  it("writes a timed game in UTC with the venue", () => {
    const game = makeGame({ id: "abc", opponent: "Silas", startDate: "2026-10-16", startTime: "19:00:00" });
    const ics = calendar([game], { name: "Tides Football", siteUrl, stamp });
    expect(ics.split("\r\n")).toEqual([
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Peninsula School District//Athletics//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Tides Football",
      "X-WR-TIMEZONE:America/Los_Angeles",
      "BEGIN:VEVENT",
      "UID:abc@athletics.psd401.net",
      "DTSTAMP:20261008T120000Z",
      "DTSTART:20261017T020000Z",
      "SUMMARY:Gig Harbor Football vs Silas",
      "LOCATION:5101 Rosedale St NW\\, Gig Harbor\\, WA 98335",
      "DESCRIPTION:Latest schedule: https://athletics.psd401.net/ghh",
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ]);
  });

  it("makes a game with no listed time an all-day event and says so", () => {
    const game = makeGame({ startDate: "2026-10-08", startTime: null, homeAway: "away", venueAddress: null, opponent: "Silas" });
    // Unfold continuation lines before matching.
    const ics = calendar([game], { name: "x", siteUrl, stamp }).replace(/\r\n /g, "");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261008\r\n");
    expect(ics).toContain("DESCRIPTION:Start time not listed yet.\\nLatest schedule: https://athletics.psd401.net/ghh\r\n");
    expect(ics).not.toContain("LOCATION:");
  });

  it("marks cancelled games", () => {
    expect(calendar([makeGame({ status: "cancelled" })], { name: "x", siteUrl, stamp })).toContain("STATUS:CANCELLED\r\n");
  });
});

describe("gameSummary", () => {
  it("names the level when it isn't varsity", () => {
    expect(gameSummary(makeGame({ level: "jv", schoolShortName: "Peninsula", opponent: "North Thurston" }))).toBe(
      "Peninsula Football (JV) vs North Thurston",
    );
  });
});

describe("text rules", () => {
  it("escapes commas, semicolons, backslashes and newlines", () => {
    expect(escapeText("a,b;c\\d\ne")).toBe(String.raw`a\,b\;c\\d\ne`);
  });

  it("escapes a semicolon in a summary", () => {
    const ics = calendar([makeGame({ opponent: "Lincoln; Tacoma" })], { name: "x", siteUrl, stamp });
    expect(ics).toContain(String.raw`SUMMARY:Gig Harbor Football vs Lincoln\; Tacoma`);
  });

  it("folds long lines at 75 octets with a leading space", () => {
    const folded = foldLine(`SUMMARY:${"x".repeat(100)}`);
    const [first, second] = folded.split("\r\n");
    expect(first).toHaveLength(75);
    expect(second?.startsWith(" ")).toBe(true);
    expect(folded.replace(/\r\n /g, "")).toBe(`SUMMARY:${"x".repeat(100)}`);
  });

  it("doesn't split a multi-byte character", () => {
    const folded = foldLine(`SUMMARY:${"’".repeat(40)}`);
    expect(folded.replace(/\r\n /g, "")).toBe(`SUMMARY:${"’".repeat(40)}`);
    for (const line of folded.split("\r\n")) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  });
});
