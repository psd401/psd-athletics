// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { undoChange } from "../audit";
import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listTeams } from "../data/queries";
import type { Actor } from "../permissions";
import { PermissionError, ValidationError } from "../studio/errors";
import {
  addPhotos,
  createAlbum,
  decideReport,
  describePhoto,
  getPublishedAlbum,
  listPublishedAlbums,
  photoForServing,
  publishAlbum,
  releasePhoto,
  removePhoto,
  reportPhoto,
  suggestGame,
} from "./albums";
import { memoryPhotoStorage } from "./storage";
import { cameraJpeg } from "./test-images";

let db: Db;
let football: string;
let soccer: string;
const now = new Date("2026-10-09T18:00:00Z");
const storage = memoryPhotoStorage();
let jpeg: Buffer;
const grant = (personId: string, role: Actor["grants"][number]["role"], teamId: string): Actor => ({
  personId,
  grants: [{ role, schoolId: "ghhs", teamId }],
  assistantsMayPublish: new Set(),
});
let coach: Actor;
let photographer: Actor;
let otherCoach: Actor;
const ad: Actor = { personId: "ad", grants: [{ role: "school_ad", schoolId: "ghhs", teamId: null }], assistantsMayPublish: new Set() };

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  const teams = await listTeams(db, { schoolId: "ghhs" });
  football = teams.find((t) => t.sportSlug === "football" && t.level === "varsity")!.id;
  soccer = teams.find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!.id;
  await db.insert(s.person).values(
    ["coach", "photog", "other", "ad"].map((id) => ({ id, name: id, email: `${id}@psd401.net`, emailVerified: true })),
  );
  coach = grant("coach", "head_coach", football);
  photographer = grant("photog", "photographer", football);
  otherCoach = grant("other", "head_coach", soccer);
  jpeg = await cameraJpeg({ width: 900, height: 600 });
}, 30_000);

const as = (actor: Actor) => ({ db, actor, now });

describe("albums", () => {
  it("a head coach uploads, describes every photo, and publishes", async () => {
    const album = await createAlbum(as(coach), { teamId: football, title: "Senior night" });
    expect(album).toMatchObject({ status: "draft", teamId: football, createdBy: "coach" });

    const [a, b] = await addPhotos(as(coach), storage, album.id, [jpeg, jpeg]);
    expect(a).toMatchObject({ heldReason: null, publishedAt: null, uploadedBy: "coach", width: 900, height: 600 });
    expect(a!.takenAt?.toISOString()).toBe("2026-10-07T01:42:10.000Z");
    expect(Object.keys(a!.sizes).sort()).toEqual(["card", "full", "thumb"]);
    expect(await storage.get(`${a!.storageKey}/thumb.webp`)).not.toBeNull();
    expect(await storage.get(`${a!.storageKey}/original.jpg`)).not.toBeNull();

    await describePhoto(as(coach), a!.id, "A receiver catches a pass in the end zone under the lights.");
    await expect(publishAlbum(as(coach), album.id)).rejects.toThrow(new ValidationError("Add an image description to every photo before publishing. 1 photo still needs one."));
    expect(await listPublishedAlbums(db, { schoolId: "ghhs" })).toEqual([]);

    await describePhoto(as(coach), b!.id, "The student section in white.");
    const published = await publishAlbum(as(coach), album.id);
    expect(published).toMatchObject({ status: "published", coverPhotoId: a!.id });
    const listed = await listPublishedAlbums(db, { schoolId: "ghhs" });
    expect(listed.map((x) => [x.title, x.photoCount, x.cover?.altText])).toEqual([["Senior night", 2, "A receiver catches a pass in the end zone under the lights."]]);
    expect((await getPublishedAlbum(db, album.id))?.photos.map((p) => p.altText)).toEqual([
      "A receiver catches a pass in the end zone under the lights.",
      "The student section in white.",
    ]);
  });

  it("holds a volunteer photographer's uploads until the coach releases them", async () => {
    const album = await createAlbum(as(photographer), { teamId: football, title: "Practice" });
    const [held] = await addPhotos(as(photographer), storage, album.id, [jpeg]);
    expect(held!.heldReason).toBe("Waiting for the coach to review");
    await describePhoto(as(photographer), held!.id, "Linemen run a drill.");
    await expect(publishAlbum(as(photographer), album.id)).rejects.toThrow(PermissionError);
    await expect(publishAlbum(as(coach), album.id)).rejects.toThrow(new ValidationError("There are no photos ready to publish. Release or add photos first."));
    await expect(releasePhoto(as(photographer), held!.id)).rejects.toThrow(PermissionError);
    await releasePhoto(as(coach), held!.id);
    expect((await publishAlbum(as(coach), album.id)).status).toBe("published");
  });

  it("keeps coaches to their own teams", async () => {
    await expect(createAlbum(as(otherCoach), { teamId: football, title: "Not mine" })).rejects.toThrow(PermissionError);
    const album = await createAlbum(as(coach), { teamId: football, title: "Mine" });
    await expect(addPhotos(as(otherCoach), storage, album.id, [jpeg])).rejects.toThrow(PermissionError);
  });

  it("refuses non-photos without storing anything", async () => {
    const album = await createAlbum(as(coach), { teamId: football, title: "Bad file" });
    await expect(addPhotos(as(coach), storage, album.id, [Buffer.from("%PDF-1.7")])).rejects.toThrow(ValidationError);
    expect(await db.select().from(s.photo).where(eq(s.photo.albumId, album.id))).toEqual([]);
  });

  it("removes a photo from the site, and the removal can be undone", async () => {
    const album = await createAlbum(as(coach), { teamId: football, title: "Undo me" });
    const [p] = await addPhotos(as(coach), storage, album.id, [jpeg]);
    await describePhoto(as(coach), p!.id, "Kickoff.");
    await publishAlbum(as(coach), album.id);
    await removePhoto(as(coach), p!.id);
    expect((await getPublishedAlbum(db, album.id))?.photos).toEqual([]);
    const [entry] = await db.select().from(s.auditLog).where(eq(s.auditLog.verb, "remove"));
    expect(await undoChange(db, { auditId: entry!.id, actor: coach, now })).toEqual({ ok: true });
    expect((await getPublishedAlbum(db, album.id))?.photos).toHaveLength(1);
  });
});

