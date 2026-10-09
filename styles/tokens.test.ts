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

const spacingProperty =
  /^(?:(?:padding|margin|inset)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?|gap|row-gap|column-gap|top|right|bottom|left)$/;

/** property/value pairs, anchored to the start of a declaration so that
 *  border-top is never read as top. */
function declarations(code: string): [string, string][] {
  return [...code.matchAll(/(?:^|[{;])\s*([a-z-]+)\s*:\s*([^;{}]+)/gm)].map((m) => [m[1] ?? "", (m[2] ?? "").trim()]);
}

function violations(source: string): string[] {
  const found: string[] = [];
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  for (const hex of code.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) found.push(`hex color ${hex}`);
  for (const [property, value] of declarations(code)) {
    if (property === "font-family" && !/^var\(--/.test(value)) found.push(`font-family ${value}`);
    if (property === "font" && !/var\(--/.test(value)) found.push(`font ${value}`);
    if (spacingProperty.test(property)) {
      for (const px of value.match(/\b\d+px\b/g) ?? []) {
        if (spacePx.has(px)) found.push(`${property} ${px} (use the --space token)`);
      }
    }
    if (property === "border-radius") {
      for (const px of value.match(/\b\d+px\b/g) ?? []) {
        if (radiusPx.has(px)) found.push(`border-radius ${px} (use the --radius token)`);
      }
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

  it("reads declarations, not substrings of property names", () => {
    expect(violations(".a{border-top:16px solid var(--ath-line);border-left-width:16px}")).toEqual([]);
    expect(violations(".a{margin-top:16px;inset-inline-start:8px}")).toEqual([
      "margin-top 16px (use the --space token)",
      "inset-inline-start 8px (use the --space token)",
    ]);
  });

  it("catches a literal family in the font shorthand", () => {
    expect(violations(".a{font:700 12px/1 Arial}")).toEqual(["font 700 12px/1 Arial"]);
    expect(violations(".a{font:700 12px/1 var(--ath-font-label)}")).toEqual([]);
  });

  it("ignores comments but not URLs", () => {
    expect(violations("// was #fff before\nconst a = 1;")).toEqual([]);
    // A URL's "//" isn't a comment, so the rest of the line is still checked.
    expect(violations('const u = "https://example.org"; const c = "#022c66";')).toEqual(["hex color #022c66"]);
  });
});
