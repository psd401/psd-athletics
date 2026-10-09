// Per-school words, images and outside links for the shared school template. Copy comes
// from the approved comps (design/GHHS-Home.dc.html, design/PHS-Home.dc.html).

/** Puget Sound League, both schools' league (DECISIONS 46). */
export const LEAGUE_URL = "https://www.pugetsoundleague.org/";

export interface SchoolLinks {
  /** GoFan school page: every ticketed event. */
  tickets: string;
  /** NFHS Network school page: every streamed event. */
  watch: string;
  /** BSN Sideline team store, as linked from the school's own site. */
  store: string;
}

export interface SchoolContent {
  slug: "ghh" | "phs";
  links: SchoolLinks;
  motif: "waves" | "chevrons";
  heroPhoto: string;
  traditionPhoto: string;
  ghostText: string;
  scoreboardLabel: string;
  fanIntro: string;
  traditionKicker: (founded: number | null) => string;
  traditionTitle: string;
  alertsKicker: string;
  alertsTitle: string;
  alertsText: string;
  partnersTitle: string;
  footerSlogan: string;
}

export const schoolContent: Record<string, SchoolContent> = {
  ghh: {
    slug: "ghh",
    links: {
      tickets: "https://gofan.co/app/school/WA23221",
      watch: "https://www.nfhsnetwork.com/schools/gig-harbor-high-school-gig-harbor-wa",
      store: "https://sideline.bsnsports.com/schools/washington/gigharbor/gig-harbor-high-school",
    },
    motif: "waves",
    heroPhoto: "/images/ghhs-friday-night.jpg",
    traditionPhoto: "/images/ghhs-runners.jpg",
    ghostText: "Roll Tides",
    scoreboardLabel: "Scoreboard",
    fanIntro: "Everything a Tides family needs, one tap away. No digging through PDFs.",
    traditionKicker: (founded) => (founded ? `Home of the Tides since ${founded}` : "Home of the Tides"),
    traditionTitle: "Built on titles",
    alertsKicker: "Tide Pride alerts",
    alertsTitle: "Know the moment a game moves.",
    alertsText: "Pick your teams. When Arbiter changes a time, field or date, you get one text. Final scores too, if you want them.",
    partnersTitle: "Tide Pride partners",
    footerSlogan: "Roll Tides",
  },
  phs: {
    slug: "phs",
    links: {
      tickets: "https://gofan.co/app/school/WA23302",
      watch: "https://www.nfhsnetwork.com/schools/peninsula-high-school-gig-harbor-wa",
      store: "https://sideline.bsnsports.com/schools/washington/gigharbor/peninsula-high-school",
    },
    motif: "chevrons",
    heroPhoto: "/images/phs-osprey.jpg",
    traditionPhoto: "/images/phs-osprey.jpg",
    ghostText: "Seahawks",
    scoreboardLabel: "Hawks scoreboard",
    fanIntro: "Everything a Seahawks family needs, one tap away. No digging through PDFs.",
    traditionKicker: (founded) => (founded ? `Peninsula High School since ${founded}` : "Peninsula High School"),
    traditionTitle: "More than a scoreboard",
    alertsKicker: "Hawk alerts",
    alertsTitle: "Follow your Seahawk.",
    alertsText: "One text when a game moves. One text with the final. That's it.",
    partnersTitle: "Seahawks partners",
    footerSlogan: "Seahawks",
  },
};
