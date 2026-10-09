// @vitest-environment node
import { DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";
import { describe, expect, it } from "vitest";

import { s3PhotoStorage } from "./s3-storage";

/** A stand-in S3 client: records commands and keeps objects in a map. */
function fakeS3() {
  const objects = new Map<string, Buffer>();
  const sent: { name: string; input: Record<string, unknown> }[] = [];
  return {
    objects,
    sent,
    async send(command: { constructor: { name: string }; input: Record<string, unknown> }) {
      sent.push({ name: command.constructor.name, input: command.input });
      const input = command.input as { Key?: string; Body?: Buffer; Prefix?: string; Delete?: { Objects: { Key: string }[] } };
      if (command instanceof PutObjectCommand) objects.set(input.Key!, input.Body!);
      if (command instanceof GetObjectCommand) {
        const body = objects.get(input.Key!);
        if (!body) throw Object.assign(new Error("NoSuchKey"), { name: "NoSuchKey" });
        return { Body: { transformToByteArray: async () => new Uint8Array(body) } };
      }
      if (command instanceof ListObjectsV2Command) return { Contents: [...objects.keys()].filter((k) => k.startsWith(input.Prefix!)).map((Key) => ({ Key })) };
      if (command instanceof DeleteObjectsCommand) for (const o of input.Delete!.Objects) objects.delete(o.Key);
      return {};
    },
  };
}

describe("s3PhotoStorage", () => {
  it("stores, reads and deletes a photo's files in the bucket", async () => {
    const s3 = fakeS3();
    const store = s3PhotoStorage("photos-bucket", s3 as never);
    await store.put("p/abc/thumb.webp", Buffer.from("x"));
    expect(s3.sent[0]).toMatchObject({ name: "PutObjectCommand", input: { Bucket: "photos-bucket", Key: "p/abc/thumb.webp", ContentType: "image/webp" } });
    expect((await store.get("p/abc/thumb.webp"))?.toString()).toBe("x");
    expect(await store.get("p/abc/missing.webp")).toBeNull();
    await store.deletePrefix("p/abc/");
    expect(s3.objects.size).toBe(0);
  });

  it("refuses keys that aren't short relative paths", async () => {
    const store = s3PhotoStorage("photos-bucket", fakeS3() as never);
    await expect(store.put("../x", Buffer.from("x"))).rejects.toThrow("Bad storage key");
  });
});
