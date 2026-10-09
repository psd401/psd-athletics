import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Decision } from "./ui";

describe("Decision", () => {
  it("is a region named by its title, so each decision can be found on its own", () => {
    render(
      <>
        <Decision eyebrow="Family report" title="Take down a photo?" why="Hidden now." label="Your decision" reaches="Public: no" actions={<button type="button">Keep it down</button>} undo="Logged" />
        <Decision eyebrow="Stories" title="Publish the recap?" why="Ready." label="Your decision" reaches="Team page" actions={null} undo="Logged" />
      </>,
    );
    const region = screen.getByRole("region", { name: "Take down a photo?" });
    expect(region).toHaveTextContent("Hidden now.");
    expect(screen.getAllByRole("region")).toHaveLength(2);
  });
});
