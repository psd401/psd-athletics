Nexus is the design system for a family of agent-assisted school-district work tools: rooms where a person and an AI agent build a schedule, a dashboard, a family letter or a decision together. It has one set of components across web, macOS and iOS (203 documented components and patterns, with 160 React components), and five themes. **Nexus** (cool: slate header, cyan flow, copper action) is for analysis and data work. **Commons** (warm: cream paper, forest action, sea-glass agent) is for communication and people work. **Nexus Dark** and **Commons Dark** are their night versions, and **High Contrast** (7:1 text, 3:1 borders) is used when the person asks for more contrast.

The brand book continues in the sections that follow: agent patterns, data visualization, the three platforms, accessibility, motion, and writing and localization. Read the agent patterns section before designing any new screen.

## Principles

1. **The person decides; the agent prepares.** Every screen makes clear what the agent did, what it did *not* change, and which choice is still the person's. Final actions (Apply, Send, Approve) stay with a human and get the single `action` button.
2. **Show the reasoning, not the machinery.** Pin the decisions that shape a result as context chips (`Audience: Principals · from Morgan's request`). Show work as plain steps (`Validated 7,842 attendance records`), not spinners alone.
3. **Careful claims.** Separate what the data supports from what it doesn't yet show: "Supported by this view" sits beside "Not yet established." Mark first-pass output `Provisional` until it is confirmed.
4. **Calm by default.** Content in the middle, conversation at the side, one accent at a time. Illustration is quiet, and it is never the content.

## Content fundamentals

- **Voice.** The agent speaks in first person and briefly: "I found 18 schedule fits. All four cores can reach 31, with electives preserved." It addresses the person as *you* and names other people by first name.
- **Say what didn't happen.** Close agent turns that touch real records with what stayed put: "Four conflicts need review. I have not changed the schedule."
- **Ask one question that changes the result.** When a definition matters, ask it as choice chips: "What should 'baseline' mean?" → `Trailing 8 weeks` · `Same month last year` · `Let me define it`.
- **Headlines are short and human.** Use two-beat promises in `headline` ("Move one thing. Keep every promise.") and plain questions or outcomes in `display-l`/`display-xl` ("What changed after the letter?"). Use sentence case everywhere except `eyebrow`.
- **Numbers are concrete and counted.** Write `18 fits · 0 elective conflicts · nothing changed`, `+3.9 points`, `85.9% → 89.8%`. Separate meta facts with a middle dot ( · ).
- **The trust footer is mandatory** on any screen that reads or drafts district data. It is one `caption` line stating scope: "Draft only · no student names shown · nothing shared".
- **Buttons are verbs with objects:** `Review 18 moves`, `Apply to shared schedule`, `Build a comparison`. Secondary actions are plainer: `See constraints`, `Not now`.
- **No emoji.** No exclamation points in agent text. No hype ("supercharge", "magic").

## Color

Use the semantic tokens; theme switching does the rest. Set `data-theme` on the root to `nexus`, `commons`, `dark`, `commons-dark` or `high-contrast`. Pick the family (Nexus or Commons) per product, and the scheme from the system: dark follows `prefers-color-scheme`, and high contrast follows `prefers-contrast: more` (or "Increase Contrast" on Apple platforms).

- **Interaction states.** `surface-hover` for hovered rows and items, `surface-selected` for the selected row or sidebar item (always with a 2px indicator, never the fill alone), `ink-disabled` only for disabled labels.
- **Inverse.** `surface-inverse` / `on-inverse` for toasts and tooltips only; `scrim` behind modals and sheets.

- **Grounds.** `surface-canvas` is the page, `surface-raised` holds cards and the chat rail, and `surface-sunken` is for wells (chat bubbles, inputs, loading regions). `surface-header` is the top bar, with `on-header` text.
- **Text.** Use `ink` for primary text, `ink-muted` for subtitles and timestamps, and `ink-subtle` for captions and axis labels. All three pass 4.5:1 on every surface in every theme.
- **One action.** `action` is the primary button fill (copper in Nexus, forest in Commons), with `on-action` text. Use it once per view, for the step that moves the work forward.
- **Flow means the agent and agreement.** `flow` is the agent's color: live dots, progress rings, ribbons for things that line up, focal chart series. `flow-soft` tints agent-owned regions; `flow-ink` is agent-colored text. `flow` itself is never text.
- **Attention means conflicts and pending decisions.** `attention` marks conflicts, watch-lanes and the "needs your decision" state; `attention-soft` and `attention-ink` are its fill and text. Flow and attention differ in hue (cyan/green vs. copper/ochre, which works for colorblind users too) and always come with a word or icon.
- **Status.** `success`, `warning`, `danger` and `info` each have `-soft` fills and `-ink` text. A status is never color alone: pair it with a word (`Connected`, `Waiting`) or icon.
- **Links** use `accent`, a deep sound-water blue.
- **People.** `person-1` to `person-4` fill collaborator avatars (with `ink` initials), assigned by a stable hash of the person's id. The agent is always `agent`.
- **Charts** use `chart-1` (focal, and the same as flow) through `chart-3`, then `chart-5` and `chart-6` only when unavoidable; `chart-4` for context such as the district average or prior period, and `chart-grid` for gridlines. Draw the district average as context, never as a target line. See the data visualization section.

## Type

The font files ship with the system in `web/fonts/` (Newsreader 400/500 with italics, Public Sans 400–700, IBM Plex Mono 400/500, Caveat 500; all SIL Open Font License, see `web/fonts/LICENSES.txt`), and the generated `tokens.css` declares them, so nothing depends on Google Fonts. On Apple platforms, bundle the same families and use the `iOS` and `macOS` style groups, which follow the system text-style sizes and scale with Dynamic Type.

