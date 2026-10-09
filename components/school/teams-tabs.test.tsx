import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamsTabs, type SeasonTeams } from "./teams-tabs";

const seasons: SeasonTeams[] = [
  { term: "fall", label: "Fall", teams: [{ name: "Football", meta: "3–2 · League 2–0" }] },
  { term: "winter", label: "Winter", teams: [{ name: "Wrestling", meta: "Varsity" }] },
  { term: "spring", label: "Spring", teams: [{ name: "Baseball", meta: "Varsity" }] },
];

describe("TeamsTabs", () => {
  it("shows the current season's teams", () => {
    render(<TeamsTabs seasons={seasons} initial="fall" />);
    expect(screen.getByRole("tab", { name: "Fall" })).toHaveAttribute("aria-selected", "true");
    const panel = screen.getByRole("tabpanel", { name: "Fall" });
    expect(within(panel).getByRole("heading", { name: "Football" })).toBeInTheDocument();
    expect(within(panel).getByText("3–2 · League 2–0")).toBeInTheDocument();
  });

  it("switches seasons on click", () => {
    render(<TeamsTabs seasons={seasons} initial="fall" />);
    fireEvent.click(screen.getByRole("tab", { name: "Winter" }));
    expect(screen.getByRole("tabpanel", { name: "Winter" })).toHaveTextContent("Wrestling");
  });

  it("moves with arrow keys, wrapping at the ends, and keeps one tab in the tab order", () => {
    render(<TeamsTabs seasons={seasons} initial="fall" />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "Fall" }), { key: "ArrowLeft" });
    expect(screen.getByRole("tab", { name: "Spring" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Spring" })).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("tab", { name: "Spring" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Fall" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tab").map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });
});

describe("TeamsTabs and the Teams menu", () => {
  it("opens the season named in the URL hash", () => {
    window.location.hash = "#teams-spring";
    render(<TeamsTabs seasons={seasons} initial="fall" />);
    expect(screen.getByRole("tab", { name: "Spring" })).toHaveAttribute("aria-selected", "true");
    window.location.hash = "";
  });
});
