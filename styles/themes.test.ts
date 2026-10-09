// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { contrastRatio, parseCustomProperties, resolveToken } from "./css-tokens";

const css = readFileSync(join(__dirname, "themes.css"), "utf8");
const blocks = parseCustomProperties(css);
const root = blocks[":root"] ?? {};
const themes = ["hub", "ghh", "phs"] as const;
const tokensFor = (theme: string) => ({ ...root, ...blocks[`[data-school="${theme}"]`] });

// Text/background pairs the components use. 4.5:1 for body text, 3:1 for
// display type at 24px and up (WCAG 2.1 1.4.3).
const textPairs: [string, string, number][] = [
  ["--ath-ink", "--ath-paper", 4.5],
  ["--ath-ink", "--ath-surface", 4.5],
  ["--ath-ink", "--ath-tint", 4.5],
  ["--ath-muted", "--ath-paper", 4.5],
  ["--ath-muted", "--ath-surface", 4.5],
  ["--ath-muted", "--ath-tint", 4.5],
  ["--ath-link", "--ath-paper", 4.5],
  ["--ath-link", "--ath-surface", 4.5],
  ["--ath-brand", "--ath-surface", 4.5],
  ["--ath-brand", "--ath-tint", 4.5],
  ["--ath-on-ground", "--ath-ground", 4.5],
  ["--ath-on-ground-muted", "--ath-ground", 4.5],
  ["--ath-on-ground-subtle", "--ath-ground", 4.5],
  ["--ath-on-ground", "--ath-brand", 4.5],
  ["--ath-on-ground-muted", "--ath-brand", 4.5],
  ["--ath-on-ground", "--ath-brand-hover", 4.5],
  ["--ath-accent", "--ath-ground", 4.5],
  ["--ath-accent", "--ath-brand", 4.5],
  ["--ath-on-accent", "--ath-accent", 4.5],
  ["--ath-score-muted", "--ath-surface", 3],
];

const sharedPairs: [string, string, number][] = [
  ["--ath-white", "--ath-live", 4.5],
  ["--ath-tonight-ink", "--ath-tonight-bg", 4.5],
  ["--ath-neutral-ink", "--ath-neutral-bg", 4.5],
  ["--ghh-navy", "--ghh-tag", 4.5],
  ["--phs-green", "--phs-tag", 4.5],
  ["--ath-white", "--ghh-navy", 4.5],
  ["--ath-white", "--phs-green", 4.5],
  ["--ghh-columbia", "--ghh-navy", 4.5],
  ["--ghh-on-navy", "--ghh-navy", 4.5],
  ["--ghh-sky-light", "--ghh-navy", 4.5],
  ["--phs-tag", "--phs-green", 4.5],
  ["--phs-motif", "--phs-green", 4.5],
  ["--hub-on-night", "--hub-night", 4.5],
  ["--hub-on-night-text", "--hub-night", 4.5],
  ["--hub-on-night-label", "--hub-night", 4.5],
  ["--ath-white", "--hub-ink", 4.5],
];

describe("athletics themes", () => {
  it.each(themes)("%s defines every semantic token the hub defines", (theme) => {
    const hubNames = Object.keys(blocks['[data-school="hub"]'] ?? {}).sort();
    const names = Object.keys(blocks[`[data-school="${theme}"]`] ?? {}).sort();
    expect(hubNames.length).toBeGreaterThan(15);
    expect(names).toEqual(hubNames);
  });

  describe.each(themes)("%s contrast", (theme) => {
    const tokens = tokensFor(theme);
    it.each(textPairs)("%s on %s is at least %s:1", (fg, bg, min) => {
      const ratio = contrastRatio(resolveToken(fg, tokens), resolveToken(bg, tokens));
      expect(ratio).toBeGreaterThanOrEqual(min);
    });
  });

  it.each(sharedPairs)("shared %s on %s is at least %s:1", (fg, bg, min) => {
    expect(contrastRatio(resolveToken(fg, root), resolveToken(bg, root))).toBeGreaterThanOrEqual(min);
  });

  it("keeps the brand hexes from docs/BRAND.md", () => {
    expect(resolveToken("--ghh-navy", root)).toBe("#022c66");
    expect(resolveToken("--ghh-columbia", root)).toBe("#69abe0");
    expect(resolveToken("--phs-green", root)).toBe("#194746");
    expect(resolveToken("--phs-silver", root)).toBe("#a7a9ac");
    expect(resolveToken("--hub-night", root)).toBe("#0a111c");
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for a color on itself", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#022c66", "#022c66")).toBe(1);
  });

  it("rejects values that are not #rrggbb", () => {
    expect(() => contrastRatio("red", "#ffffff")).toThrow(/Expected #rrggbb/);
  });
});