- **Display (Newsreader):** `display-xl`, `display-l`, `headline`, `title`, `numeral` and `wordmark`. The serif gives each room its editorial voice. Keep it to titles, figures and the wordmark, never buttons or labels. `letter` sets the body of family- and staff-facing documents the agent drafts, so those read as written, not generated.
- **Interface (Public Sans):** `body-l` for chat, `body` as the default, `body-s` for dense meta, `label` for controls, `caption` for timestamps and the trust footer, and `eyebrow`, set uppercase with 0.16em tracking, for kickers and the corner motto.
- **Mono (IBM Plex Mono):** `code` for IDs, rules and formulas; `overline-num` for small tabular figures.
- **Platform ramps:** `ios-*` (largeTitle 34 … caption2 11) and `mac-*` (largeTitle 26 … footnote 10). Titles use Newsreader and text uses Public Sans on both.
- **Hand (Caveat):** `tagline`, at most one per screen, as a quiet signature ("Better days for more students.") or in an empty state. Never put data, instructions or button text in it.

## Layout

- **App frame:** a 56px `surface-header` bar (wordmark, room name, live status, district and year at the right), a content column, and a conversation rail. Nexus rooms put the chat rail on the **left** (~300px); Commons and builder views put it on the **right** (~400px).
- **Room anatomy, top to bottom:** title (`display-l`) with subtitle, a row of context chips, a status strip ("Connected 2 approved sources · Calculating baseline"), the work area, then a bottom bar with the trust footer on the left and the primary action on the right.
- **Spacing** uses the 4px scale: `space-6` card padding, `space-6` gaps between cards, `space-10` page padding. Cards use `radius-lg`; buttons and chips use `radius-md`; badges and avatars use `radius-pill`.
- **Borders before shadows.** Cards are `surface-raised` with a 1px `line` border and `shadow-card`. Save `shadow-pop` for floating elements and `shadow-overlay` for modals.
- **Phone width:** collapse the rail into a bottom sheet and keep a 16px (`space-4`) gutter.
- **Breakpoints:** `bp-sm` 600 (phone), `bp-md` 900 (rail collapses to icons), `bp-lg` 1200 (full room), `bp-xl` 1600 (content caps at `content-max`). Sizes for chrome (header, rail, panel, sidebar, toolbar, tab bar, rows, hit targets) are in the `size` tokens.
- **Layers:** `z-*` tokens, from `z-raised` (presence tags) through `z-modal` and `z-toast` to `z-tooltip`.

## States and motion

- **Live work** shows a `flow` ring spinning slowly (1.2s per turn), plus a step list with done, active and pending states.
- **Provisional** content uses the `info` badge `Provisional` and may shimmer in `surface-sunken` skeletons. It never shimmers once real data is in.
- **Always interruptible.** While the agent works, show `Stop` and `Redirect` (or `Pause` and `Let me adjust`). After an action, offer `Undo` for a stated window ("Undo for 30 min").
- **Motion** is a flowing system: the agent's work glows and streams, data flows along ribbons, and results converge and settle. See the motion section for the choreography and every token. Reduced motion stops all of it, leaving finished content.
- **Focus** is a 2px solid `focus` ring at 2px offset (`focus-on-header` inside the header). It passes 3:1 on every surface.

## Illustration and imagery

The restrained setting: one muted landscape motif (shoreline, firs, a schoolhouse) in washed-out `chart-4`, `flow-soft` and `line` tones. Use it only in the left rail's lower corner, empty states, and the header of a "whole story" view, at no more than 15% visual weight. Flow ribbons are the one data-adjacent flourish: draw them in `flow` and `attention` only where they encode real paths (students moving between sections, measures that agree or diverge). No stock photos of people in working views; no AI-generated faces.

## Iconography

Use **Lucide** line icons on web (the `Icon` component carries the set used here) and **SF Symbols** at regular weight on Apple platforms, at a 1.75px stroke, `icon-sm` (16px) inline and `icon-md` (20px) in buttons, in `ink-muted` or the semantic ink of their context. The mockups use a line style like this, but no icon source came with them, so this is a recommendation to confirm. The agent avatar is an `agent` disc with a three-dot cluster glyph, not a face. There is no product mark yet: set the name in `wordmark` type, and don't draw a logo.

## District marks

The district's logo stays out of the working interface. The `District` asset group holds official lockups for exported documents only, such as a drafted letter's footer or a printed report. Never redraw, recolor or AI-generate them. The horizontal lockup must be at least 300px wide; below that, use the emblem.

## Using the system

- **Web, plain HTML:** load the generated `tokens.css`, then `web/bundle.css`, and use the `nx-` classes exactly as each component's preview shows them.
- **Web, React 18:** also load `web/bundle.js`, which defines `window.Nexus`. Components: `Nexus.Button`, `Nexus.DecisionCard`, `Nexus.DotPlot` and so on. Types are in `web/index.d.ts`. Wrap the app in `Nexus.ThemeProvider theme="nexus"`.
- **Tailwind:** use `web/tailwind.preset.js`. Its colors resolve through the same CSS variables, so themes still switch with `data-theme`.
- **iOS and macOS (SwiftUI):** use `apple/NexusKit`. Apply `.nexusTheme(family: .commons)` at the root and read colors with `@Environment(\.nexus)`. The iOS and macOS component pages show the native building blocks to use for each pattern.
- **Design tools:** `tokens/nexus.tokens.json` is the standard DTCG export for Style Dictionary, Tokens Studio or Figma variables.
