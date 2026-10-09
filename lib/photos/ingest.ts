// Photo ingest (SPEC §7): read the capture time, then re-encode every size
// without metadata, so no camera details or location data are stored
// anywhere, not even in the private copy (DECISIONS 86).

import exifReader from "exif-reader";
import sharp, { type Metadata } from "sharp";

import { pacificInstant } from "../schedule/time";
import { ValidationError } from "../studio/errors";

export type VariantName = "thumb" | "card" | "full" | "original";

export interface Variant {
  name: VariantName;
  data: Buffer;
  width: number;
  height: number;
  contentType: "image/webp" | "image/jpeg";
}

export interface ProcessedPhoto {
  takenAt: Date | null;
  width: number;
  height: number;
  variants: Variant[];
}

/** Widths for public sizes; never enlarged. */
const SIZES: [Exclude<VariantName, "original">, number][] = [
  ["thumb", 480],
  ["card", 1200],
  ["full", 2400],
];

const READABLE = new Set(["jpeg", "png", "webp", "heif", "avif"]);
/** Refuse decompression bombs: 50 megapixels covers every phone and DSLR. */
const MAX_PIXELS = 50_000_000;

const unreadable = () => new ValidationError("That file isn't a photo we can read. Use JPEG, PNG, WebP or HEIC.");

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * EXIF capture times are wall-clock times with no zone. Use the camera's
 * recorded offset when there is one; otherwise assume Pacific, where the games are.
 */
function captureTime(exif: Buffer | undefined): Date | null {
  if (!exif) return null;
  let tags: ReturnType<typeof exifReader>;
  try {
    tags = exifReader(exif);
  } catch {
    return null;
  }
  const wall = tags.Photo?.DateTimeOriginal ?? tags.Photo?.DateTimeDigitized;
  if (!(wall instanceof Date) || Number.isNaN(wall.getTime())) return null;
  const date = `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}`;
  const time = `${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}:${pad(wall.getUTCSeconds())}`;
  const offset = tags.Photo?.OffsetTimeOriginal;
  if (typeof offset === "string" && /^[+-]\d{2}:\d{2}$/.test(offset)) {
    const instant = new Date(`${date}T${time}${offset}`);
    if (!Number.isNaN(instant.getTime())) return instant;
  }
  return pacificInstant(date, time);
}

export async function processPhoto(input: Buffer): Promise<ProcessedPhoto> {
  let meta: Metadata;
  try {
    meta = await sharp(input, { limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    throw unreadable();
  }
  if (!meta.format || !READABLE.has(meta.format) || !meta.width || !meta.height) throw unreadable();
  const takenAt = captureTime(meta.exif);

  // rotate() applies the EXIF orientation; sharp drops all metadata on output by default.
  const upright = () => sharp(input, { limitInputPixels: MAX_PIXELS }).rotate();
  const variants: Variant[] = [];
  try {
    for (const [name, width] of SIZES) {
      const { data, info } = await upright().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
      variants.push({ name, data, width: info.width, height: info.height, contentType: "image/webp" });
    }
    const { data, info } = await upright().jpeg({ quality: 90, mozjpeg: true }).toBuffer({ resolveWithObject: true });
    variants.push({ name: "original", data, width: info.width, height: info.height, contentType: "image/jpeg" });
  } catch {
    throw unreadable();
  }
  const original = variants.at(-1)!;
  return { takenAt, width: original.width, height: original.height, variants };
}
