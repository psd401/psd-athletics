import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlbumGrid, type AlbumCard } from "./album-grid";

const album = (n: number, extra: Partial<AlbumCard> = {}): AlbumCard => ({
  id: `a${n}`,
  title: `Album ${n}`,
  teamId: "t",
  gameId: null,
  sport: "Football",
  sportSlug: "football",
  publishedAt: new Date("2026-10-03T05:00:00Z"),
  photoCount: n,
  cover: { id: `p${n}`, altText: `Cover ${n}`, width: 480, height: 320, takenAt: null, credit: null },
  result: null,
  ...extra,
});

describe("AlbumGrid", () => {
  it("links each album, shows its cover with its description, team, date and count", () => {
    render(<AlbumGrid slug="ghh" albums={[album(1), album(12, { result: "W 31–28" })]} empty="None yet." />);
    const cards = screen.getAllByRole("listitem");
    expect(cards).toHaveLength(2);
    const second = within(cards[1]!);
    expect(second.getByRole("link", { name: /Album 12/ })).toHaveAttribute("href", "/ghh/photos/a12");
    expect(second.getByRole("img", { name: "Cover 12" })).toHaveAttribute("src", "/media/p12/card");
    expect(second.getByText("W 31–28")).toBeInTheDocument();
    expect(second.getByText("Fri, Oct 2 · 12 photos")).toBeInTheDocument();
    expect(within(cards[0]!).getByText("Fri, Oct 2 · 1 photo")).toBeInTheDocument();
  });

  it("says so when there are no albums", () => {
    render(<AlbumGrid slug="ghh" albums={[]} empty="Game albums appear here." />);
    expect(screen.getByText("Game albums appear here.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
