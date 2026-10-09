import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeGame } from "../../lib/schedule/test-games";
import { HubWeek, type WeekDay } from "./hub-week";

const days: WeekDay[] = [
  {
    date: "2026-10-08",
    dow: "Thu",
    label: "Oct 8 · Today",
    games: [
      { game: makeGame({ schoolId: "phs", mascot: "Seahawks", sport: "Girls Soccer", startTime: null, status: "live", startDate: "2026-10-08" }), state: "live" },
      { game: makeGame({ sport: "Girls Soccer", opponent: "Mount Tahoma", startTime: "19:30:00", startDate: "2026-10-08" }), state: "tonight" },
    ],
  },
  {
    date: "2026-10-09",
    dow: "Fri",
    label: "Oct 9",
    games: [{ game: makeGame({ opponent: "Central Kitsap", homeAway: "away", startDate: "2026-10-09", venueAddress: null }), state: "upcoming" }],
  },
];

const renderWeek = () => render(<HubWeek days={days} rangeLabel="Thursday, October 8 – Thursday, October 15" sourceLine="From the fall schedule snapshot" />);

describe("HubWeek", () => {
  it("lists every game with its status as words", () => {
    renderWeek();
    expect(screen.getByText("3 games · From the fall schedule snapshot · Times Pacific")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("Tonight")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Fri Oct 9" })).toBeInTheDocument();
  });

  it("filters by school", () => {
    renderWeek();
    fireEvent.click(screen.getByRole("button", { name: "Seahawks" }));
    expect(screen.getByRole("button", { name: "Seahawks" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "Fri Oct 9" })).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    render(<HubWeek days={[days[1]!]} rangeLabel="x" sourceLine="y" />);
    fireEvent.click(screen.getByRole("button", { name: "Home games only" }));
    expect(screen.getByRole("button", { name: "Home games only" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByText("No games match these filters this week. Try showing both schools.")).toBeInTheDocument();
    expect(screen.getByText(/^0 games ·/)).toBeInTheDocument();
  });
});
