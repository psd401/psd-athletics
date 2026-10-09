// Made-up images for tests: solid colors with camera metadata, including a
// location, so tests can prove the metadata never reaches stored files.
import sharp from "sharp";

export async function cameraJpeg({
  width = 3000,
  height = 2000,
  taken = "2026:10:06 18:42:10",
  offset,
  orientation,
}: { width?: number; height?: number; taken?: string | null; offset?: string; orientation?: number } = {}): Promise<Buffer> {
  const exif: Record<string, Record<string, string>> = {
    IFD0: { Make: "TestCam", Model: "Sideline 1" },
    IFD3: { GPSLatitudeRef: "N", GPSLatitude: "47/1 19/1 0/1", GPSLongitudeRef: "W", GPSLongitude: "122/1 34/1 0/1" },
  };
  if (taken) exif.IFD2 = { DateTimeOriginal: taken, ...(offset ? { OffsetTimeOriginal: offset } : {}) };
  const image = sharp({ create: { width, height, channels: 3, background: "#22558a" } }).jpeg({ quality: 70 }).withExif(exif);
  // sharp writes the orientation tag through withMetadata, not withExif.
  return (orientation ? image.withMetadata({ orientation }) : image).toBuffer();
}
