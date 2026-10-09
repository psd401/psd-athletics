// Where photo files live. A local folder until S3 exists (DECISIONS 87);
// the app only talks to this interface, so S3 slots in later.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";

export interface PhotoStorage {
  put(key: string, data: Buffer): Promise<void>;
  get(key: string): Promise<Buffer | null>;
  /** Remove every file whose key starts with the prefix (one photo's sizes). */
  deletePrefix(prefix: string): Promise<void>;
}

/** Keys are short relative paths like "p/<uuid>/thumb.webp". Nothing else. */
function checkKey(key: string): string {
  if (!/^[a-z0-9][a-z0-9._-]*(\/[a-z0-9][a-z0-9._-]*)*\/?$/i.test(key) || key.split("/").includes("..")) {
    throw new Error(`Bad storage key: ${JSON.stringify(key)}`);
  }
  return key;
}

export function memoryPhotoStorage(): PhotoStorage {
  const files = new Map<string, Buffer>();
  return {
    async put(key, data) {
      files.set(checkKey(key), Buffer.from(data));
    },
    async get(key) {
      return files.get(checkKey(key)) ?? null;
    },
    async deletePrefix(prefix) {
      checkKey(prefix);
      for (const k of [...files.keys()]) if (k.startsWith(prefix)) files.delete(k);
    },
  };
}

export function localPhotoStorage(root: string): PhotoStorage {
  const base = resolve(root);
  const path = (key: string) => {
    const full = resolve(base, checkKey(key));
    if (full !== base && !full.startsWith(base + sep)) throw new Error(`Bad storage key: ${JSON.stringify(key)}`);
    return full;
  };
  return {
    async put(key, data) {
      const file = path(key);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, data);
    },
    async get(key) {
      try {
        return await readFile(path(key));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw error;
      }
    },
    async deletePrefix(prefix) {
      // Prefixes are a photo's folder ("p/<id>/").
      await rm(path(prefix.replace(/\/$/, "")), { recursive: true, force: true });
    },
  };
}

const globalForStorage = globalThis as typeof globalThis & { __photoStorage?: PhotoStorage };

/** The app's photo storage: PHOTO_STORAGE_DIR, or .data/photos in the project (git-ignored). */
export function photoStorage(): PhotoStorage {
  globalForStorage.__photoStorage ??= localPhotoStorage(process.env.PHOTO_STORAGE_DIR ?? join(process.cwd(), ".data", "photos"));
  return globalForStorage.__photoStorage;
}
