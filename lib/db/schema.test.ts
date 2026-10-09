// @vitest-environment node
import { getTableColumns, sql } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "./client";
import * as s from "./schema";

let db: Db;
let teamId: string;
let albumId: string;

// Postgres wraps constraint errors; the constraint name is on the cause.
async function rejection(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    const e = error as { message?: string; cause?: { message?: string; constraint?: string } };
    return [e.message, e.cause?.message, e.cause?.constraint].filter(Boolean).join(" | ");
  }
  throw new Error("expected the insert to be rejected");
}

beforeAll(async () => {
  db = await createMemoryDb();
  await db.insert(s.school).values({
    id: "ghhs",
    slug: "ghh",
    name: "Gig Harbor High School",
    shortName: "Gig Harbor",
    mascot: "Tides",
    address: "5101 Rosedale St NW, Gig Harbor, WA 98335",
    logoPath: "/logos/ghhs-gh-logo.png",
  });
  const [season] = await db.insert(s.season).values({ schoolYear: "2026-27", term: "fall" }).returning();
  const [sport] = await db.insert(s.sport).values({ name: "Football", slug: "football" }).returning();
  const [team] = await db
    .insert(s.team)
    .values({ schoolId: "ghhs", sportId: sport!.id, seasonId: season!.id, level: "varsity", slug: "football" })
    .returning();
  teamId = team!.id;
  await db.insert(s.person).values({ id: "p1", name: "Test Coach", email: "coach@psd401.net", emailVerified: true });
  const [album] = await db.insert(s.album).values({ teamId, title: "Album", createdBy: "p1" }).returning();
  albumId = album!.id;
}, 30_000);

describe("initial migration", () => {
  it("creates every table in the plan", async () => {
    // Both drivers return { rows }; the shared Db type leaves the result untyped.
    const result = (await db.execute(
      sql`select table_name from information_schema.tables where table_schema = 'public'`,
    )) as unknown as { rows: { table_name: string }[] };
    expect(result.rows.map((r) => r.table_name).sort()).toEqual([
      "account", "agent_connection", "album", "alert_message", "audit_log", "coach_note", "document",
      "feed_post", "feed_post_photo", "follower", "follower_team", "game", "honor", "person", "photo",
      "photo_report", "role_assignment", "roster_entry", "rule", "schedule_change", "school",
      "school_contact", "season", "session", "sponsor", "sport", "story", "team", "venue", "verification",
    ]);
  });
});

describe("role_assignment scope", () => {
  const base = { personId: "p1", startsOn: "2026-08-01", source: "test" };

  it("lets the district AD hold a role with no school or team", async () => {
    const [row] = await db.insert(s.roleAssignment).values({ ...base, role: "district_ad" }).returning();
    expect(row?.role).toBe("district_ad");
  });

  it("requires a school for a school AD", async () => {
    expect(await rejection(db.insert(s.roleAssignment).values({ ...base, role: "school_ad" }))).toContain(
      "role_assignment_scope",
    );
  });

  it("requires a team for coaches and photographers", async () => {
    for (const role of ["head_coach", "assistant_coach", "photographer"] as const) {
      expect(await rejection(db.insert(s.roleAssignment).values({ ...base, role, schoolId: "ghhs" }))).toContain(
        "role_assignment_scope",
      );
    }
    const [row] = await db.insert(s.roleAssignment).values({ ...base, role: "head_coach", teamId }).returning();
    expect(row?.teamId).toBe(teamId);
  });

  it("rejects an assignment that ends before it starts", async () => {
    expect(
      await rejection(db.insert(s.roleAssignment).values({ ...base, role: "district_ad", endsOn: "2026-07-01" })),
    ).toContain("role_assignment_dates");
  });
});

describe("team", () => {
  it("allows one team per school, sport, season and level", async () => {
    const [existing] = await db.select().from(s.team);
    expect(
      await rejection(
        db.insert(s.team).values({
          schoolId: "ghhs",
          sportId: existing!.sportId,
          seasonId: existing!.seasonId,
          level: "varsity",
          slug: "football",
        }),
      ),
    ).toContain("team_school_sport_season_level");
  });
});

describe("game", () => {
  const base = { opponent: "Silas", homeAway: "home" as const, startDate: "2026-10-16", source: "fixture" as const };

  it("keeps an unknown start time and league flag as null", async () => {
    const [row] = await db.insert(s.game).values({ ...base, teamId }).returning();
    expect(row?.startTime).toBeNull();
    expect(row?.isLeague).toBeNull();
    expect(row?.status).toBe("scheduled");
    expect(row?.updatedFields).toEqual([]);
  });

  it("rejects a final with no score", async () => {
    expect(await rejection(db.insert(s.game).values({ ...base, teamId, status: "final" }))).toContain(
      "game_final_has_score",
    );
  });

  it("rejects half a score and negative scores", async () => {
    expect(await rejection(db.insert(s.game).values({ ...base, teamId, scoreUs: 3 }))).toContain("game_scores_pair");
    expect(
      await rejection(db.insert(s.game).values({ ...base, teamId, scoreUs: -1, scoreThem: 0 })),
    ).toContain("game_scores_nonnegative");
  });

  it("rejects a status that isn't in the enum", async () => {
    expect(
      await rejection(db.execute(sql`insert into game (team_id, opponent, home_away, start_date, source, status)
        values (${teamId}, 'X', 'home', '2026-10-16', 'fixture', 'delayed')`)),
    ).toMatch(/invalid input value for enum game_status/);
  });
});

describe("photo", () => {
  const base = () => ({ albumId, storageKey: "k", width: 10, height: 10, uploadedBy: "p1" });

  it("can't be published without an image description", async () => {
    const publishedAt = new Date();
    for (const altText of [null, "", "   "]) {
      expect(await rejection(db.insert(s.photo).values({ ...base(), publishedAt, altText }))).toContain(
        "photo_published_has_alt",
      );
    }
    const [row] = await db
      .insert(s.photo)
      .values({ ...base(), publishedAt, altText: "Players celebrate a goal" })
      .returning();
    expect(row?.altText).toBe("Players celebrate a goal");
  });

  it("can be held as a draft without one", async () => {
    const [row] = await db.insert(s.photo).values(base()).returning();
    expect(row?.publishedAt).toBeNull();
  });
});

describe("student privacy", () => {
  it("roster entries hold directory information only", () => {
    expect(Object.keys(getTableColumns(s.rosterEntry)).sort()).toEqual([
      "createdAt", "displayName", "grade", "id", "jerseyNumber", "photoReleaseOptOut", "position", "teamId", "updatedAt",
    ]);
  });
});
