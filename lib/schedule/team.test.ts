// @vitest-environment node
import { describe, expect, it } from "vitest";

import { gameNote, recordStats, teamRows } from "./team";
import { final, makeGame } from "./test-games";

const now = new Date("2026-10-08T19:00:00-07:00");

describe("recordStats", () => {
  it("shows the published record in the comp's order", () => {
    expect(
      recordStats({ overall: "3-2", league: "2-0", leagueRank: 2, pointsFor: 98, pointsAgainst: 93, home: "2-1", away: "1-1", streak: "W2" }),
    ).toEqual([
      { value: "3–2", label: "Overall" },
      { value: "2–0", label: "League · 2nd" },
      { value: "98", label: "Points for" },
      { value: "93", label: "Points against" },
      { value: "2–1", label: "Home" },
      { value: "1–1", label: "Away" },
      { value: "W2", label: "Streak" },
    ]);
  });

  it("leaves out what isn't published but keeps a real zero", () => {
    expect(recordStats({ overall: "6-3" })).toEqual([{ value: "6–3", label: "Overall" }]);
    expect(recordStats({ pointsFor: 0 })).toEqual([{ value: "0", label: "Points for" }]);
    expect(recordStats({})).toEqual([]);
  });
});

describe("teamRows", () => {
  it("marks results, the next game and unreported games", () => {
    const rows = teamRows(
      [
        makeGame({ id: "later", startDate: "2026-10-16" }),
        final(31, 28, { id: "w", startDate: "2026-10-02" }),
        makeGame({ id: "missing", startDate: "2026-09-25" }),
        makeGame({ id: "next", startDate: "2026-10-09", homeAway: "away" }),
      ],
      now,
    );
    expect(rows.map((r) => [r.game.id, r.cell])).toEqual([
      ["missing", { kind: "unreported" }],
      ["w", { kind: "final", outcome: "W", score: "31–28" }],
      ["next", { kind: "next" }],
      ["later", { kind: "upcoming" }],
    ]);
  });

  it("treats a game tonight as next and a live game as live", () => {
    const rows = teamRows(
      [makeGame({ id: "live", startDate: "2026-10-08", status: "live", startTime: null }), makeGame({ id: "fri", startDate: "2026-10-09" })],
      now,
    );
    expect(rows.map((r) => r.cell.kind)).toEqual(["live", "next"]);
  });
});

describe("gameNote", () => {
  it("prefers the label, then league, and says nothing when unknown", () => {
    expect(gameNote(makeGame({ label: "The Fish Bowl", isLeague: false }))).toBe("The Fish Bowl");
    expect(gameNote(makeGame({ isLeague: true }))).toBe("League");
    expect(gameNote(makeGame({ isLeague: false }))).toBe("Non-league");
    expect(gameNote(makeGame({ isLeague: null }))).toBeNull();
  });
});
