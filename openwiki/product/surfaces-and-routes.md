---
type: Product Spec
title: Surfaces, routes and public site requirements
description: The four PSD Athletics surfaces (district hub, GHHS, PHS, Athletics Studio), the planned route for each approved screen, and the cross-cutting public-site requirements (schedule states, ticker, countdowns, follow-a-team, staff directory, EN/ES).
tags: [product, routes, public-site, studio]
openwiki:
  roles: [domain]
  change_kinds: [routing, ui, public-site]
  source_paths: [docs/SPEC.md, design/README.md, design/canvas.json]
  invariants: [Every public page pattern exists for both schools as a shared template with a school theme., Coach email addresses are never shown publicly., Status is conveyed by a word, never colour alone.]
---

# Surfaces, routes and requirements

**Consult this page** to decide which route a feature belongs to and which approved screen to match. Source: `docs/SPEC.md` §1, §3, §4. Screens live in `design/*.dc.html` (reference only, not imported by the app; the comps themselves are excluded from this wiki, so read `design/README.md` and the SPEC tables instead).

## Surfaces

| Surface | URL | Audience | Look |
|---|---|---|---|
| District hub | `athletics.psd401.net` | Families, both schools | Neutral night ink with both school colours |
| Gig Harbor High School (Tides) | `/ghh` | Tides families | Navy, Columbia blue, wave motif |
| Peninsula High School (Seahawks) | `/phs` | Seahawks families | Deep teal-green, silver, chevron motif |
| Athletics Studio (CMS) | `/studio` (suggested) | Coaches, ADs, secretaries | Nexus design system |

It replaces the athletics pages on the school sites and the PlayOn sites. Back-end pieces: [Arbiter sync and alerts](../integrations/schedule-sync-and-alerts.md) and the [MCP server](../integrations/mcp-server-and-agents.md). Visual rules live in the [design system page](../design/brand-and-design-system.md).

## Public routes → approved screens

| Route | Screen file | Key content |
|---|---|---|
| `/` | `Main` | Split hero per school, live ticker, combined week with filters, Fish Bowl band, family registration hub, follow-a-team |
| `/ghh` | `GHHS-Home` | Teams mega-menu, ticker, next-game hero with countdown, this-week grid, finals, form cards (last 5 W/L), stories, state-titles band |
| `/ghh/teams/football` (pattern for every team) | `GHHS-Football` | Level switcher (Varsity/JV/C), record band, tabs Schedule/Roster/Coaches/News/Photos/Documents |
| `/ghh/game/:id` (phones) | `GHHS-GameDay-Mobile` | Countdown flips to Live; tickets/watch/directions; text-me toggles |
| `/ghh/photos` | `GHHS-Photos` | Photo of the week, game albums, lightbox (download, share, follow, report); see [photos](../domain/photos.md) |
| `/phs` | `PHS-Home` | Same system, Seahawks layout |
| `/phs/schedule` (pattern for both) | `PHS-Schedule` | Search, sport/level/home-away filters, list and month views, calendar subscribe honouring filters, "Updated" tag |
| `/phs` (phones) | `PHS-Mobile` | Live strip, My teams, finals carousel, tab bar |
| `/phs/feed` (phones, both schools) | `PHS-Feed-Mobile` | Following vs all, posts (photo, album, score, note); no likes/comments by default |
| `/phs/staff` (both schools) | `PHS-Staff` | Office contacts, head coaches by season, "Message the coach" |

## Studio routes

| Route | Screen | Who |
|---|---|---|
| `/studio` | `CMS-Today` | Coaches: decision cards, checklist, assistant rail |
| `/studio/stories/:id` | `CMS-Story-Editor` | Agent-drafted recap from Arbiter final + notes; "Needs you" for athlete names |
| `/studio/media/albums/new` | `CMS-Photo-Upload` | Batch upload, game match by timestamp, opt-out holds, required descriptions |
| `/studio/post` (phones) | `CMS-Sideline-Mobile` | Sideline photo/score/note |
| `/studio/media` | `CMS-Media-Review` | AD only |
| `/studio/schedule-sync` | `CMS-Schedule-Sync` | AD only |
| `/studio/people` | `CMS-People-Roles` | AD only |
| `/studio/agents` | `CMS-Agents` | AD only |

AD-only gating follows [roles and permissions](../domain/roles-permissions-privacy.md).

## Public site requirements (SPEC §4)

- **Every game** shows date, time, level, opponent, home/away and actions Tickets (GoFan, home games), Watch (NFHS), Directions, Add to calendar. States: Live / Tonight / Final / Updated.
- **Score ticker** (live, tonight, final, next) pauses under `prefers-reduced-motion`; **countdowns** switch to "Live" at start time.
- **Calendar subscriptions** per school, team and filtered view (ICS + Google/Apple/Outlook).
- **Follow a team** by text/email with no account; see [alerts](../integrations/schedule-sync-and-alerts.md#alerts).
- Team pages for every sport and level from one template; stories attach to teams and optionally games.
- Staff directory relays messages so coach emails stay hidden.
- Families hub: links and plain-language steps for Final Forms registration, physicals (MyWIAA), ASB card, transportation, insurance/health forms, eligibility. Registration is **not** rebuilt.
- EN · ES header toggle (translation approach unresolved, see [open questions](../planning/roadmap-and-decisions.md#open-questions)).
- Monthly athletics updates become pages, not PDFs; partner/sponsor blocks per school and team.
- Responsive to 390 px; accessibility per [privacy and accessibility rules](../domain/roles-permissions-privacy.md#accessibility-and-performance).

## Change guidance

Placeholders in `[brackets]` in designs (coach names, GH AD, sponsors, gate/parking) stay placeholders; don't invent people. When a design and the spec disagree, follow the spec and note it in `docs/DECISIONS.md`.
