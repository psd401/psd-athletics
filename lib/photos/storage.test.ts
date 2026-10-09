// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import { localPhotoStorage, memoryPhotoStorage, type PhotoStorage } from "./storage";

const dirs: string[] = [];
afterAll(async () => Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true }))));

describe.each<[string, () => Promise<PhotoStorage>]>([
  ["memory", async () => memoryPhotoStorage()],
  [
    "local folder",
    async () => {
      const dir = await mkdtemp(join(tmpdir(), "photos-"));
      dirs.push(dir);
      return localPhotoStorage(dir);
    },
  ],
])("%s photo storage", (_name, make) => {
  it("stores, reads and deletes by key", async () => {
    const store = await make();
    await store.put("p/abc/thumb.webp", Buffer.from("x"));
    expect((await store.get("p/abc/thumb.webp"))?.toString()).toBe("x");
    await store.deletePrefix("p/abc/");
    expect(await store.get("p/abc/thumb.webp")).toBeNull();
    expect(await store.get("p/missing.webp")).toBeNull();
  });

  it("refuses keys that could leave its folder", async () => {
    const store = await make();
    for (const key of ["../x", "p/../../x", "/etc/passwd", "p\\x", ""]) {
      await expect(store.put(key, Buffer.from("x")), key).rejects.toThrow("Bad storage key");
    }
  });
});
