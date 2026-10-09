// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  gameState,
  groupByDay,
  latestFinals,
  latestFishBowl,
  marqueeGame,
  opponentLine,
  recentForm,
  result,
  tickerItems,
  timeLabel,
  winStreak,
} from "./games";
import { final, makeGame } from "./test-games";

// Thursday, Oct 8 2026, 7:00 PM Pacific: the fixture snapshot time.
const now = new Date("2026-10-08T19:00:00-07:00");

describe("gameState", () => {
  it("takes Live, Final, Postponed and Cancelled from the source", () => {
    expect(gameState(makeGame({ status: "live", startDate: "2026-10-08", startTime: null }), now)).toBe("live");
    expect(gameState(final(3, 0, { startDate: "2026-10-07" }), now)).toBe("final");
    expect(gameState(makeGame({ status: "postponed" }), now)).toBe("postponed");
    expect(gameState(makeGame({ status: "cancelled" }), now)).toBe("cancelled");
  });

  it("calls today's evening games Tonight and earlier ones Today", () => {
    expect(gameState(makeGame({ startDate: "2026-10-08", startTime: "19:30:00" }), now)).toBe("tonight");
    expect(gameState(makeGame({ startDate: "2026-10-08", startTime: "17:00:00" }), now)).toBe("tonight");
    expect(gameState(makeGame({ startDate: "2026-10-08", startTime: null }), now)).toBe("tonight");
    expect(gameState(makeGame({ startDate: "2026-10-08", startTime: "15:30:00" }), now)).toBe("today");
  });

  it("never marks a past game final without a score", () => {
    expect(gameState(makeGame({ startDate: "2026-09-25" }), now)).toBe("unreported");
  });

  it("uses the Pacific date: 11 PM Thursday is still Thursday", () => {
    const late = new Date("2026-10-08T23:30:00-07:00");
    expect(gameState(makeGame({ startDate: "2026-10-08", startTime: "19:30:00" }), late)).toBe("tonight");
    expect(gameState(makeGame({ startDate: "2026-10-09" }), late)).toBe("upcoming");
  });
});

describe("result and labels", () => {
  it("reads wins, losses and ties from our score first", () => {
    expect(result(final(31, 28))).toBe("W");
    expect(result(final(8, 37))).toBe("L");
    expect(result(final(1, 1))).toBe("T");
    expect(result(makeGame())).toBeNull();
  });

  it("writes vs at home and @ away", () => {
    expect(opponentLine(makeGame({ opponent: "Silas" }))).toBe("vs Silas");
    expect(opponentLine(makeGame({ opponent: "Central Kitsap", homeAway: "away" }))).toBe("@ Central Kitsap");
  });

  it("shows unknown times as unknown", () => {
    expect(timeLabel(makeGame({ startTime: "19:15:00" }))).toBe("7:15 PM");
    expect(timeLabel(makeGame({ startTime: null }))).toBe("Time TBA");
    expect(timeLabel(makeGame({ startTime: null, status: "live" }))).toBe("Now");
  });
});

describe("groupByDay", () => {
  it("groups the window by day, live first, unknown times last", () => {
    const games = [
      makeGame({ id: "fri", startDate: "2026-10-09" }),
      makeGame({ id: "late", startDate: "2026-10-08", startTime: "19:30:00" }),
      makeGame({ id: "live", startDate: "2026-10-08", startTime: null, status: "live" }),
      makeGame({ id: "tba", startDate: "2026-10-08", startTime: null }),
      makeGame({ id: "early", startDate: "2026-10-08", startTime: "15:30:00" }),
      makeGame({ id: "past", startDate: "2026-10-07" }),
      makeGame({ id: "edge", startDate: "2026-10-15" }),
      makeGame({ id: "beyond", startDate: "2026-10-16" }),
    ];
    const groups = groupByDay(games, "2026-10-08", 7);
    expect(groups.map((g) => [g.date, g.games.map((x) => x.id)])).toEqual([
      ["2026-10-08", ["live", "early", "late", "tba"]],
      ["2026-10-09", ["fri"]],
      ["2026-10-15", ["edge"]],
    ]);
  });

  it("returns nothing for an empty week", () => {
    expect(groupByDay([], "2026-10-08", 7)).toEqual([]);
  });
});

describe("marqueeGame", () => {
  it("picks the next varsity football game over an earlier game in another sport", () => {
    const games = [
      makeGame({ id: "soccer", sport: "Girls Soccer", sportSlug: "girls-soccer", startDate: "2026-10-08", startTime: "19:30:00" }),
      makeGame({ id: "jv-football", level: "jv", startDate: "2026-10-08" }),
      makeGame({ id: "fb", startDate: "2026-10-09" }),
      makeGame({ id: "fb-later", startDate: "2026-10-16" }),
    ];
    expect(marqueeGame(games, now)?.id).toBe("fb");
  });

  it("falls back to the next varsity game, and to nothing", () => {
    const soccer = makeGame({ id: "soccer", sport: "Girls Soccer", sportSlug: "girls-soccer", startDate: "2026-10-13" });
    expect(marqueeGame([final(3, 0, { startDate: "2026-10-02" }), soccer], now)?.id).toBe("soccer");
    expect(marqueeGame([final(3, 0, { startDate: "2026-10-02" })], now)).toBeNull();
  });
});

