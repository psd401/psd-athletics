# Brand and visual system

Two layers:
- **Public sites** use a shared athletics system with a per-school theme. It is not Nexus.
- **Athletics Studio** (the CMS) uses the **Nexus** design system, Nexus theme by default.

PSD standards (standards/10) say Tier A/B apps with a UI take color, type, spacing, radii and motion from Nexus and never hard-code values a token covers. How this repo applies that:
- **Studio:** Nexus as-is, from `vendor/nexus/tokens.css`. It must work in all five Nexus themes.
- **Public sites:** school brands are an athletics theme layered on Nexus. Spacing, radii, motion, breakpoints and z-index come from Nexus tokens; school colors and the athletics type below are defined once as theme tokens (CSS variables), never as raw values in components. This needs Technology Services' sign-off (`docs/QUESTIONS.md`).

## Public sites

### Type (Google Fonts)
| Role | Family | Weights | Use |
|---|---|---|---|
| Display | Big Shoulders Display | 700, 800, 900 | Headlines, school names, scores, numerals. Uppercase, tight line height (0.86). |
| Text | Barlow | 400, 500, 600, 700 | Body, buttons, navigation |
| Labels | Barlow Condensed | 500, 600, 700 | Eyebrows, tags, dates, tabular figures. Uppercase, tracked 0.08–0.16em |

### Gig Harbor Tides
| Token | Hex | Use |
|---|---|---|
| abyss | `#011430` | Darkest ground, hero, footer |
| navy | `#022C66` | Primary brand, header, buttons |
| deep | `#01204D` | Alternate dark tiles |
| columbia | `#69ABE0` | Accent on dark (sampled from the official GH logo) |
| foam | `#EAF3FC` | Light tint |
| paper | `#F2F6FB` | Page background |
| ink | `#0B1A33` | Text on light |
| muted | `#4C5D77` | Secondary text on light |
| line | `#D4DFEC` | Borders |

Motif: horizontal **wave contour lines** in Columbia blue at 15–25% opacity; slow drift (stops under reduced motion). Giant outlined "Roll Tides" type as texture.

Logo: `design/assets/logos/ghhs-gh-logo.png` (official interlocking GH, transparent). Works on navy and white.

### Peninsula Seahawks
| Token | Hex | Use |
|---|---|---|
| forest | `#0D2726` | Darkest ground, hero, footer |
| green | `#194746` | Primary brand (sampled from the official P logo) |
| deep | `#123836` | Hover, alternate tiles |
| silver | `#A7A9AC` | Logo outline; `#B9BCC0` for accents on dark |
| wash | `#E5EDEC` | Light tint |
| paper | `#F2F5F5` | Page background |
| ink | `#0E1E1D` | Text on light |
| muted | `#45585A` | Secondary text on light |
| line | `#D4DDDC` | Borders |

Motif: **chevron / wing slashes** in light silver-green at 20% opacity.

Logo: `design/assets/logos/phs-p-logo.png` (official block P, transparent). The P's green fill disappears on green backgrounds; place it on a white tile there.

> MaxPreps lists Peninsula as bright green `#00824B`. The official logo is `#194746` with silver. Use the logo colors.

### District hub
Night `#0A111C`, ink `#0F1A28`, paper `#F3F5F8`, muted `#556273`, line `#DCE2EA`, live red `#E5383B`. Uses both school palettes side by side. Header mark: `design/assets/logos/psd-emblem-white.png` (from the Nexus District asset group; never redraw or recolor).

### Photos
Real photos from the school sites are in `design/assets/photos/` (see `design/assets/photos/CREDITS.md`). Use them as dark-tinted heroes (luminosity blend or 20–35% opacity over the school's darkest color) or as plain card images. Never put text directly on an untinted photo.

### Shared rules
- Status is never color alone: always a word (Live, Tonight, Final, Updated, Home, Away).
- Buttons are verbs: "Buy tickets", "Watch on NFHS", "Directions", "Add to calendar".
- No emoji. Icons are inline stroke SVG (2px).
- Cards: 14–24px radius, 1px border, lift 2–3px on hover.

## Athletics Studio — Nexus

- Files in `vendor/nexus/` (a read-only copy from `psd-dev-standards`): `tokens.css` (variables for all five themes, plus fonts), `bundle.css` (`nx-` classes), `bundle.js` (`window.Nexus` React 18 components), `index.d.ts` (props), `tailwind.preset.js`, `NEXUS-README.md` (the system's own guide; read it) and `guidelines/`.
- `design/nexus-theme.css` is only for the design comps. The app uses `vendor/nexus/tokens.css`.
- Logos come only from official files. They're never redrawn, recolored or AI-generated. The GH and P logos in `design/assets/logos/` were cut from the school websites; replace them with the official source files when the schools provide them.
- Follow Nexus content rules: one primary action per view, trust footer on every screen, agent speaks in first person and says what it did not change, context chips under the title, undo with a stated window.
