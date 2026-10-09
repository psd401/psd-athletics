import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { TickerItem } from "../../lib/schedule/games";
import { ScoreTicker } from "./score-ticker";

const items: TickerItem[] = [
  { key: "a", kind: "live", tag: "Live", lead: "Peninsula", text: "Girls Soccer vs Silas" },
  { key: "b", kind: "final", tag: "Final", lead: "Gig Harbor", text: "Volleyball 3, Mount Tahoma 0" },
];

describe("ScoreTicker", () => {
  it("reads each score once to assistive technology", () => {
    render(<ScoreTicker items={items} label="Scores" variant="hub" regionLabel="Live scores and tonight's games" />);
    const region = screen.getByRole("region", { name: "Live scores and tonight's games" });
    const list = within(region).getByRole("list");
    expect(within(list).getAllByRole("listitem").map((li) => li.textContent)).toEqual([
      "LivePeninsulaGirls Soccer vs Silas",
      "FinalGig HarborVolleyball 3, Mount Tahoma 0",
    ]);
  });

  it("can be paused and played again", () => {
    render(<ScoreTicker items={items} label="Scores" variant="hub" regionLabel="Scores" />);
    const pause = screen.getByRole("button", { name: "Pause scores" });
    expect(pause).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(pause);
    const play = screen.getByRole("button", { name: "Play scores" });
    expect(play).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("list")).toHaveAttribute("data-paused", "true");
  });

  it("renders nothing with no scores", () => {
    const { container } = render(<ScoreTicker items={[]} label="Scores" variant="hub" regionLabel="Scores" />);
    expect(container).toBeEmptyDOMElement();
  });
});
