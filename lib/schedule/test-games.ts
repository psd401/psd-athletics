// Test factory for GameView. Defaults describe a Gig Harbor varsity home game.
import type { GameView } from "./games";

let n = 0;

export function makeGame(overrides: Partial<GameView> = {}): GameView {
  n += 1;
  return {
    id: `g${n}`,
    schoolId: "ghhs",
    schoolSlug: "ghh",
    schoolShortName: "Gig Harbor",
    mascot: "Tides",
    teamId: "t-ghhs-football",
    sport: "Football",
    sportSlug: "football",
    level: "varsity",
    opponent: "Silas",
    homeAway: "home",
    startDate: "2026-10-16",
    startTime: "19:00:00",
    status: "scheduled",
    scoreUs: null,
    scoreThem: null,
    isLeague: true,
    label: null,
    streamUrl: null,
    ticketUrl: null,
    venueName: "Gig Harbor High School",
    venueAddress: "5101 Rosedale St NW, Gig Harbor, WA 98335",
    record: {},
    source: "fixture",
    updatedFields: [],
    ...overrides,
  };
}

export const final = (scoreUs: number, scoreThem: number, overrides: Partial<GameView> = {}) =>
  makeGame({ status: "final", scoreUs, scoreThem, ...overrides });
