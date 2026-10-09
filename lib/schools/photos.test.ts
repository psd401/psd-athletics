// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { backgroundAlt, photoDescriptions } from "./photos";

const repo = join(__dirname, "..", "..");

function filesUnder(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) filesUnder(path, out);
    else if (name.endsWith(".tsx")) out.push(path);
  }
  return out;
}

describe("photo descriptions", () => {
  it("cover every photo in public/images", () => {
    const photos = readdirSync(join(repo, "public/images")).map((f) => `/images/${f}`).sort();
    expect(Object.keys(photoDescriptions).sort()).toEqual(photos);
  });

  it("say when a photo is a darkened background", () => {
    expect(backgroundAlt("/images/phs-osprey.jpg")).toBe(
      "Darkened background photo: an osprey in flight over the Peninsula ballfield light tower",
    );
    expect(() => backgroundAlt("/images/unknown.jpg")).toThrow(/No description/);
  });

  it("are never left empty on a photo in the components", () => {
    const offenders = [...filesUnder(join(repo, "app")), ...filesUnder(join(repo, "components"))].filter((file) =>
      /src=["{][^>]*\/images\/[^>]*alt=""|alt=""[^>]*src=["{][^>]*\/images\//.test(readFileSync(file, "utf8").replace(/\n\s*/g, " ")),
    );
    expect(offenders).toEqual([]);
  });
});
