# Build plan — Phases 1 and 2

How the athletics platform gets built, what it's built with, and the task list for the first two phases in `docs/SPEC.md` §11. Written 2026-10-08. Change this file when a choice here changes, in the same PR.

## 1. App layout

**One Next.js app.** `docs/DECISIONS.md` 4 sets one app unless there's a reason for more, and none has turned up:

- The public sites, the Studio and the MCP endpoint must share one permission module (CLAUDE.md non-negotiable). In one app that's a plain import; across packages it's a workspace package plus versioning.
- The public pages, Studio and `/mcp` read the same tables. One app means one database client, one migration history, one deploy.
- The template is a single app and `psd-ci` runs one `lint`/`typecheck`/`build`/`test` pass.

What would change this: if hosting puts the MCP server on Lambda behind the MCP gateway (QUESTIONS 16) while the site runs elsewhere. Then `lib/` (permissions, data, audit) moves into a workspace package that both deploy. Nothing in Phases 1–2 depends on that, so it waits.

```
app/
  page.tsx                      /            district hub
  [school]/page.tsx             /ghh, /phs   school home (one template, two themes)
  [school]/schedule/            /ghh/schedule, /phs/schedule
  [school]/teams/[sport]/       team page template
  [school]/game/[id]/           game-day page
  [school]/staff/               staff directory
  families/                     families hub
  api/auth/[...all]/route.ts    Better Auth handler
  api/games/[id]/ics/route.ts   one game as .ics
  api/calendar/[...]            ICS feeds (school, team, filtered)
  sign-in/                      Google sign-in
  studio/                       Athletics Studio (Nexus), signed in only
  mcp/route.ts                  MCP server (Phase 7)
components/
  athletics/                    public-site components, themed by tokens
  studio/                       Studio components on Nexus
lib/
  db/                           Drizzle schema, client
  data/                         read queries used by pages (server only)
  schedule/                     pure logic: game states, weeks, Pacific time, form, streaks
  auth/                         Better Auth config, domain rule
  permissions/                  the one permission module (Phase 4; stub in Phase 1)
styles/
  themes.css                    athletics theme tokens (hub, ghh, phs)
drizzle/                        generated SQL migrations (committed)
scripts/                        migrate, seed, keychain env loader
e2e/                            Playwright + axe smoke tests
public/images, public/logos     copies of the approved photos and logos (the app never imports from design/)
```

Schools are one dynamic segment, `[school]`, limited to `ghh` and `phs` by `generateStaticParams` plus `dynamicParams = false`. Every public pattern is built once and themed with `data-school` on the page root, which is what SPEC §3 asks for.

## 2. Choices CLAUDE.md leaves open

