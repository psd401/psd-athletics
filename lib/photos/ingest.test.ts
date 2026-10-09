// @vitest-environment node
import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { ValidationError } from "../studio/errors";
import { processPhoto } from "./ingest";
import { cameraJpeg } from "./test-images";

describe("processPhoto", () => {
  it("reads the capture time as Pacific time, then strips every bit of metadata", async () => {
    const original = await cameraJpeg();
    expect((await sharp(original).metadata()).exif).toBeDefined();

    const out = await processPhoto(original);
    expect(out.takenAt?.toISOString()).toBe("2026-10-07T01:42:10.000Z"); // 6:42:10 pm PDT
    expect(out.variants.map((v) => [v.name, v.width, v.height, v.contentType])).toEqual([
      ["thumb", 480, 320, "image/webp"],
      ["card", 1200, 800, "image/webp"],
      ["full", 2400, 1600, "image/webp"],
      ["original", 3000, 2000, "image/jpeg"],
    ]);
    for (const v of out.variants) {
      const meta = await sharp(v.data).metadata();
      expect(meta.exif, v.name).toBeUndefined();
      expect(meta.xmp, v.name).toBeUndefined();
      expect(meta.iptc, v.name).toBeUndefined();
    }
    expect([out.width, out.height]).toEqual([3000, 2000]);
  });

  it("uses the camera's own offset when it records one", async () => {
    const out = await processPhoto(await cameraJpeg({ offset: "-05:00" }));
    expect(out.takenAt?.toISOString()).toBe("2026-10-06T23:42:10.000Z");
  });

  it("has no capture time when the camera didn't record one", async () => {
    expect((await processPhoto(await cameraJpeg({ taken: null }))).takenAt).toBeNull();
  });

  it("turns sideways phone photos upright before sizing", async () => {
    const out = await processPhoto(await cameraJpeg({ width: 1600, height: 1200, orientation: 6 }));
    expect([out.width, out.height]).toEqual([1200, 1600]);
    expect(out.variants.find((v) => v.name === "thumb")).toMatchObject({ width: 480, height: 640 });
  });

  it("never enlarges small photos", async () => {
    const out = await processPhoto(await cameraJpeg({ width: 800, height: 600 }));
    expect(out.variants.map((v) => v.width)).toEqual([480, 800, 800, 800]);
  });

  it("refuses files that aren't photos", async () => {
    await expect(processPhoto(Buffer.from("not an image"))).rejects.toThrow(new ValidationError("That file isn't a photo we can read. Use JPEG, PNG, WebP or HEIC."));
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>');
    await expect(processPhoto(svg)).rejects.toThrow(ValidationError);
  });
});
