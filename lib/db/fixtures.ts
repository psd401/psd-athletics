// Types for the seed files in fixtures/. The JSON is real data gathered
// 2026-10-08 (see its _about field); these types describe its shape.

import contentJson from "../../fixtures/school-content.json";
import snapshotJson from "../../fixtures/fall-2026-snapshot.json";

export type FixtureTerm = "fall" | "winter" | "spring";

export interface FixtureSchool {
  id: string;
  name: string;
  mascot: string;
  path: string;
  founded?: number;
  address: string;
  homeField?: string;
  logo: string;
  social?: { instagram?: string; x?: string };
  contacts: { name: string; role: string; email?: string; phone?: string }[];
  sportsBySeason: Record<FixtureTerm, string[]>;
}

export interface FixtureGame {
  school: string;
  sport: string;
  level: string;
  /** YYYY-MM-DD, Pacific */
  date: string;
  /** HH:MM, Pacific; null when the source didn't list one */
  time: string | null;
  opponent: string;
  ha: "home" | "away";
  league?: boolean;
  result?: "W" | "L" | "T";
  /** "us-them" */
  score?: string;
  note?: string;
  tickets?: boolean;
  stream?: boolean;
}

export interface FixtureSnapshot {
  asOf: string;
  schools: FixtureSchool[];
  fishBowl: { season: number; date: string; time: string; site: string; winner: string; score: Record<string, number> };
  records: Record<string, Record<string, string | number>>;
  games: FixtureGame[];
}

export interface FixtureContent {
  schools: { id: string; arbiterEntityId: string }[];
  honors: {
    school: string;
    sport?: string;
    figure: string;
    title: string;
    detail?: string;
    featuredOnHub: boolean;
  }[];
}

export const snapshot = snapshotJson as FixtureSnapshot;
export const schoolContent = contentJson as FixtureContent;