| Area | Choice | Why | Cost / what could fail |
|---|---|---|---|
| Database | **PostgreSQL** (AWS RDS for PostgreSQL or Aurora Serverless v2 once hosting is confirmed) | Relational data with real foreign keys (schools → teams → games → changes → alerts), `jsonb` for records and rules, mature on AWS `us-west-2`. | Needs a managed instance and connection pooling (RDS Proxy if we land on Lambda). Not provisioned until hosting is confirmed. |
| ORM and migrations | **Drizzle ORM** + **drizzle-kit** (SQL migrations committed in `drizzle/`) | Schema in TypeScript with strict types; migrations are plain SQL a reviewer can read; no query-engine binary, which keeps serverless cold starts small; one schema for Postgres and PGlite. | Drizzle is pre-1.0 (0.45). Pin the minor version; the 1.0 migration is a known future task. |
| Local and CI database | **PGlite** (Postgres compiled to WebAssembly, in process) when `DATABASE_URL` isn't set | `psd-ci` has no Postgres service and we can't add CI logic here. With PGlite, `bun run dev`, Vitest and Playwright run real Postgres SQL with zero setup: the app migrates and seeds an in-memory database from `fixtures/fall-2026-snapshot.json` on first use. With `DATABASE_URL` set, the same code uses `node-postgres`. | In-memory dev data resets on restart (fine for fixtures; sessions are lost). PGlite is single-connection, so it is never used in production. |
| Photo storage | **Amazon S3**: a private bucket for originals, a second bucket for stripped, resized derivatives served through CloudFront. A local-filesystem adapter behind the same interface for dev. Image work with `sharp` (EXIF and GPS are dropped on output; capture time read first). | S3-compatible is what CLAUDE.md asks; private originals keep un-stripped files off the public path. | Built in Phase 5. Nothing is provisioned or added as a dependency before then. |
| Auth | **Better Auth** (stable 1.x) with the Google provider and its Drizzle adapter. Two checks for `psd401.net`: Google's `hd` hint on the sign-in request, and a server-side check on the verified email before a person row or session is created. | CLAUDE.md suggests Auth.js. Auth.js has been maintained by the Better Auth team since September 2025, is in security-patch mode, and its v5 for the App Router never left beta; the maintainers recommend Better Auth for new projects. Better Auth is stable, stores sessions in our Postgres (so access can be revoked when a coaching assignment ends), and has an OAuth 2.1 provider plugin we can evaluate for the MCP server in Phase 7. | Departs from the CLAUDE.md suggestion; needs sign-off (QUESTIONS 21). CLAUDE.md is updated in this PR. A Google OAuth client is needed before anyone can actually sign in (QUESTIONS 17). |
| Job runner | **Job handlers as plain, idempotent TypeScript functions in `jobs/`**, run locally with `bun run job <name>` and in AWS by **EventBridge Scheduler** (every 15 minutes, 6 AM–10 PM for the Arbiter sync). Outbound alerts use an outbox table (`alert_message`, status `queued`) drained by the same scheduled job. | The sync and alert fan-out are small and periodic. No queue service or worker process is needed to start, and the handlers don't depend on where they run. | Retries and backoff are ours to write. If hosting gives us a long-running container, `pg-boss` (Postgres-backed queue) is the fallback. Decided for real in Phase 3. |
| MCP SDK | **`@modelcontextprotocol/sdk`** (official TypeScript SDK, 1.x), streamable HTTP, stateless, mounted at `/mcp` in this app | It's the official SDK that standards/07 assumes; stateless streamable HTTP fits a route handler. | Support for the 2026-07-28 stateless spec changes in the SDK must be checked in Phase 7. OAuth depends on the gateway answer (QUESTIONS 16). |
| Styling | **CSS Modules** reading CSS variables: Nexus tokens (`vendor/nexus/tokens.css`) for spacing, radii, motion, z-index; athletics theme tokens (`styles/themes.css`) for school colors and type. Fonts through `next/font/google` (self-hosted at build). | No new dependency; tokens stay the single source of values. A Vitest check fails the build if a component stylesheet uses a raw hex color or font family. | The template has no Tailwind; adding it would mean a second token path. |
| E2E | **Playwright** + **`@axe-core/playwright`**, desktop (1440) and phone (390) projects, WCAG 2.1 A/AA rules | Required by standards/05 and CLAUDE.md. | `psd-ci` doesn't run Playwright, and this repo can't add CI logic. Until the org adds an E2E workflow (QUESTIONS 18), Playwright output is pasted into each PR. |

Secrets (`BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL`) come from the environment. Locally, `scripts/with-keychain.sh` reads them from the macOS Keychain (service = variable name, account = `$USER`) per standards/04 rule 15a. No `.env` files.

### Time and "now"

All game times are Pacific (`America/Los_Angeles`). Pages compute Live / Tonight / Final / next game from the current time, so public pages render per request in Phase 2 (caching and revalidate-on-sync arrive with the Arbiter sync in Phase 3). `ATHLETICS_NOW` pins the clock for tests and demos; it's never set in production.

## 3. Database schema (from SPEC §5)