describe("reports", () => {
  it("hide a photo at once; the coach or AD keeps or removes it", async () => {
    const album = await createAlbum(as(coach), { teamId: football, title: "Reported" });
    const [p, q] = await addPhotos(as(coach), storage, album.id, [jpeg, jpeg]);
    await describePhoto(as(coach), p!.id, "One.");
    await describePhoto(as(coach), q!.id, "Two.");
    await publishAlbum(as(coach), album.id);

    await expect(reportPhoto(db, p!.id, { contact: "", reason: "That's my kid" }, now)).rejects.toThrow(new ValidationError("Add an email or phone number so we can follow up."));
    const report = await reportPhoto(db, p!.id, { contact: "parent@example.com", reason: "Please take this down." }, now);
    expect(report.status).toBe("open");
    expect((await getPublishedAlbum(db, album.id))?.photos.map((x) => x.id)).toEqual([q!.id]);
    expect((await photoForServing(db, p!.id))?.isPublic).toBe(false);

    await expect(decideReport(as(otherCoach), report.id, "kept")).rejects.toThrow(PermissionError);
    await decideReport(as(ad), report.id, "kept");
    expect((await getPublishedAlbum(db, album.id))?.photos).toHaveLength(2);

    const again = await reportPhoto(db, q!.id, { contact: "253-555-0100", reason: "Wrong team." }, now);
    const decided = await decideReport(as(coach), again.id, "removed");
    expect(decided).toMatchObject({ status: "removed", decidedBy: "coach" });
    expect((await getPublishedAlbum(db, album.id))?.photos.map((x) => x.id)).toEqual([p!.id]);
  });

  it("can't be filed against photos that aren't on the site", async () => {
    const album = await createAlbum(as(coach), { teamId: football, title: "Draft only" });
    const [p] = await addPhotos(as(coach), storage, album.id, [jpeg]);
    await expect(reportPhoto(db, p!.id, { contact: "a@b.co", reason: "x" }, now)).rejects.toThrow(new ValidationError("That photo isn't on the site."));
  });
});

describe("photoForServing", () => {
  it("is public only for published photos in published albums", async () => {
    const album = await createAlbum(as(coach), { teamId: football, title: "Serving" });
    const [p] = await addPhotos(as(coach), storage, album.id, [jpeg]);
    expect(await photoForServing(db, p!.id)).toMatchObject({ isPublic: false, schoolId: "ghhs", teamId: football });
    await describePhoto(as(coach), p!.id, "Huddle.");
    await publishAlbum(as(coach), album.id);
    expect(await photoForServing(db, p!.id)).toMatchObject({ isPublic: true, storageKey: p!.storageKey });
    expect(await photoForServing(db, "00000000-0000-0000-0000-000000000000")).toBeNull();
  });
});

describe("suggestGame", () => {
  const games = [
    { id: "fri", startDate: "2026-10-02", startTime: "19:00" },
    { id: "tue", startDate: "2026-10-06", startTime: "18:00" },
    { id: "tbd", startDate: "2026-10-09", startTime: null },
  ];
  it("picks the game most photos were taken during", () => {
    const at = (iso: string) => new Date(iso);
    // 6:42 pm and 8:30 pm PDT on Tuesday; 7:15 pm on Friday.
    expect(suggestGame(games, [at("2026-10-07T01:42:00Z"), at("2026-10-07T03:30:00Z"), at("2026-10-03T02:15:00Z")])).toBe("tue");
  });
  it("suggests nothing without capture times, or outside any game", () => {
    expect(suggestGame(games, [null, null])).toBeNull();
    expect(suggestGame(games, [new Date("2026-10-04T19:00:00Z")])).toBeNull();
  });
});
