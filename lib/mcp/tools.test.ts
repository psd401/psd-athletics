// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listSchools, listTeams } from "../data/queries";
import type { Actor } from "../permissions";
import { contentPublish, draftsList, feedPost, rosterUpdate, scheduleGet, storyDraft, teamsList, type ToolContext } from "./tools";

let db: Db;
let soccer: string;
let football: string;
let ctx: ToolContext;
let assistantCtx: ToolContext;
const now = new Date("2026-10-09T02:10:00Z"); // Thu Oct 8, 7:10 pm Pacific

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  const [schools, teams] = await Promise.all([listSchools(db), listTeams(db)]);
  soccer = teams.find((t) => t.schoolId === "ghhs" && t.sportSlug === "girls-soccer" && t.level === "varsity")!.id;
  football = teams.find((t) => t.schoolId === "ghhs" && t.sportSlug === "football" && t.level === "varsity")!.id;
  await db.insert(s.person).values([
    { id: "coach", name: "Coach", email: "coach@psd401.net", emailVerified: true },
    { id: "asst", name: "Assistant", email: "asst@psd401.net", emailVerified: true },
  ]);
  const [c1, c2] = await db
    .insert(s.agentConnection)
    .values([
      { personId: "coach", clientName: "Claude", expiresAt: new Date("2026-10-10T00:00:00Z") },
      { personId: "asst", clientName: "Claude", expiresAt: new Date("2026-10-10T00:00:00Z") },
    ])
    .returning();
  const coach: Actor = { personId: "coach", grants: [{ role: "head_coach", schoolId: "ghhs", teamId: soccer }], assistantsMayPublish: new Set(), agentConnectionId: c1!.id };
  const asst: Actor = { personId: "asst", grants: [{ role: "assistant_coach", schoolId: "ghhs", teamId: football }], assistantsMayPublish: new Set(), agentConnectionId: c2!.id };
  ctx = { db, actor: coach, now, schools, teams };
  assistantCtx = { db, actor: asst, now, schools, teams };
}, 30_000);

describe("psd_athletics_teams_list", () => {
  it("lists the person's teams and what the assistant may do for each", async () => {
    expect(await teamsList(ctx)).toEqual({
      teams: [
        {
          team_id: soccer,
          school: "Gig Harbor",
          sport: "Girls Soccer",
          level: "Varsity",
          page: "https://athletics.psd401.net/ghh/teams/girls-soccer",
          can: ["write stories", "publish stories", "edit and publish the roster", "post to the team feed"],
        },
      ],
    });
  });
});