Drizzle schema in `lib/db/schema.ts`; one migration creates all of it in Phase 1 so the model can be reviewed whole. Ids are UUIDs unless noted. Every table has `created_at`; mutable tables have `updated_at`. Enums are Postgres enums.

| Table | Columns | Notes |
|---|---|---|
| `school` | `id` text pk (`ghhs`, `phs`), `slug` (`ghh`, `phs`), `name`, `short_name`, `mascot`, `founded`, `address`, `home_field?`, `logo_path`, `social` jsonb, `arbiter_entity_id?` | Theme tokens live in CSS, keyed by `slug`, not in the database. |
| `school_contact` | `school_id`, `name`, `role`, `email?`, `phone?`, `sort` | Athletics office. Email is stored for the relay, never rendered publicly for coaches. |
| `honor` | `school_id`, `sport?`, `figure` ("11", "’97 · ’17"), `title`, `detail`, `featured_on_hub`, `sort` | State titles and records bands. Placeholders stay in brackets. |
| `season` | `school_year` ("2026-27"), `term` enum fall/winter/spring | Unique (`school_year`, `term`). |
| `sport` | `name`, `slug` | Unique `slug`. |
| `team` | `school_id`, `sport_id`, `season_id`, `level` enum varsity/jv/c_team/freshman, `slug`, `record` jsonb (overall, league, rank, streak, note) | Unique (school, sport, season, level). `record` is the cache SPEC asks for. |
| `person` | `id` text, `name`, `email` unique, `email_verified`, `image?` | Better Auth's user table, renamed. `psd401.net` only. |
| `session`, `account`, `verification` | Better Auth's standard columns | Sessions in Postgres so they can be revoked. |
| `role_assignment` | `person_id`, `role` enum district_ad/school_ad/secretary/head_coach/assistant_coach/photographer, `school_id?`, `team_id?`, `starts_on`, `ends_on?`, `source` | Check constraints: school roles need `school_id`; coach and photographer roles need `team_id`. |
| `venue` | `name`, `address?`, `maps_url?` | Home venues seeded from school addresses. Away venues come from Arbiter; unknown until then. |
| `game` | `arbiter_id?` unique, `team_id`, `opponent`, `home_away` enum home/away/neutral, `start_date`, `start_time?`, `venue_id?`, `status` enum scheduled/live/final/postponed/cancelled, `score_us?`, `score_them?`, `is_league?`, `label?` ("The Fish Bowl"), `stream_url?`, `ticket_url?`, `source` enum fixture/arbiter, `last_synced_at?`, `updated_fields` text[], `updated_at` | `start_time` and `is_league` are nullable because the source sometimes doesn't say; the UI shows those as unknown. A game between our two schools is two rows (one per school's schedule), as in Arbiter. |
| `schedule_change` | `game_id`, `field`, `old_value?`, `new_value?`, `source`, `matched_league_site`, `status` enum pending/applied/held, `rule_id?`, `decided_by?`, `decided_at?`, `detected_at` | Phase 3 writes it. |
| `story` | `school_id`, `team_id?`, `game_id?`, `title`, `slug`, `summary?`, `body`, `status` enum draft/published, `author_id`, `drafted_by_agent`, `cover_photo_id?`, `published_at?` | |
| `album` | `team_id`, `game_id?`, `title`, `cover_photo_id?`, `status` enum draft/published/hidden, `created_by`, `published_at?` | |
| `photo` | `album_id`, `storage_key`, `sizes` jsonb, `width`, `height`, `taken_at?`, `alt_text?`, `credit?`, `held_reason?`, `hidden_reason?`, `uploaded_by`, `published_at?` | Publishing needs `alt_text` (enforced in code and by a check that published photos have it). |
| `photo_report` | `photo_id`, `reporter_contact`, `reason`, `status` enum open/kept/removed, `decided_by?`, `decided_at?` | |
| `feed_post` + `feed_post_photo` | `team_id`, `kind` enum photo/score/note, `body?`, `game_id?`, `author_id`, `published_at?`; join (`post_id`, `photo_id`, `position`) | Join table instead of `photos[]` so photos keep foreign keys. |
| `follower` + `follower_team` | `contact_kind` enum sms/email, `contact_value`, `verified_at?`, `wants_changes`, `wants_finals`, `stopped_at?`; join (`follower_id`, `team_id`) | No account. |
| `alert_message` | `follower_id`, `channel`, `kind` enum change/final/album, `game_id?`, `body`, `status` enum queued/sent/failed, `sent_at?`, `provider_id?` | Doubles as the alert outbox. |
| `roster_entry` | `team_id`, `display_name`, `jersey_number?`, `position?`, `grade?`, `photo_release_opt_out` | Directory information only. There are deliberately no contact, medical or eligibility columns. |
| `document` | `school_id`, `team_id?`, `title`, `kind`, `url?`, `storage_key?`, `published_at?` | |
| `sponsor` | `school_id`, `team_id?`, `name`, `url?`, `logo_key?`, `sort`, `active` | |
| `coach_note` | `team_id`, `author_id`, `body`, `published_at?` | |
| `agent_connection` | `person_id`, `client_name`, `scopes` text[], `expires_at`, `revoked_at?` | |
| `audit_log` | `actor_person_id`, `agent_connection_id?`, `verb`, `object_type`, `object_id`, `school_id?`, `team_id?`, `before` jsonb, `after` jsonb, `undo_until?`, `undone_by?`, `undone_at?` | Append-only; nothing updates a row except the undo columns. |
| `rule` | `kind` enum publish/media/sync, `school_id?`, `team_id?`, `settings` jsonb, `updated_by` | |

