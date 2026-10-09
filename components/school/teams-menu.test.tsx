import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TeamsMenu } from "./teams-menu";

const seasons = [
  {
    term: "fall",
    label: "Fall",
    sports: [
      { name: "Football", href: "/ghh/teams/football" },
      { name: "Volleyball", href: "/ghh/teams/volleyball" },
    ],
  },
  { term: "winter", label: "Winter", sports: [{ name: "Wrestling", href: "/ghh/teams/wrestling" }] },
];

describe("TeamsMenu", () => {
  it("opens and closes, and Escape returns focus to the button", () => {
    render(<TeamsMenu seasons={seasons} />);
    const button = screen.getByRole("button", { name: "Teams" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /Football/ })).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("heading", { name: "Fall" })).toBeVisible();
    expect(screen.getByRole("link", { name: /Football/ })).toHaveAttribute("href", "/ghh/teams/football");

    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveFocus();
  });

  it("closes on a click outside", () => {
    render(<TeamsMenu seasons={seasons} />);
    fireEvent.click(screen.getByRole("button", { name: "Teams" }));
    fireEvent.mouseDown(document.body);
    expect(screen.getByRole("button", { name: "Teams" })).toHaveAttribute("aria-expanded", "false");
  });
});
