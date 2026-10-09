// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { undoChange } from "../audit";
import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listGames, listTeams } from "../data/queries";
import type { Actor } from "../permissions";
import { listPublishedAlbums, photoForServing } from "../photos/albums";
import { memoryPhotoStorage } from "../photos/storage";
import { cameraJpeg } from "../photos/test-images";
import { PermissionError, ValidationError } from "../studio/errors";
import { createPost, listFeed, publishPost, removePost } from "./posts";

let db: Db;
let soccer: string;
let football: string;
let capital: string;
const now = new Date("2026-10-09T02:10:00Z"); // 7:10 pm PDT, Thursday Oct 8
const storage = memoryPhotoStorage();
let jpeg: Buffer;
const actor = (personId: string, role: Actor["grants"][number]["role"], teamId: string, agent?: string): Actor => ({
  personId,
  grants: [{ role, schoolId: "ghhs", teamId }],
  assistantsMayPublish: new Set(),
  agentConnectionId: agent,
});
let coach: Actor;
let assistant: Actor;
let photographer: Actor;

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  const teams = await listTeams(db, { schoolId: "ghhs" });
  soccer = teams.find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!.id;
  football = teams.find((t) => t.sportSlug === "football" && t.level === "varsity")!.id;
  capital = (await listGames(db, { schoolId: "ghhs" })).find((g) => g.teamId === soccer && g.opponent === "Capital")!.id;
  await db.insert(s.person).values(["coach", "asst", "photog"].map((id) => ({ id, name: id, email: `${id}@psd401.net`, emailVerified: true })));
  coach = actor("coach", "head_coach", soccer);
  assistant = actor("asst", "assistant_coach", soccer);
  photographer = actor("photog", "photographer", soccer);
  jpeg = await cameraJpeg({ width: 900, height: 600 });
}, 30_000);

const as = (a: Actor) => ({ db, actor: a, now });

describe("createPost", () => {
  it("posts a note right away", async () => {
    const post = await createPost(as(coach), storage, { teamId: soccer, kind: "note", body: "Bus leaves at 3:15 tomorrow." });
    expect(post.publishedAt?.toISOString()).toBe(now.toISOString());
    const feed = await listFeed(db, { schoolId: "ghhs" });
    expect(feed[0]).toMatchObject({ id: post.id, kind: "note", body: "Bus leaves at 3:15 tomorrow.", sport: "Girls Soccer", sportSlug: "girls-soccer", photos: [] });
  });

  it("lets an assistant post photos from the sideline, each with a description, into the day's published album", async () => {
    const post = await createPost(as(assistant), storage, {
      teamId: soccer,
      kind: "photo",
      gameId: capital,
      body: "Halftime from the sideline.",
      photos: [
        { data: jpeg, altText: "Two Tides players celebrate near the bench." },
        { data: jpeg, altText: "The keeper punches a corner clear." },
      ],
    });
    const [item] = (await listFeed(db, { schoolId: "ghhs" })).filter((p) => p.id === post.id);
    expect(item!.photos.map((p) => p.altText)).toEqual(["Two Tides players celebrate near the bench.", "The keeper punches a corner clear."]);
    expect((await photoForServing(db, item!.photos[0]!.id))?.isPublic).toBe(true);
    const albums = await listPublishedAlbums(db, { schoolId: "ghhs", teamId: soccer });
    expect(albums.map((a) => [a.title, a.photoCount])).toEqual([["Sideline · Thu, Oct 8", 2]]);

    // A second photo post the same day goes into the same album.
    await createPost(as(coach), storage, { teamId: soccer, kind: "photo", photos: [{ data: jpeg, altText: "Postgame huddle." }] });
    expect((await listPublishedAlbums(db, { schoolId: "ghhs", teamId: soccer })).map((a) => a.photoCount)).toEqual([3]);
  });

  it("posts score updates as words, without touching the game's score", async () => {
    const [before] = await db.select().from(s.game).where(eq(s.game.id, capital));
    const post = await createPost(as(coach), storage, { teamId: soccer, kind: "score", gameId: capital, body: "Halftime: Tides 1, Capital 0." });
    expect(post.kind).toBe("score");
    const [after] = await db.select().from(s.game).where(eq(s.game.id, capital));
    expect(after).toEqual(before);
    await expect(createPost(as(coach), storage, { teamId: soccer, kind: "score", body: "1–0" })).rejects.toThrow(new ValidationError("Pick the game this score is from."));
  });

  it("refuses posts that are missing what they need", async () => {
    await expect(createPost(as(coach), storage, { teamId: soccer, kind: "note", body: "  " })).rejects.toThrow(new ValidationError("Write something to post."));
    await expect(createPost(as(coach), storage, { teamId: soccer, kind: "photo", photos: [] })).rejects.toThrow(new ValidationError("Add at least one photo."));
    await expect(createPost(as(coach), storage, { teamId: soccer, kind: "photo", photos: [{ data: jpeg, altText: "" }] })).rejects.toThrow(
      new ValidationError("Every photo needs an image description."),
    );
    await expect(createPost(as(coach), storage, { teamId: soccer, kind: "photo", photos: Array(5).fill({ data: jpeg, altText: "x" }) })).rejects.toThrow(
      new ValidationError("Post up to 4 photos at a time. Use an album for more."),
    );
    await expect(createPost(as(coach), storage, { teamId: soccer, kind: "note", gameId: (await listGames(db, { schoolId: "ghhs" })).find((g) => g.teamId === football)!.id, body: "x" })).rejects.toThrow(
      new ValidationError("Pick one of this team's games, or none."),
    );
  });

  it("is for coaches of the team only", async () => {
    await expect(createPost(as(photographer), storage, { teamId: soccer, kind: "note", body: "Hi" })).rejects.toThrow(PermissionError);
    await expect(createPost(as(coach), storage, { teamId: football, kind: "note", body: "Hi" })).rejects.toThrow(PermissionError);
  });

  it("keeps an AI agent's post as a draft for a person to publish", async () => {
    const [connection] = await db
      .insert(s.agentConnection)
      .values({ personId: "coach", clientName: "Test assistant", expiresAt: new Date("2026-10-10T00:00:00Z") })
      .returning();
    const viaAgent = actor("coach", "head_coach", soccer, connection!.id);
    const post = await createPost(as(viaAgent), storage, { teamId: soccer, kind: "note", body: "Drafted by the agent." });
    expect(post.publishedAt).toBeNull();
    expect((await listFeed(db, { schoolId: "ghhs" })).some((p) => p.id === post.id)).toBe(false);
    await expect(createPost(as(viaAgent), storage, { teamId: soccer, kind: "photo", photos: [{ data: jpeg, altText: "x" }] })).rejects.toThrow(ValidationError);
  });
});

