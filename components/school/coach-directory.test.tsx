import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CoachDirectory, type CoachCard } from "./coach-directory";

const cards: CoachCard[] = [
  { teamId: "1", term: "fall", sport: "Football", href: "/phs/teams/football", coach: "Pat Example" },
  { teamId: "2", term: "fall", sport: "Volleyball", href: "/phs/teams/volleyball", coach: null },
  { teamId: "3", term: "winter", sport: "Wrestling", href: "/phs/teams/wrestling", coach: null },
];

describe("CoachDirectory", () => {
  it("lists coaches and says when one isn't listed, with no contact details", () => {
    const { container } = render(<CoachDirectory cards={cards} />);
    expect(screen.getByRole("heading", { name: "Pat Example" })).toBeInTheDocument();
    expect(screen.getAllByText("Head coach not listed yet")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Football team page" })).toHaveAttribute("href", "/phs/teams/football");
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("filters by season and searches sports and names", () => {
    render(<CoachDirectory cards={cards} />);
    fireEvent.click(screen.getByRole("button", { name: "Winter" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "All seasons" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Search coaches and sports" }), { target: { value: "pat" } });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search coaches and sports" }), { target: { value: "curling" } });
    expect(screen.getByText("No sport or coach matches that search.")).toBeInTheDocument();
  });
});
