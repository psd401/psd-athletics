# Nexus (vendored copy)

A read-only copy of the Nexus web package, for Athletics Studio.

- **Source:** `psd401/psd-dev-standards`, `design-system/nexus/web/` and `design-system/nexus/guidelines/`, at commit `4f0358a` (2026-10-07).
- **Don't edit these files.** Nexus changes are made in the design system artifact and exported to `psd-dev-standards` (standards/10, rule 6). To update, copy the new `web/` files from there in one PR and change the commit above.
- If a packaged version of Nexus becomes available, switch to it and delete this folder.

| File | What it is |
|---|---|
| `tokens.css` | CSS variables for all five themes (`data-theme`: `nexus`, `commons`, `dark`, `commons-dark`, `high-contrast`) and `@font-face` rules for `fonts/` |
| `bundle.css` | `nx-` component classes |
| `bundle.js` | React 18 components on `window.Nexus` |
| `index.d.ts` | Component props |
| `tailwind.preset.js` | Tailwind preset mapped to the variables |
| `NEXUS-README.md` | The design system's own guide |
| `guidelines/` | Agent patterns, web platform, accessibility, motion, writing |

Load order (from `NEXUS-README.md`): `tokens.css`, `bundle.css`, React, `bundle.js`. The bundle targets React 18 and the app uses React 19, so check compatibility before relying on it (see `docs/QUESTIONS.md`).
