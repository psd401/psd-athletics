import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusTag, type StatusKind } from "./status-tag";

describe("StatusTag", () => {
  it.each<[StatusKind, string]>([
    ["live", "Live"],
    ["tonight", "Tonight"],
    ["final", "Final"],
    ["updated", "Updated"],
    ["home", "Home"],
    ["away", "Away"],
    ["next", "Next"],
  ])("shows the word for %s, not just a color", (kind, word) => {
    const { container } = render(<StatusTag kind={kind} />);
    expect(container).toHaveTextContent(new RegExp(`^${word}$`));
  });

  it("shows a custom label in place of the word", () => {
    render(<StatusTag kind="tonight">7:30 PM</StatusTag>);
    expect(screen.getByText("7:30 PM")).toBeInTheDocument();
    expect(screen.queryByText("Tonight")).not.toBeInTheDocument();
  });

  it("hides the pulsing dot from assistive technology", () => {
    const { container } = render(<StatusTag kind="live" />);
    const hidden = container.querySelectorAll('[aria-hidden="true"]');
    expect(hidden).toHaveLength(1);
    expect(hidden[0]).toHaveTextContent("");
  });

  it("has no dot on final scores", () => {
    const { container } = render(<StatusTag kind="final" />);
    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0);
  });
});
