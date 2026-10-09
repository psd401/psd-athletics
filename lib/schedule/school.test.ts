// @vitest-environment node
import { describe, expect, it } from "vitest";

import { formatRecord, heroHeadline, heroMeta, numberWord, ordinal, recordLine, seasonFormCards, streakNote, teamMeta } from "./school";
import { final, makeGame } from "./test-games";

const now = new Date("2026-10-08T19:00:00-07:00");

describe("wording", () => {
  it("formats records, ordinals and small numbers", () => {
    expect(formatRecord("3-2")).toBe("3–2");
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th", "11th", "12th", "13th", "21st", "22nd"]);
    expect(numberWord(4)).toBe("four");
    expect(numberWord(12)).toBe("12");
  });

  it("writes the hero headline from the game", () => {
    expect(heroHeadline(makeGame({ opponent: "Central Kitsap", homeAway: "away", startDate: "2026-10-09" }))).toBe(
      "Friday night at Central Kitsap.",
    );
    expect(heroHeadline(makeGame({ homeAway: "home", startDate: "2026-10-09" }))).toBe("Friday night at home.");
    expect(heroHeadline(makeGame({ homeAway: "away", opponent: "Lincoln", startDate: "2026-10-10", startTime: "13:00:00" }))).toBe(
      "Saturday at Lincoln.",
    );
    expect(heroHeadline(makeGame({ homeAway: "home", startDate: "2026-10-10", startTime: null }))).toBe("Saturday at home.");
  });

  it("numbers the game in the team's season and says league only when known", () => {
    const season = [
      final(14, 20, { startDate: "2026-09-04" }),
      final(25, 8, { startDate: "2026-09-11" }),
      makeGame({ id: "cancelled", status: "cancelled", startDate: "2026-09-12" }),
      makeGame({ id: "next", startDate: "2026-10-09", homeAway: "away", isLeague: true }),
    ];
    expect(heroMeta(season[3]!, season)).toBe("Game 3 · League · Away");
    expect(heroMeta({ ...season[3]!, isLeague: null }, season)).toBe("Game 3 · Away");
    expect(heroMeta({ ...season[3]!, isLeague: false, homeAway: "home" }, season)).toBe("Game 3 · Non-league · Home");
  });

  it("joins what's known of a record", () => {
    expect(recordLine({ overall: "3-2", league: "2-0" })).toBe("3–2 · League 2–0");
    expect(recordLine({ overall: "6-3" })).toBe("6–3");
    expect(recordLine({})).toBe("");
  });
});

describe("seasonFormCards", () => {
  const football = [
    final(14, 20, { teamId: "fb", startDate: "2026-09-04" }),
    final(25, 8, { teamId: "fb", startDate: "2026-09-11" }),
    final(8, 37, { teamId: "fb", startDate: "2026-09-19" }),
    final(20, 0, { teamId: "fb", startDate: "2026-09-25" }),
    final(31, 28, { teamId: "fb", startDate: "2026-10-02" }),
    makeGame({ teamId: "fb", startDate: "2026-10-09", homeAway: "away", opponent: "Central Kitsap" }),
  ].map((g) => ({ ...g, record: { overall: "3-2", league: "2-0", leagueRank: 2 } }));
  const vb = (o: Parameters<typeof final>[2]) => ({ teamId: "vb", sport: "Volleyball", sportSlug: "volleyball", record: { overall: "6-3" }, ...o });
  const volleyball = [
    final(3, 0, vb({ startDate: "2026-09-29" })),
    final(3, 1, vb({ startDate: "2026-10-01" })),
    final(3, 0, vb({ startDate: "2026-10-05" })),
    final(3, 0, vb({ startDate: "2026-10-07" })),
    makeGame(vb({ startDate: "2026-10-13", homeAway: "away", opponent: "Central Kitsap" })),
  ];
  const jv = [final(1, 0, { teamId: "jv", level: "jv", startDate: "2026-10-07" })];

  it("puts the marquee sport first, then the most recently played", () => {
    const cards = seasonFormCards([...volleyball, ...football, ...jv], now, { marqueeSport: "football", limit: 3 });
    expect(cards.map((c) => c.teamId)).toEqual(["fb", "vb"]);
    expect(cards[0]).toEqual({
      teamId: "fb",
      sport: "Football",
      sportSlug: "football",
      level: "varsity",
      record: "3–2",
      aside: ["League 2–0", "2nd"],
      form: ["L", "W", "L", "W", "W"],
      formLabel: "Last five: loss, win, loss, win, win",
      next: "Next: Fri @ Central Kitsap",
    });
    expect(cards[1]).toMatchObject({ record: "6–3", aside: ["Four", "straight"], formLabel: "Last four: all wins", next: "Next: Tue @ Central Kitsap" });
  });

  it("counts a record from the finals when none is published, and says tonight", () => {
    const soccer = [
      final(8, 0, { teamId: "soc", sport: "Girls Soccer", sportSlug: "girls-soccer", startDate: "2026-09-29" }),
      final(0, 2, { teamId: "soc", sport: "Girls Soccer", sportSlug: "girls-soccer", startDate: "2026-10-01" }),
      makeGame({ teamId: "soc", sport: "Girls Soccer", sportSlug: "girls-soccer", startDate: "2026-10-08", startTime: "19:30:00", opponent: "Mount Tahoma" }),
    ];
    expect(seasonFormCards(soccer, now, { marqueeSport: null, limit: 3 })[0]).toMatchObject({
      record: "1–1",
      aside: [],
      formLabel: "Last two: win, loss",
      next: "Next: tonight vs Mount Tahoma",
    });
  });

  it("is empty before anyone has played", () => {
    expect(seasonFormCards([makeGame()], now, { marqueeSport: "football", limit: 3 })).toEqual([]);
  });
});

describe("teamMeta and streakNote", () => {
  it("prefers the league record, then a streak, then levels", () => {
    expect(teamMeta({ overall: "3-2", league: "2-0" }, ["varsity"], 2)).toBe("3–2 · League 2–0");
    expect(teamMeta({ overall: "6-3" }, ["varsity"], 4)).toBe("6–3 · Won 4 straight");
    expect(teamMeta({ overall: "6-3" }, ["varsity"], 1)).toBe("6–3");
    expect(teamMeta({}, ["varsity", "jv"], 0)).toBe("Varsity · JV");
  });

  it("calls out the longest current streak of three or more", () => {
    const vb = { teamId: "vb", sport: "Volleyball", sportSlug: "volleyball" };
    const games = [
      final(3, 0, { ...vb, startDate: "2026-09-29" }),
      final(3, 1, { ...vb, startDate: "2026-10-01" }),
      final(3, 0, { ...vb, startDate: "2026-10-05" }),
      final(3, 0, { ...vb, startDate: "2026-10-07", opponent: "Mount Tahoma" }),
      final(31, 28, { teamId: "fb", startDate: "2026-10-02" }),
    ];
    expect(streakNote(games)).toEqual({
      headline: "Volleyball has won four straight.",
      detail: "Beat Mount Tahoma 3–0 on Wednesday.",
    });
    expect(streakNote(games.slice(4))).toBeNull();
  });
});
