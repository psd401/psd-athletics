// @vitest-environment node
import { describe, expect, it } from "vitest";

import { gameDayStats, startWord, upNext } from "./gameday";
import { final, makeGame } from "./test-games";

const now = new Date("2026-10-08T19:00:00-07:00");

describe("gameDayStats", () => {
  it("shows the record with league and the last-three note", () => {
    expect(gameDayStats({ overall: "5-2", league: "3-0", leagueRank: 1, lastThree: "13-0 goals" }, "Tides")).toEqual([
      { value: "5–2", label: "Tides · 3–0 league, 1st" },
      { value: "13–0", label: "Goals, last three" },
    ]);
  });

  it("shows only what's published", () => {
    expect(gameDayStats({ overall: "6-3" }, "Tides")).toEqual([{ value: "6–3", label: "Tides" }]);
    expect(gameDayStats({}, "Tides")).toEqual([]);
    expect(gameDayStats({ lastThree: "9-1" }, "Tides")).toEqual([{ value: "9–1", label: "Last three" }]);
  });
});

describe("upNext", () => {
  it("lists later games that aren't over, in order", () => {
    const current = makeGame({ id: "now", startDate: "2026-10-08", startTime: "19:30:00" });
    const games = [
      current,
      makeGame({ id: "tue", startDate: "2026-10-13" }),
      makeGame({ id: "fri", startDate: "2026-10-09" }),
      final(3, 0, { id: "old", startDate: "2026-10-07" }),
      makeGame({ id: "earlier-today", startDate: "2026-10-08", startTime: "15:30:00" }),
    ];
    expect(upNext(games, current, now, 4).map((g) => g.id)).toEqual(["fri", "tue"]);
    expect(upNext(games, current, now, 1).map((g) => g.id)).toEqual(["fri"]);
  });
});

describe("startWord", () => {
  it("says kickoff for football", () => {
    expect(startWord("football")).toBe("Kickoff");
    expect(startWord("volleyball")).toBe("Start");
  });
});
