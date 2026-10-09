import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FeedList } from "./feed-list";

const base = { teamId: "t", gameId: null, sport: "Girls Soccer", sportSlug: "girls-soccer", level: "varsity" as const, publishedAt: new Date("2026-10-09T02:10:00Z") };

describe("FeedList", () => {
  it("shows each post with its team, kind, time, game and words, with no likes or comments", () => {
    render(
      <FeedList
        slug="ghh"
        games={{ g1: "vs Capital, Tue, Oct 6" }}
        posts={[
          { ...base, id: "a", kind: "score", body: "Halftime: Tides 1, Capital 0.", gameId: "g1", photos: [] },
          { ...base, id: "b", kind: "photo", body: null, photos: [{ id: "p1", altText: "Players celebrate.", width: 900, height: 600 }] },
        ]}
        empty="Nothing yet."
      />,
    );
    const [score, photo] = screen.getAllByRole("article");
    expect(within(score!).getByRole("link", { name: "Girls Soccer · Varsity" })).toHaveAttribute("href", "/ghh/teams/girls-soccer");
    expect(score).toHaveTextContent("Score update");
    expect(score).toHaveTextContent("Thu, Oct 8 · 7:10 PM");
    expect(score).toHaveTextContent("vs Capital, Tue, Oct 6");
    expect(score).toHaveTextContent("Halftime: Tides 1, Capital 0.");
    expect(within(photo!).getByRole("img", { name: "Players celebrate." })).toHaveAttribute("src", "/media/p1/card");
    expect(screen.queryByRole("button", { name: /like|comment/i })).not.toBeInTheDocument();
  });

  it("says so when there's nothing", () => {
    render(<FeedList slug="ghh" games={{}} posts={[]} empty="Nothing yet." />);
    expect(screen.getByText("Nothing yet.")).toBeInTheDocument();
  });
});