describe("psd_athletics_schedule_get", () => {
  it("returns games with unknowns as null, paged", async () => {
    const page = await scheduleGet(ctx, { team_id: soccer, limit: 2 });
    expect(page.games).toHaveLength(2);
    expect(page.games[0]).toMatchObject({ team: "Gig Harbor Girls Soccer · Varsity", game_page: expect.stringMatching(/^https:\/\/athletics\.psd401\.net\/ghh\/game\//) });
    expect(Object.keys(page.games[0]!).sort()).toEqual(["date", "game_id", "game_page", "home_or_away", "opponent", "result", "start_time", "status", "team", "venue"]);
    expect(page.next_cursor).toBe("2");
    const final = (await scheduleGet(ctx, { team_id: soccer, limit: 50 })).games.find((g) => g.opponent === "Capital");
    expect(final).toMatchObject({ result: "W 2–0", status: "final" });
    const tbd = (await scheduleGet(ctx, { team_id: soccer, limit: 50 })).games.find((g) => g.start_time === null);
    if (tbd) expect(tbd.start_time).toBeNull();
  });

  it("defaults to the person's teams and refuses an unknown team with a hint", async () => {
    const mine = await scheduleGet(ctx, {});
    expect(new Set(mine.games.map((g) => g.team))).toEqual(new Set(["Gig Harbor Girls Soccer · Varsity"]));
    await expect(scheduleGet(ctx, { team_id: "00000000-0000-0000-0000-000000000000" })).rejects.toThrow("No team with that id. Call psd_athletics_teams_list for ids.");
  });
});

describe("psd_athletics_story_draft and content_publish", () => {
  it("writes a story as the coach, audited with the assistant's connection, and publishes it", async () => {
    const saved = await storyDraft(ctx, { team_id: soccer, title: "Tides blank Capital", body: "Gig Harbor beat Capital 2–0." });
    expect(saved).toMatchObject({ status: "draft", studio: expect.stringMatching(/\/studio\/stories\/[0-9a-f-]{36}$/) });
    const [row] = await db.select().from(s.story);
    expect(row).toMatchObject({ draftedByAgent: true, publishedAt: null });
    const [log] = await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, row!.id));
    expect(log!.agentConnectionId).toBe(ctx.actor.agentConnectionId);

    const live = await contentPublish(ctx, { kind: "story", id: row!.id });
    expect(live).toEqual({ published: true, kind: "story", url: "https://athletics.psd401.net/ghh/stories/tides-blank-capital" });
    const edited = await storyDraft(ctx, { story_id: row!.id, title: "Tides blank Capital", body: "Gig Harbor beat Capital 2–0 on the road." });
    expect(edited.status).toBe("published");
  });

  it("never goes beyond the person", async () => {
    await expect(storyDraft(ctx, { team_id: football, title: "x", body: "y" })).rejects.toThrow(/can't write stories for this team/);
    const [draft] = await db.insert(s.story).values({ schoolId: "ghhs", teamId: football, title: "Football draft", slug: "football-draft", body: "b", authorId: "asst" }).returning();
    // The football assistant can write but not publish (no publish rule for the team).
    await expect(contentPublish(assistantCtx, { kind: "story", id: draft!.id })).rejects.toThrow(/publishing needs the head coach or an athletic director/);
  });
});

describe("psd_athletics_roster_update", () => {
  it("adds and removes roster entries; new ones go live when the roster is published", async () => {
    await expect(rosterUpdate(ctx, { team_id: soccer, add: [{ display_name: "Alexandra Rivera" }] })).rejects.toThrow("Use first name and last initial, like Alex R.");
    const done = await rosterUpdate(ctx, { team_id: soccer, add: [{ display_name: "Alex R.", jersey_number: "9" }, { display_name: "Sam T." }] });
    expect(done).toMatchObject({ added: 2, removed: 0 });
    let rows = await db.select().from(s.rosterEntry).where(eq(s.rosterEntry.teamId, soccer));
    expect(rows.every((r) => r.publishedAt === null)).toBe(true);
    expect(await contentPublish(ctx, { kind: "roster", team_id: soccer })).toMatchObject({ published: true, entries: 2 });
    const sam = rows.find((r) => r.displayName === "Sam T.")!;
    expect(await rosterUpdate(ctx, { team_id: soccer, remove: [sam.id] })).toMatchObject({ removed: 1 });
    rows = await db.select().from(s.rosterEntry).where(eq(s.rosterEntry.teamId, soccer));
    expect(rows.map((r) => r.displayName)).toEqual(["Alex R."]);
  });

  it("is for people who can edit the roster", async () => {
    await expect(rosterUpdate(assistantCtx, { team_id: football, add: [{ display_name: "Jo K." }] })).rejects.toThrow(/can't edit the roster/);
  });
});

describe("psd_athletics_feed_post", () => {
  it("posts to the team feed at once", async () => {
    const saved = await feedPost(assistantCtx, { team_id: football, kind: "note", body: "Bus leaves at 3:15." });
    expect(saved).toMatchObject({ status: "published", feed: "https://athletics.psd401.net/ghh/feed" });
    await expect(feedPost(assistantCtx, { team_id: soccer, kind: "note", body: "Not my team." })).rejects.toThrow(/Only this team's coaches/);
  });
});

describe("psd_athletics_drafts_list", () => {
  it("lists what isn't on the site yet", async () => {
    const out = await draftsList(assistantCtx);
    expect(out.stories.map((x) => x.title)).toEqual(["Football draft"]);
    expect(out.feed_posts).toEqual([]);
  });
});
