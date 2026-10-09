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
          assistant_can: ["draft stories", "propose roster changes", "draft feed posts"],
          person_publishes: true,
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

describe("psd_athletics_story_draft", () => {
  it("previews by default and writes nothing", async () => {
    const preview = await storyDraft(ctx, { team_id: soccer, title: "Tides blank Capital", body: "Gig Harbor beat Capital 2–0." });
    expect(preview).toMatchObject({ dry_run: true, would: "create a draft story", title: "Tides blank Capital" });
    expect(await db.select().from(s.story)).toEqual([]);
  });

  it("saves a draft marked as drafted by the assistant, audited with the connection", async () => {
    const saved = await storyDraft(ctx, { team_id: soccer, title: "Tides blank Capital", body: "Gig Harbor beat Capital 2–0.", dry_run: false });
    expect(saved).toMatchObject({ dry_run: false, status: "draft", review_in_studio: expect.stringMatching(/\/studio\/stories\/[0-9a-f-]{36}$/) });
    const [row] = await db.select().from(s.story);
    expect(row).toMatchObject({ status: "draft", draftedByAgent: true, publishedAt: null });
    const [log] = await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, row!.id));
    expect(log!.agentConnectionId).toBe(ctx.actor.agentConnectionId);
  });

  it("won't touch other teams or published stories", async () => {
    await expect(storyDraft(ctx, { team_id: football, title: "x", body: "y", dry_run: false })).rejects.toThrow(/can't write stories for this team/);
    const [row] = await db.select().from(s.story);
    await db.update(s.story).set({ status: "published", publishedAt: now }).where(eq(s.story.id, row!.id));
    await expect(storyDraft(ctx, { story_id: row!.id, title: "Changed", body: "z", dry_run: false })).rejects.toThrow("That story is published. A person edits published stories in the Studio.");
  });
});

describe("psd_athletics_roster_update", () => {
  it("adds unpublished entries and only removes unpublished ones", async () => {
    const preview = await rosterUpdate(ctx, { team_id: soccer, add: [{ display_name: "Alex R.", jersey_number: "9" }] });
    expect(preview).toMatchObject({ dry_run: true, would_add: ["Alex R."], would_remove: [] });
    await expect(rosterUpdate(ctx, { team_id: soccer, add: [{ display_name: "Alexandra Rivera" }] })).rejects.toThrow("Use first name and last initial, like Alex R.");

    const done = await rosterUpdate(ctx, { team_id: soccer, add: [{ display_name: "Alex R.", jersey_number: "9" }, { display_name: "Sam T." }], dry_run: false });
    expect(done).toMatchObject({ dry_run: false, added: 2, removed: 0, note: "New entries stay off the site until a coach publishes the roster in the Studio." });
    const rows = await db.select().from(s.rosterEntry).where(eq(s.rosterEntry.teamId, soccer));
    expect(rows.every((r) => r.publishedAt === null)).toBe(true);

    await db.update(s.rosterEntry).set({ publishedAt: now }).where(eq(s.rosterEntry.displayName, "Sam T."));
    const sam = rows.find((r) => r.displayName === "Sam T.")!;
    await expect(rosterUpdate(ctx, { team_id: soccer, remove: [sam.id], dry_run: false })).rejects.toThrow("Sam T. is on the published roster. A person removes published entries in the Studio.");
  });

  it("is for people who can edit the roster", async () => {
    await expect(rosterUpdate(assistantCtx, { team_id: football, add: [{ display_name: "Jo K." }], dry_run: false })).rejects.toThrow(/can't edit the roster/);
  });
});

describe("psd_athletics_feed_post", () => {
  it("saves the assistant's post as a draft for the person to publish", async () => {
    const saved = await feedPost(assistantCtx, { team_id: football, kind: "note", body: "Bus leaves at 3:15.", dry_run: false });
    expect(saved).toMatchObject({ status: "draft", review_in_studio: "https://athletics.psd401.net/studio/post" });
    const [row] = await db.select().from(s.feedPost);
    expect(row!.publishedAt).toBeNull();
  });
});

describe("psd_athletics_drafts_list", () => {
  it("lists what's waiting for a person", async () => {
    const out = await draftsList(ctx);
    expect(out.stories.map((x) => x.title)).toEqual([]);
    expect(out.roster).toEqual([{ team: "Gig Harbor Girls Soccer · Varsity", unpublished_entries: 1, review_in_studio: expect.stringContaining("/studio/teams/") }]);
    expect((await draftsList(assistantCtx)).feed_posts.map((p) => p.body)).toEqual(["Bus leaves at 3:15."]);
  });
});

describe("psd_athletics_content_publish", () => {
  it("never publishes; it says where the person publishes and whether they can", async () => {
    const [row] = await db.insert(s.story).values({ schoolId: "ghhs", teamId: soccer, title: "Draft", slug: "draft", body: "b", authorId: "coach" }).returning();
    const out = await contentPublish(ctx, { kind: "story", id: row!.id });
    expect(out).toEqual({
      published: false,
      why: "Agents propose; people publish. Open the link to read it and publish.",
      publish_in_studio: `https://athletics.psd401.net/studio/stories/${row!.id}`,
      you_can_publish: true,
    });
    const [after] = await db.select().from(s.story).where(eq(s.story.id, row!.id));
    expect(after!.status).toBe("draft");
    expect((await contentPublish(assistantCtx, { kind: "roster", team_id: football })).you_can_publish).toBe(false);
  });
});
