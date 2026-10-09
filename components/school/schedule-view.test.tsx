import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { emptyFilters } from "../../lib/schedule/filters";
import { final, makeGame } from "../../lib/schedule/test-games";
import { ScheduleView } from "./schedule-view";

const games = [
  { game: final(31, 28, { id: "a", opponent: "Lincoln", homeAway: "away", startDate: "2026-10-02" }), state: "final" as const },
  { game: makeGame({ id: "b", opponent: "Silas", startDate: "2026-10-16" }), state: "upcoming" as const },
  {
    game: makeGame({ id: "c", sport: "Volleyball", sportSlug: "volleyball", level: "jv", opponent: "Capital", startDate: "2026-10-13", updatedFields: ["start_time"] }),
    state: "upcoming" as const,
  },
];

const renderView = (initialView: "list" | "month" = "list") =>
  render(
    <ScheduleView
      schoolSlug="ghh"
      mascot="Tides"
      games={games}
      today="2026-10-08"
      months={["2026-10"]}
      sports={[
        { slug: "football", name: "Football" },
        { slug: "volleyball", name: "Volleyball" },
      ]}
      levels={["varsity", "jv"]}
      initialFilters={emptyFilters}
      initialView={initialView}
      siteUrl="https://athletics.psd401.net"
      kicker="k"
      sourceLine="s"
      motif={null}
    />,
  );

describe("ScheduleView", () => {
  it("states results and changes in words", () => {
    renderView();
    expect(screen.getByText("Final · Win 31–28")).toBeInTheDocument();
    expect(screen.getAllByText("Updated")).toHaveLength(2); // legend + the changed game
    expect(screen.getByText("3 of 3 games")).toBeInTheDocument();
  });

  it("filters by level and updates the subscribe links", () => {
    renderView();
    fireEvent.click(screen.getByRole("group", { name: "Level" }).querySelector("button:nth-child(3)")!);
    expect(screen.getByText("1 of 3 games")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Apple" })).toHaveAttribute("href", "webcal://athletics.psd401.net/api/calendar/ghh.ics?level=jv");
    expect(window.location.search).toBe("?level=jv");
  });

  it("puts games in the month table on their dates", () => {
    renderView("month");
    expect(screen.getByRole("table", { name: "October 2026 games" })).toBeInTheDocument();
    expect(screen.getByTitle("7:00 PM Football Varsity vs Silas")).toBeInTheDocument();
  });
});
