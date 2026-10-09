// @vitest-environment node
import { describe, expect, it } from "vitest";

import { boardDays, filterBoard, initials } from "./board";
import { makeGame } from "./test-games";

const g = (o: Parameters<typeof makeGame>[0], state: "live" | "upcoming" | "tonight" = "upcoming") => ({ game: makeGame(o), state });

// Thu Oct 8 2026 → Thu Oct 15.
const games = [
  g({ id: "live", sport: "Girls Soccer", sportSlug: "girls-soccer", opponent: "Silas", startDate: "2026-10-08", startTime: null, status: "live" }, "live"),
  g({ id: "fb", opponent: "North Thurston", startDate: "2026-10-09" }),
  // Freshman listed first on purpose: the card still reads "JV · Freshman".
  g({ id: "fr-vb0", sport: "Volleyball", sportSlug: "volleyball", level: "freshman", opponent: "Timberline", startDate: "2026-10-13", startTime: "17:45:00" }),
  g({ id: "jv-vb", sport: "Volleyball", sportSlug: "volleyball", level: "jv", opponent: "Timberline", startDate: "2026-10-13", startTime: "17:45:00" }),
  g({ id: "v-vb", sport: "Volleyball", sportSlug: "volleyball", opponent: "Timberline", startDate: "2026-10-13", startTime: "19:15:00" }),
];

describe("boardDays", () => {
  const days = boardDays(games, "2026-10-08", 7);

  it("shows weekdays, and weekend days only with games", () => {
    expect(days.map((d) => `${d.dow} ${d.label}`)).toEqual(["Thu Oct 8", "Fri Oct 9", "Mon Oct 12", "Tue Oct 13", "Wed Oct 14", "Thu Oct 15"]);
    expect(days[0]?.isToday).toBe(true);
    expect(days[2]?.cards).toEqual([]);
  });

  it("shares a card between levels playing the same game slot", () => {
    const tue = days.find((d) => d.date === "2026-10-13")!;
    expect(tue.cards.map((c) => [c.levelText, c.sport, c.opponent, c.time])).toEqual([
      ["JV · Freshman", "Volleyball", "vs Timberline", "5:45 PM"],
      ["Varsity", "Volleyball", "vs Timberline", "7:15 PM"],
    ]);
  });

  it("says Live now for a game in progress", () => {
    expect(days[0]?.cards[0]?.time).toBe("Live now");
  });

  it("filters to varsity or to the other levels", () => {
    const tue = (f: "varsity" | "sub") => filterBoard(days, f).find((d) => d.date === "2026-10-13")!.cards.map((c) => c.levelText);
    expect(tue("varsity")).toEqual(["Varsity"]);
    expect(tue("sub")).toEqual(["JV · Freshman"]);
    expect(filterBoard(days, "all")).toBe(days);
  });
});

describe("initials", () => {
  it("takes the first letters of up to two names", () => {
    expect(initials("Ross Filkins")).toBe("RF");
    expect(initials("Carly Fries-Geldermann")).toBe("CF");
    expect(initials("Cher")).toBe("C");
  });
});