## 4. Task list

Each line is one small PR, stacked in order. Every PR runs `bun run test`, `lint`, `typecheck`, `build` (and, from task 1.6, `test:e2e`) and pastes the output.

### Phase 1 — Foundation

| # | PR | Done when |
|---|---|---|
| 1.1 | This plan and the new questions | Reviewed |
| 1.2 | **Themes as tokens.** `styles/themes.css` with hub, Gig Harbor and Peninsula tokens over Nexus; the three athletics fonts via `next/font`; Nexus `tokens.css` loaded globally for spacing/radii/motion. Replace the template counter with `StatusTag` (Live, Tonight, Final, Updated, Home, Away; always a word). | Contrast test: every text/background token pair used by the themes is ≥ 4.5:1 (≥ 3:1 for large display type). Token test: no hex colors or font families in component CSS. `StatusTag` tests assert rendered words. |
| 1.3 | **Data model.** Drizzle schema for all of §3, first migration in `drizzle/`, DB client (Postgres with `DATABASE_URL`, PGlite otherwise), `bun run db:generate` and `db:migrate`. | Test applies the migration to PGlite and checks constraints that matter (role scope checks, unique team, enum values). |
| 1.4 | **Seed.** `scripts/seed.ts` loads `fixtures/fall-2026-snapshot.json` (schools, contacts, seasons, sports, teams, records, venues, games, Fish Bowl label) plus `fixtures/school-content.json` (honors as shown in the designs). Idempotent. The in-memory dev database seeds itself through the same function. | Tests: 48 games, scores split into `score_us`/`score_them`, missing time stays null, "in progress" becomes `live`, rerun doesn't duplicate. |
| 1.5 | **Sign-in.** Better Auth with Google; `psd401.net` enforced on the server; `/sign-in`; `/studio` redirects anonymous visitors; a minimal Studio landing page on Nexus (`tokens.css` + `bundle.css`, `data-theme`), with the trust footer. | Tests: domain rule accepts `x@psd401.net` only (not `psd401.net.evil.com`, not unverified emails); `/studio` redirects when signed out. |
| 1.6 | **Playwright + axe smoke.** Desktop and 390px projects; journeys: hub, Gig Harbor home, sign-in, Studio redirect. Runs against `next build && next start` with `ATHLETICS_NOW` pinned. | `bun run test:e2e` passes with zero axe violations (WCAG 2.1 A/AA tags). |