describe("form and streaks", () => {
  // Gig Harbor football, fall 2026: L W L W W, then upcoming games.
  const football = [
    final(14, 20, { startDate: "2026-09-04" }),
    final(25, 8, { startDate: "2026-09-11" }),
    final(8, 37, { startDate: "2026-09-19" }),
    final(20, 0, { startDate: "2026-09-25" }),
    final(31, 28, { startDate: "2026-10-02" }),
    makeGame({ startDate: "2026-10-09" }),
  ];

  it("lists the last results oldest first", () => {
    expect(recentForm(football, 5)).toEqual(["L", "W", "L", "W", "W"]);
    expect(recentForm(football, 3)).toEqual(["L", "W", "W"]);
  });

  it("counts the current win streak", () => {
    expect(winStreak(football)).toBe(2);
    expect(winStreak([final(0, 3)])).toBe(0);
    expect(winStreak([])).toBe(0);
  });

  it("orders latest finals newest first", () => {
    expect(latestFinals(football, 2).map((g) => g.startDate)).toEqual(["2026-10-02", "2026-09-25"]);
  });
});

describe("tickerItems", () => {
  const games = [
    makeGame({ id: "phs-live", schoolId: "phs", schoolShortName: "Peninsula", sport: "Girls Soccer", sportSlug: "girls-soccer", opponent: "Silas", startDate: "2026-10-08", startTime: null, status: "live" }),
    makeGame({ id: "gh-tonight", sport: "Girls Soccer", sportSlug: "girls-soccer", opponent: "Mount Tahoma", startDate: "2026-10-08", startTime: "19:30:00" }),
    final(3, 0, { id: "gh-vb", sport: "Volleyball", sportSlug: "volleyball", opponent: "Mount Tahoma", startDate: "2026-10-07" }),
    final(2, 0, { id: "gh-soc", sport: "Girls Soccer", sportSlug: "girls-soccer", opponent: "Capital", homeAway: "away", startDate: "2026-10-06" }),
    makeGame({ id: "gh-fb", opponent: "Central Kitsap", homeAway: "away", startDate: "2026-10-09" }),
    makeGame({ id: "phs-fb", schoolId: "phs", schoolShortName: "Peninsula", opponent: "North Thurston", startDate: "2026-10-09" }),
  ];

  it("leads with the school on the hub", () => {
    expect(tickerItems(games, now, { mode: "hub", finals: 5 })).toEqual([
      { key: "phs-live", kind: "live", tag: "Live", lead: "Peninsula", text: "Girls Soccer vs Silas" },
      { key: "gh-tonight", kind: "tonight", tag: "7:30 PM", lead: "Gig Harbor", text: "Girls Soccer vs Mount Tahoma" },
      { key: "gh-vb", kind: "final", tag: "Final", lead: "Gig Harbor", text: "Volleyball 3, Mount Tahoma 0" },
      { key: "gh-soc", kind: "final", tag: "Final", lead: "Gig Harbor", text: "Girls Soccer 2, Capital 0" },
      { key: "gh-fb", kind: "next", tag: "Fri", lead: "Gig Harbor", text: "Football @ Central Kitsap 7:00 PM" },
      { key: "phs-fb", kind: "next", tag: "Fri", lead: "Peninsula", text: "Football vs North Thurston 7:00 PM" },
    ]);
  });

  it("leads with the sport on a school page", () => {
    const gh = games.filter((g) => g.schoolId === "ghhs");
    expect(tickerItems(gh, now, { mode: "school", finals: 4 })).toEqual([
      { key: "gh-tonight", kind: "tonight", tag: "7:30 PM", lead: "Girls Soccer", text: "vs Mount Tahoma, tonight" },
      { key: "gh-vb", kind: "final", tag: "Final", lead: "Volleyball 3", text: "Mount Tahoma 0" },
      { key: "gh-soc", kind: "final", tag: "Final", lead: "Girls Soccer 2", text: "@ Capital 0" },
      { key: "gh-fb", kind: "next", tag: "Fri", lead: "Football", text: "@ Central Kitsap, 7:00 PM" },
    ]);
  });

  it("is empty with no games", () => {
    expect(tickerItems([], now, { mode: "hub", finals: 5 })).toEqual([]);
  });
});

describe("latestFishBowl", () => {
  it("pairs both schools' rows and puts the winner first", () => {
    const games = [
      final(8, 37, { schoolId: "ghhs", schoolShortName: "Gig Harbor", mascot: "Tides", opponent: "Peninsula", homeAway: "home", startDate: "2026-09-19", label: "The Fish Bowl" }),
      final(37, 8, { schoolId: "phs", schoolShortName: "Peninsula", mascot: "Seahawks", opponent: "Gig Harbor", homeAway: "away", startDate: "2026-09-19", label: "The Fish Bowl" }),
      final(10, 7, { startDate: "2026-09-11" }),
    ];
    expect(latestFishBowl(games)).toEqual({
      date: "2026-09-19",
      hostShortName: "Gig Harbor",
      sides: [
        { schoolId: "phs", schoolShortName: "Peninsula", mascot: "Seahawks", score: 37, winner: true },
        { schoolId: "ghhs", schoolShortName: "Gig Harbor", mascot: "Tides", score: 8, winner: false },
      ],
    });
  });

  it("is null before the game is played", () => {
    expect(latestFishBowl([makeGame({ label: "The Fish Bowl" })])).toBeNull();
  });
});
