// Helpers for the token tests: read CSS custom properties per selector,
// resolve var() chains, and compute WCAG 2.1 contrast ratios.

export type TokenMap = Record<string, string>;

/** Custom properties declared in each top-level rule, keyed by selector. */
export function parseCustomProperties(css: string): Record<string, TokenMap> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blocks: Record<string, TokenMap> = {};
  const rule = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of withoutComments.matchAll(rule)) {
    const selector = (match[1] ?? "").trim();
    const body = match[2] ?? "";
    const tokens: TokenMap = blocks[selector] ?? {};
    for (const decl of body.split(";")) {
      const m = /^\s*(--[\w-]+)\s*:\s*(.+?)\s*$/.exec(decl);
      if (m?.[1] && m[2]) tokens[m[1]] = m[2];
    }
    blocks[selector] = tokens;
  }
  return blocks;
}

/** Resolve a token to its final value, following var(--x) references. */
export function resolveToken(name: string, tokens: TokenMap, depth = 0): string {
  if (depth > 10) throw new Error(`Token cycle at ${name}`);
  const value = tokens[name];
  if (value === undefined) throw new Error(`Token ${name} is not defined`);
  const ref = /^var\((--[\w-]+)\)$/.exec(value);
  return ref?.[1] ? resolveToken(ref[1], tokens, depth + 1) : value;
}

function channel(hex: string, i: number): number {
  const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) throw new Error(`Expected #rrggbb, got ${hex}`);
  return 0.2126 * channel(hex, 0) + 0.7152 * channel(hex, 1) + 0.0722 * channel(hex, 2);
}

export function contrastRatio(foreground: string, background: string): number {
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
