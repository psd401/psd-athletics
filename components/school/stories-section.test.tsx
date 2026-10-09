import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StoriesSection, paragraphs } from "./stories-section";

const story = (n: number) => ({
  id: `s${n}`,
  schoolId: "ghhs",
  teamId: "t",
  slug: `story-${n}`,
  title: `Story ${n}`,
  summary: n === 1 ? "The summary." : null,
  body: "x",
  publishedAt: new Date("2026-10-07T20:00:00Z"),
  sport: "Volleyball",
  sportSlug: "volleyball",
});

describe("StoriesSection", () => {
  it("is hidden with no stories", () => {
    const { container } = render(<StoriesSection slug="ghh" stories={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("features the newest story and lists up to three more", () => {
    render(<StoriesSection slug="ghh" stories={[1, 2, 3, 4, 5].map(story)} />);
    expect(screen.getByRole("link", { name: /Story 1/ })).toHaveAttribute("href", "/ghh/stories/story-1");
    expect(screen.getAllByText("Volleyball · Wed, Oct 7")).toHaveLength(4);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.queryByText("Story 5")).not.toBeInTheDocument();
  });
});

describe("paragraphs", () => {
  it("splits on blank lines and joins wrapped lines", () => {
    expect(paragraphs("One\nline.\n\n  Two.  \n\n\n")).toEqual(["One line.", "Two."]);
    expect(paragraphs("<b>not html</b>")).toEqual(["<b>not html</b>"]);
  });
});
