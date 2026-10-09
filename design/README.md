# Design source

These are the approved design comps, exported from the design canvas:
https://claude.ai/artifact/Uuc9DFFqqM3S8rYXWWMpRR (live, clickable version; ask the owner to share it with you).

## How to read a `.dc.html` file

Each file is one screen. They are **references, not production code**.

- Markup sits inside `<x-dc>…</x-dc>`. Page-level CSS is in the `<helmet><style>` block.
- `{{name}}` holes are filled from the `renderVals()` method of the `class Component extends DCLogic` script at the bottom. That script holds the sample data (games, teams, filters) and the interactions (filters, tabs, countdowns, lightbox).
- `<sc-for list="{{items}}" as="item">` repeats; `<sc-if value="{{flag}}">` shows conditionally.
- `<x-import component-from-global-scope="Nexus.Button" variant="primary">` (Studio screens only) mounts a real component from the Nexus React bundle; attributes are props, kebab-case → camelCase (`icon-end` → `iconEnd`). Props named in `{{…}}` come from `renderVals()`.
- `<script src="./support.js">` is the canvas runtime. It is not included and not needed: read the files, don't try to run them.
- Images point at `assets/…` (this folder). Studio screens load Nexus from `../vendor/nexus/`.
- `canvas.json` lists every screen with its title and canvas position.

## Screens

| File | Screen |
|---|---|
| `Main.dc.html` | District hub, `athletics.psd401.net` |
| `GHHS-Home.dc.html` | Gig Harbor home |
| `GHHS-Football.dc.html` | Team page template (football) |
| `GHHS-GameDay-Mobile.dc.html` | Game-day page on a phone |
| `GHHS-Photos.dc.html` | School photo hub with lightbox |
| `PHS-Home.dc.html` | Peninsula home |
| `PHS-Schedule.dc.html` | Master schedule (list, month, subscribe) |
| `PHS-Mobile.dc.html` | School home on a phone |
| `PHS-Feed-Mobile.dc.html` | Team feed on a phone |
| `PHS-Staff.dc.html` | Coaches and staff directory |
| `CMS-Today.dc.html` | Studio: coach's day |
| `CMS-Story-Editor.dc.html` | Studio: recap with the agent |
| `CMS-Photo-Upload.dc.html` | Studio: coach adds a game album |
| `CMS-Sideline-Mobile.dc.html` | Studio: posting from the sideline |
| `CMS-Media-Review.dc.html` | Studio: AD media oversight |
| `CMS-Schedule-Sync.dc.html` | Studio: Arbiter sync review |
| `CMS-People-Roles.dc.html` | Studio: people, roles, onboarding |
| `CMS-Agents.dc.html` | Studio: AI agents and MCP access |

## What is real and what is a placeholder

- **Real** (as of Oct 8, 2026): schedules, scores, records, Fish Bowl result, school facts, state titles, Peninsula athletics office contacts, logos, photos. Seed data: `fixtures/fall-2026-snapshot.json`.
- **Placeholder** (shown in `[brackets]`): coach names and bios, Gig Harbor AD, sponsor logos, gate/parking details, booster club, photographer credits, build and hosting estimates.
- **Illustrative**: Studio counts (photos uploaded, albums this week), the two Arbiter schedule changes on the sync screen, the family report, and agent activity entries. They show how the screens behave, not real events.
