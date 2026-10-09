import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { makeGame } from "../../lib/schedule/test-games";
import { GameActions, mapsUrl } from "./game-actions";

describe("GameActions", () => {
  it("offers only Directions and Add to calendar when the game has no ticket or stream link", () => {
    render(<GameActions game={makeGame({ id: "g-1", opponent: "Silas", startDate: "2026-10-16" })} />);
    const links = screen.getAllByRole("link");
    expect(links.map((l) => l.getAttribute("aria-label"))).toEqual([
      "Directions to Gig Harbor High School: Football vs Silas, Fri, Oct 16",
      "Add to calendar: Football vs Silas, Fri, Oct 16",
    ]);
    expect(links[1]).toHaveAttribute("href", "/api/games/g-1/ics");
  });

  it("adds Tickets and Watch when the links exist", () => {
    render(<GameActions game={makeGame({ ticketUrl: "https://gofan.co/event/1", streamUrl: "https://nfhs.example/1" })} />);
    expect(screen.getByRole("link", { name: /^Buy tickets/ })).toHaveAttribute("href", "https://gofan.co/event/1");
    expect(screen.getByRole("link", { name: /^Watch on NFHS Network/ })).toHaveTextContent("Watch");
  });

  it("leaves out Directions when the venue is unknown", () => {
    render(<GameActions game={makeGame({ homeAway: "away", venueName: null, venueAddress: null })} />);
    expect(screen.queryByRole("link", { name: /^Directions/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

describe("mapsUrl", () => {
  it("searches the venue address", () => {
    expect(mapsUrl("14105 Purdy Dr NW, Gig Harbor, WA 98332")).toBe(
      "https://www.google.com/maps/search/?api=1&query=14105%20Purdy%20Dr%20NW%2C%20Gig%20Harbor%2C%20WA%2098332",
    );
  });
});