### Phase 2 — Public sites, read-only (fixtures)

| # | PR | Done when |
|---|---|---|
| 2.1 | **District hub** (`/`, `Main.dc.html`): split hero with each school's next marquee game, score ticker (pauses under reduced motion), combined week with school filter and home-only toggle, Fish Bowl band, school cards, families grid, follow-a-team section, footer. Per-game `.ics` download. | Matches the comp at 1440 and 390 (screenshots in PR). Unit tests for game states, week grouping, ticker contents, filters. E2E + axe pass. |
| 2.2 | **Gig Harbor home** (`/ghh`, `GHHS-Home.dc.html`) as the shared school template: teams mega-menu, scoreboard ticker, next-game hero with live countdown, tonight card, streak note, this-week grid with filters, latest finals, season form cards, stories (hidden when there are none), teams by season tabs, state-titles band, Fan Zone, alerts, partners, footer. `/phs` renders the same template in the Peninsula theme (its own layout from `PHS-Home.dc.html` comes later). | Same bar as 2.1. Countdown test switches to "Live" at start time. |
| 2.3 | Schedule (`/[school]/schedule`): search, sport/level/home-away filters, list and month views, ICS subscribe for school, team and filtered views | `PHS-Schedule.dc.html` |
| 2.4 | Team page template (`/[school]/teams/[sport]`) | `GHHS-Football.dc.html` |
| 2.5 | Peninsula home layout | `PHS-Home.dc.html` |
| 2.6 | Game-day phone page (`/[school]/game/[id]`) | `GHHS-GameDay-Mobile.dc.html` |
| 2.7 | Staff directory (`/[school]/staff`) with message relay stubbed until alerts infrastructure exists | `PHS-Staff.dc.html` |
| 2.8 | Families hub (`/families`) | `Main.dc.html` families section, SPEC §4 |

This session builds 1.1–1.6 and 2.1–2.2. 2.3–2.8 follow.

### Phase 2 rules for data the fixtures don't have

The fixtures have no ticket links, stream links, away venues or stories. CLAUDE.md says never invent schedule data, so:

- **Tickets** and **Watch** buttons render only when a game has `ticket_url` / `stream_url`. In the seed, none do, so those buttons don't appear yet even where the comps show them (QUESTIONS 9, 20).
- **Directions** renders only when the venue is known: home games use the school's address; away games wait for Arbiter venues (QUESTIONS 19).
- **Stories** sections hide when there are no published stories; the Studio creates them in Phase 4.
- **Follow a team** forms render but are disabled with a plain note until alerts ship in Phase 6.
- **EN · ES** and **Search** header buttons are left out until translation (QUESTIONS 8) and search exist, rather than shipping buttons that do nothing.
- **Marquee game** (hub hero and school hero countdown): the next varsity football game in the fall; otherwise the next varsity game (QUESTIONS 22).
- Bracketed placeholders in the comps (`[Athletic director]`, `[Sponsor logo]`, `[series record]`) stay as placeholders.

## 5. Unresolved questions

Also in `docs/QUESTIONS.md` (17–25); 10 is about this PR stack.

1. Better Auth over Auth.js OK?
2. Google OAuth client, dev + prod: who creates?
3. Org E2E workflow so Playwright gates merge?
4. Away venues before Arbiter: wait, or hand-enter?
5. GoFan/NFHS school-level URLs as fallback links?
6. Marquee rule for winter/spring?
7. Families hub link targets (WIAA physical, ASB portal, transport form)?
8. PHS football results Sep 25, Oct 2?
9. Fish Bowl series record + first year?
10. Stacked PRs OK, or wait for each merge?
