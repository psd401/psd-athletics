// @vitest-environment node
import { describe, expect, it } from "vitest";

import { subscribeLinks } from "./calendar-links";
import { emptyFilters, filterGames, filterName, filtersToQuery, hasFilters, parseFilters } from "./filters";
import { monthGrid, monthsOf } from "./month";
import { final, makeGame } from "./test-games";

describe("parseFilters", () => {
  it("reads known values from search params", () => {
    expect(parseFilters({ q: " Capital ", sport: "girls-soccer", level: "jv", where: "home" })).toEqual({
      q: "Capital",
      sport: "girls-soccer",
      level: "jv",
      where: "home",
    });
    expect(parseFilters(new URLSearchParams("sport=football&where=away"))).toEqual({ ...emptyFilters, sport: "football", where: "away" });
  });

  it("drops values it doesn't know", () => {
    expect(parseFilters({ sport: "<script>", level: "pro", where: "moon", q: ["a", "b"] })).toEqual({ ...emptyFilters, q: "a" });
    expect(parseFilters({ q: "x".repeat(200) }).q).toHaveLength(60);
  });
});

describe("filtersToQuery and hasFilters", () => {
  it("round-trips and leaves out empty filters", () => {
    const f = { q: "Lakes", sport: "football", level: "varsity" as const, where: "home" as const };
    expect(filtersToQuery(f)).toBe("?q=Lakes&sport=football&level=varsity&where=home");
    expect(parseFilters(new URLSearchParams(filtersToQuery(f)))).toEqual(f);
    expect(filtersToQuery(emptyFilters)).toBe("");
    expect(hasFilters(emptyFilters)).toBe(false);
    expect(hasFilters({ ...emptyFilters, where: "away" })).toBe(true);
  });
});

describe("filterGames", () => {
  const games = [
    makeGame({ id: "fb-home", opponent: "Lakes" }),
    makeGame({ id: "fb-jv-away", level: "jv", homeAway: "away", opponent: "Capital" }),
    final(2, 1, { id: "soc", sport: "Girls Soccer", sportSlug: "girls-soccer", opponent: "Timberline" }),
  ];

  it("combines sport, level, where and search", () => {
    expect(filterGames(games, emptyFilters).map((g) => g.id)).toEqual(["fb-home", "fb-jv-away", "soc"]);
    expect(filterGames(games, { ...emptyFilters, sport: "football" }).map((g) => g.id)).toEqual(["fb-home", "fb-jv-away"]);
    expect(filterGames(games, { ...emptyFilters, sport: "football", where: "away" }).map((g) => g.id)).toEqual(["fb-jv-away"]);
    expect(filterGames(games, { ...emptyFilters, level: "varsity" }).map((g) => g.id)).toEqual(["fb-home", "soc"]);
  });

  it("searches opponents and sports without case", () => {
    expect(filterGames(games, { ...emptyFilters, q: "capital" }).map((g) => g.id)).toEqual(["fb-jv-away"]);
    expect(filterGames(games, { ...emptyFilters, q: "SOCCER" }).map((g) => g.id)).toEqual(["soc"]);
    expect(filterGames(games, { ...emptyFilters, q: "nobody" })).toEqual([]);
  });

  it("names a filtered calendar", () => {
    expect(filterName("Seahawks", { ...emptyFilters, sport: "football", level: "varsity", where: "home" }, "Football")).toBe(
      "Seahawks · Football · Varsity · Home",
    );
    expect(filterName("Tides", emptyFilters, null)).toBe("Tides");
  });
});

describe("subscribeLinks", () => {
  it("builds webcal, Google and Outlook links from the feed", () => {
    const links = subscribeLinks("https://athletics.psd401.net/api/calendar/phs.ics?sport=football", "Seahawks · Football");
    expect(links.webcal).toBe("webcal://athletics.psd401.net/api/calendar/phs.ics?sport=football");
    expect(links.google).toBe(
      "https://calendar.google.com/calendar/r?cid=webcal%3A%2F%2Fathletics.psd401.net%2Fapi%2Fcalendar%2Fphs.ics%3Fsport%3Dfootball",
    );
    expect(links.outlook).toBe(
      "https://outlook.office.com/calendar/0/addfromweb?url=https%3A%2F%2Fathletics.psd401.net%2Fapi%2Fcalendar%2Fphs.ics%3Fsport%3Dfootball&name=Seahawks%20%C2%B7%20Football",
    );
  });
});

describe("monthGrid", () => {
  it("lays out October 2026 in five Sunday-first weeks", () => {
    const weeks = monthGrid("2026-10");
    expect(weeks).toHaveLength(5);
    expect(weeks[0]?.map((c) => c.date.slice(5))).toEqual(["09-27", "09-28", "09-29", "09-30", "10-01", "10-02", "10-03"]);
    expect(weeks[0]?.[4]).toEqual({ date: "2026-10-01", inMonth: true });
    expect(weeks[4]?.[6]).toEqual({ date: "2026-10-31", inMonth: true });
  });

  it("handles a month that needs six weeks", () => {
    // August 2026 starts on a Saturday and has 31 days.
    expect(monthGrid("2026-08")).toHaveLength(6);
  });

  it("lists the months that have games", () => {
    expect(monthsOf(["2026-10-08", "2026-09-04", "2026-10-23"])).toEqual(["2026-09", "2026-10"]);
  });
});
