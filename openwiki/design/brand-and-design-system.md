---
type: Design System
title: Brand, school themes and the Nexus design system
description: Two-layer visual system for PSD Athletics (school-themed public sites with theme tokens, Nexus for the Studio), school palettes and type, shared UI rules, and how to read the design comps.
tags: [design, brand, tokens, nexus, themes]
openwiki:
  roles: [domain, repository]
  change_kinds: [ui, theming, tokens]
  source_paths: [docs/BRAND.md, design/README.md, design/canvas.json, design/nexus-theme.css]
  invariants: [No hex colours, font families or px spacing in components when a token covers it., vendor/nexus is read-only., Status is never colour alone., Logos come only from official files and are never redrawn or recoloured.]
---

# Brand and design system

**Consult this page** before writing any UI. Source: `docs/BRAND.md`, `design/README.md`. Planned route set is in [surfaces and routes](../product/surfaces-and-routes.md).

## Two layers

- **Public sites**: shared athletics system with a per-school theme; not Nexus. Spacing, radii, motion, breakpoints and z-index come from Nexus tokens; school colours and athletics type are defined once as theme tokens (CSS variables). This reading of PSD standards/10 awaits Technology Services' sign-off (question #13).
- **Studio**: Nexus as-is from `vendor/nexus/tokens.css`, default Nexus theme, must work in all five Nexus themes. `vendor/nexus/` is a read-only copy from `psd-dev-standards` (DECISIONS #6), never edited, owned by CODEOWNERS, and excluded from lint and from this wiki. Its bundle targets React 18 while the app is on React 19 (question #15). Read `vendor/nexus/NEXUS-README.md` and `index.d.ts` before Studio UI. `design/nexus-theme.css` is for comps only.

## Public palettes and type

| Theme | Dark/primary | Accent | Light/page | Motif |
|---|---|---|---|---|
| Gig Harbor Tides | abyss `#011430`, navy `#022C66`, deep `#01204D` | columbia `#69ABE0` | foam `#EAF3FC`, paper `#F2F6FB` | Wave contour lines (15–25% opacity), slow drift stops under reduced motion |
| Peninsula Seahawks | forest `#0D2726`, green `#194746`, deep `#123836` | silver `#A7A9AC` / `#B9BCC0` on dark | wash `#E5EDEC`, paper `#F2F5F5` | Chevron/wing slashes (20% opacity) |
| District hub | night `#0A111C`, ink `#0F1A28` | live red `#E5383B` | paper `#F3F5F8` | Both school palettes side by side |

Peninsula uses its logo colours, not MaxPreps' `#00824B`. Remaining tokens (ink, muted, line) are in `docs/BRAND.md`; encode them as theme tokens, not literals.

Type (Google Fonts): Display = Big Shoulders Display 700–900 (uppercase, line height 0.86); Text = Barlow 400–700; Labels = Barlow Condensed 500–700 (uppercase, tracked 0.08–0.16em).

## Shared rules

Status always a word (Live, Tonight, Final, Updated, Home, Away); buttons are verbs ("Buy tickets", "Watch on NFHS"); no emoji; inline 2px stroke SVG icons; cards 14–24px radius, 1px border, 2–3px hover lift; never text on an untinted photo (tint 20–35% over darkest school colour). Studio: one primary action per view, trust footer on every screen, context chips under title, undo with stated window ([agents](../integrations/mcp-server-and-agents.md)). Accessibility floor is in [privacy and accessibility](../domain/roles-permissions-privacy.md#accessibility-and-performance).

Logos: `design/assets/logos/ghhs-gh-logo.png`, `phs-p-logo.png` (P needs a white tile on green), `psd-emblem-white.png` (never recolour). Current GH/P files were cut from school sites; official sources are requested (question #14).

## Reading the design comps

`design/*.dc.html` are references, not production code (and are excluded from this wiki). Markup in `<x-dc>`, `{{holes}}` filled by `renderVals()`, `<sc-for>`/`<sc-if>` for loops and conditionals, `<x-import component-from-global-scope="Nexus.Button">` mounts Nexus components in Studio screens. `canvas.json` lists the 18 screens with canvas positions. Real data (as of Oct 8, 2026): schedules, scores, records, school facts, logos, photos. Placeholders in `[brackets]`: coach names/bios, GH AD, sponsors, gate/parking, booster club. Illustrative only: Studio counts, sample schedule changes, family report, agent activity.

Build each pattern once as a themed shared template; match designs closely including at 390px.
