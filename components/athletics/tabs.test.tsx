import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs } from "./tabs";

const items = [
  { id: "schedule", label: "Schedule", panel: <p>Games</p> },
  { id: "roster", label: "Roster", panel: <p>Players</p> },
  { id: "docs", label: "Documents", panel: <p>Forms</p> },
];
const classNames = { list: "l", tab: "t", panel: "p" };

describe("Tabs", () => {
  it("shows the first panel and hides the rest", () => {
    render(<Tabs items={items} label="Team page sections" classNames={classNames} />);
    expect(screen.getByRole("tablist", { name: "Team page sections" })).toBeInTheDocument();
    expect(screen.getByRole("tabpanel", { name: "Schedule" })).toHaveTextContent("Games");
    expect(screen.queryByText("Players")).not.toBeVisible();
  });

  it("switches on click and with the keyboard", () => {
    render(<Tabs items={items} label="x" classNames={classNames} />);
    fireEvent.click(screen.getByRole("tab", { name: "Roster" }));
    expect(screen.getByRole("tabpanel", { name: "Roster" })).toHaveTextContent("Players");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Roster" }), { key: "End" });
    expect(screen.getByRole("tab", { name: "Documents" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Documents" })).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(screen.getByRole("tab", { name: "Documents" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Schedule" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByRole("tab").map((t) => t.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
  });
});
