// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

import { parseCustomProperties } from "./css-tokens";

// CLAUDE.md: no hex colors, font families or px spacing in components when a
// token covers it. Raw values belong in styles/themes.css only.

const repo = join(__dirname, "..");
const scanned = ["app", "components"];

function filesUnder(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) filesUnder(path, out);
    else if (/\.(css|tsx)$/.test(name) && !/\.test\.tsx$/.test(name)) out.push(path);
  }
  return out;
}

const files = scanned.flatMap((d) => filesUnder(join(repo, d)));

const nexus = parseCustomProperties(readFileSync(join(repo, "vendor/nexus/tokens.css"), "utf8"));
// Spacing and radii are theme-independent, so any block that declares them counts.
const nexusRoot: Record<string, string> = Object.assign({}, ...Object.values(nexus));
const tokenPx = (prefix: string) =>
  new Set(
    Object.entries(nexusRoot)
      .filter(([name, value]) => name.startsWith(prefix) && /^\d+px$/.test(value))
      .map(([, value]) => value),
  );
const spacePx = tokenPx("--space-");
const radiusPx = tokenPx("--radius-");

function violations(source: string): string[] {
  const found: string[] = [];
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const hex of code.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) found.push(`hex color ${hex}`);
  for (const m of code.matchAll(/font-family\s*:\s*([^;}]+)/g)) {
    if (!/^var\(--/.test((m[1] ?? "").trim())) found.push(`font-family ${m[1]}`);
  }
  for (const m of code.matchAll(/\b(padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left)[\w-]*\s*:\s*([^;}]+)/g)) {
    for (const px of (m[2] ?? "").match(/\b\d+px\b/g) ?? []) {
      if (spacePx.has(px)) found.push(`${m[1]} ${px} (use the --space token)`);
    }
  }
  for (const m of code.matchAll(/border-radius\s*:\s*([^;}]+)/g)) {
    for (const px of (m[1] ?? "").match(/\b\d+px\b/g) ?? []) {
      if (radiusPx.has(px)) found.push(`border-radius ${px} (use the --radius token)`);
    }
  }
  return found;
}

describe("component styles use tokens", () => {
  it("reads the Nexus spacing and radius scales", () => {
    expect(spacePx).toContain("16px");
    expect(radiusPx).toContain("10px");
  });

  it.each(files.map((f) => [relative(repo, f), f]))("%s has no raw values a token covers", (_name, path) => {
    expect(violations(readFileSync(path, "utf8"))).toEqual([]);
  });

  it("flags hex colors, literal font families and token-covered px values", () => {
    expect(violations(".a{color:#022C66;font-family:Barlow;padding:16px 28px;border-radius:10px}")).toEqual([
      "hex color #022C66",
      "font-family Barlow",
      "padding 16px (use the --space token)",
      "border-radius 10px (use the --radius token)",
    ]);
    expect(violations(".a{color:var(--ath-ink);font-family:var(--ath-font-text);padding:28px}")).toEqual([]);
  });
});
