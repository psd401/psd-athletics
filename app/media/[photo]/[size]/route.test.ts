// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Route handlers read request headers; there's no request here, and no session.
vi.mock("next/headers", () => ({ headers: async () => new Headers() }));

let dir: string;
let published: string;
let draft: string;

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), "media-"));
  process.env.PHOTO_STORAGE_DIR = dir;
  process.env.BETTER_AUTH_SECRET = "test-only-secret-not-used-anywhere-else";
  const { appDb } = await import("../../../../lib/data/db");
  const { listTeams } = await import("../../../../lib/data/queries");
  const albums = await import("../../../../lib/photos/albums");
  const { photoStorage } = await import("../../../../lib/photos/storage");
  const { cameraJpeg } = await import("../../../../lib/photos/test-images");
  const s = await import("../../../../lib/db/schema");
  const db = await appDb();
  const team = (await listTeams(db, { schoolId: "ghhs" })).find((t) => t.sportSlug === "football" && t.level === "varsity")!;
  await db.insert(s.person).values({ id: "media-coach", name: "Coach", email: "media-coach@psd401.net", emailVerified: true });
  const ctx = { db, now: new Date(), actor: { personId: "media-coach", grants: [{ role: "head_coach" as const, schoolId: "ghhs", teamId: team.id }], assistantsMayPublish: new Set<string>() } };
  const jpeg = await cameraJpeg({ width: 600, height: 400 });
  const live = await albums.createAlbum(ctx, { teamId: team.id, title: "Live" });
  const [p] = await albums.addPhotos(ctx, photoStorage(), live.id, [jpeg]);
  await albums.describePhoto(ctx, p!.id, "Kickoff.");
  await albums.publishAlbum(ctx, live.id);
  published = p!.id;
  const hidden = await albums.createAlbum(ctx, { teamId: team.id, title: "Draft" });
  const [d] = await albums.addPhotos(ctx, photoStorage(), hidden.id, [jpeg]);
  draft = d!.id;
}, 60_000);

afterAll(async () => rm(dir, { recursive: true, force: true }));

const get = async (photo: string, size: string) => {
  const { GET } = await import("./route");
  return GET(new Request(`http://localhost/media/${photo}/${size}`), { params: Promise.resolve({ photo, size }) });
};

describe("GET /media/[photo]/[size]", () => {
  it("serves a published photo's public sizes with a short public cache", async () => {
    const res = await get(published, "card");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/webp");
    expect(res.headers.get("cache-control")).toBe("public, max-age=300");
    expect((await res.arrayBuffer()).byteLength).toBeGreaterThan(100);
  });

  it.each([
    ["a draft photo to someone signed out", () => draft, "card"],
    ["the private full-size copy", () => published, "original"],
    ["a path-like size", () => published, "..%2Foriginal.jpg"],
    ["an unknown photo", () => "00000000-0000-0000-0000-000000000000", "thumb"],
    ["a malformed id", () => "../etc", "thumb"],
  ])("is not found for %s", async (_label, photo, size) => {
    expect((await get(photo(), size)).status).toBe(404);
  });
});