describe("removePost", () => {
  it("takes a post off the feed; the author or head coach can, and it can be undone", async () => {
    const post = await createPost(as(assistant), storage, { teamId: soccer, kind: "note", body: "Remove me." });
    await expect(removePost(as(photographer), post.id)).rejects.toThrow(PermissionError);
    await removePost(as(coach), post.id);
    expect((await listFeed(db, { schoolId: "ghhs" })).some((p) => p.id === post.id)).toBe(false);
    const [entry] = await db.select().from(s.auditLog).where(eq(s.auditLog.verb, "remove"));
    expect(entry).toMatchObject({ objectType: "feed_post", objectId: post.id });
    expect(await undoChange(db, { auditId: entry!.id, actor: coach, now })).toEqual({ ok: true });
    expect((await listFeed(db, { schoolId: "ghhs" })).some((p) => p.id === post.id)).toBe(true);
  });
});

describe("listFeed", () => {
  it("filters by team and leaves out photos that were reported or removed", async () => {
    expect((await listFeed(db, { schoolId: "ghhs", teamIds: [football] })).length).toBe(0);
    const soccerOnly = await listFeed(db, { schoolId: "ghhs", teamIds: [soccer] });
    expect(soccerOnly.length).toBeGreaterThan(0);
    const withPhotos = soccerOnly.find((p) => p.photos.length === 2)!;
    await db.update(s.photo).set({ hiddenReason: "Reported" }).where(eq(s.photo.id, withPhotos.photos[0]!.id));
    expect((await listFeed(db, { schoolId: "ghhs" })).find((p) => p.id === withPhotos.id)!.photos).toHaveLength(1);
    expect(await listFeed(db, { schoolId: "phs" })).toEqual([]);
  });
});

describe("publishPost", () => {
  it("lets a person publish an assistant's draft; the assistant can't", async () => {
    const [connection] = await db.insert(s.agentConnection).values({ personId: "asst", clientName: "Claude", expiresAt: new Date("2026-10-10T00:00:00Z") }).returning();
    const viaAgent = actor("asst", "assistant_coach", soccer, connection!.id);
    const draft = await createPost(as(viaAgent), storage, { teamId: soccer, kind: "note", body: "Drafted for the coach." });
    await expect(publishPost(as(viaAgent), draft.id)).rejects.toThrow(new PermissionError("A person publishes posts. Open the Studio to publish this one."));
    await expect(publishPost(as(photographer), draft.id)).rejects.toThrow(PermissionError);
    const live = await publishPost(as(assistant), draft.id);
    expect(live.publishedAt?.toISOString()).toBe(now.toISOString());
    expect((await listFeed(db, { schoolId: "ghhs" })).some((p) => p.id === draft.id)).toBe(true);
  });
});
