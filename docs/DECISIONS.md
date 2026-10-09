# Decisions

Choices made while building, newest last. Each entry says what was decided, why, and what it costs. Add to this file in the same PR as the change.

## 2026-10-08 — Repo setup

1. **Repo `psd401/psd-athletics`, created from `template-nextjs-app`.** The standards say start from a template and name district tools `psd-` plus lowercase-kebab (standards/01).
2. **Tier `a-production`, lifecycle `active`, owner `krishagel`.** It will be the public athletics site for both schools and will hold student rosters and photos, which makes it Tier A by definition (standards/00). Cost: PRs need a human approval other than the author once the production ruleset is active, plus E2E smoke tests and monitoring before launch.
3. **Visibility: public** (created internal, made public 2026-10-08). Public is the PSD default and brings free code scanning, secret scanning and push protection. The publication checklist passed first (standards/01): every version of every file on every branch was scanned for secrets (only false positives on `secrets: inherit`), no student records, README, LICENSE and the org SECURITY.md in place, student photos cleared (12). Cost: everything committed here is public for good, so student data and secrets must never land in the repo.
4. **One Next.js app, not a monorepo**, unless `docs/PLAN.md` argues otherwise. The public sites, the Studio and the MCP endpoint must share one permission module, and the template is a single app.
5. **bun, Vitest, ESLint config from the template; Playwright + axe added in Phase 1** (standards/02 and /05).
6. **Nexus vendored** from `psd-dev-standards` at commit `4f0358a` into `vendor/nexus/` (standards/10). Swap for a package if one appears.
7. **Public school themes are tokens layered on Nexus.** Nexus supplies spacing, radii, motion and breakpoints; each school's colors and the athletics typefaces are theme tokens. Pending sign-off (`docs/QUESTIONS.md`).
8. **MCP tool names follow `psd_<system>_<resource>_<verb>`** (standards/07). The design comps show short names; `docs/SPEC.md` §8 maps them.
9. **OpenWiki caller added** (required on every repo, standards/06). `.openwikiignore` keeps the fixtures (staff names and emails), photos and the vendored Nexus copy out of the generated wiki.
10. **CODEOWNERS covers agent config and workflows** (`.claude/`, `.mcp.json`, `.github/`, `CLAUDE.md`, `AGENTS.md`), per standards/02 and /04 rule 13.
11. **The `mcp-server` property stays `false`** until the MCP server exists. Set it to `true` and add `server.json` in the PR that adds the server.
12. **Photos of student athletes in the repo are fine.** Students who take part in athletics waive photo privacy as part of participating (Kris Hagel). This resolves the claude-review finding on PR #2 about the photos in `design/assets/photos/`. The product's opt-out holds in SPEC §7 stay as designed.

## 2026-10-08 — Build plan (`docs/PLAN.md`)

13. **Stack for the open slots:** Postgres + Drizzle ORM with committed SQL migrations; PGlite in process when `DATABASE_URL` is unset, so dev, Vitest and Playwright need no database server (`psd-ci` has none); S3 for photos; scheduled job handlers in `jobs/`; the official TypeScript MCP SDK. Reasons and costs in PLAN §2.
14. **Better Auth instead of Auth.js** (CLAUDE.md said Auth.js). Auth.js is maintained by the Better Auth team since September 2025, is in security-patch mode, and v5 never left beta; Better Auth is stable and keeps sessions in our database. Pending sign-off (QUESTIONS 21).
15. **Missing data shows as missing.** Tickets, Watch and Directions buttons render only when the game has the link or venue; stories hide when there are none; alert forms are disabled until Phase 6; EN · ES and Search wait until they work. The comps show these filled in; the fixtures don't have the data (PLAN §4).
16. **Public pages render per request in Phase 2** because Live/Tonight/Final depend on the time. Caching with revalidate-on-sync arrives with the sync in Phase 3.

## 2026-10-08 — School themes (PLAN task 1.2)

17. **Theme tokens live in `styles/themes.css` only.** Raw palettes (`--ghh-*`, `--phs-*`, `--hub-*`) map to semantic `--ath-*` tokens per `data-school` theme. `styles/tokens.test.ts` fails on hex colors, literal font families, or px values that equal a Nexus `--space-*`/`--radius-*` token in `app/` and `components/`. `styles/themes.test.ts` checks every text/background pair at 4.5:1 (3:1 for large score numerals).
18. **Live red is `#D62F33`, not BRAND's `#E5383B`.** White 12px label text on `#E5383B` is 4.23:1, below AA; `#D62F33` is 4.87:1 and reads the same. Muted score numerals use `#74859F` (3.75:1, large text) instead of the comp's `#8597B0` (2.98:1).
19. **Big Shoulders, opsz 72, stands in for Big Shoulders Display.** Google Fonts merged Display into the variable Big Shoulders family and `next/font` only offers the merged family; optical size 72 is the Display cut. `next/font` has no fallback metrics for it, so the build prints a harmless warning.

## 2026-10-08 — Seed (PLAN task 1.4)

20. **How the snapshot maps to rows.** A game with a score is `final`; a note saying "in progress" makes it `live`; anything else is `scheduled`, including two past Peninsula football games with no captured result (QUESTIONS 24). Missing times and league flags stay null. The snapshot's `tickets`/`stream` flags have no URLs, so no links are written. Home games get the school's venue (Roy Anderson Field for Peninsula); away venues stay unknown. Peninsula's fall "Water Polo" game is filed under the school's listed fall sport, Boys Water Polo.
21. **Teams for the whole school year** come from each school's `sportsBySeason` lists (varsity), plus any other level that appears in the games (Peninsula JV and freshman football and volleyball, JV girls soccer): 51 teams.
22. **The seed only runs on an empty database** (no schools). It's a bootstrap; once the Arbiter sync runs, the sync owns schedule data.
23. **`fixtures/school-content.json`** holds the honors for the titles bands: facts from the snapshot, figures and wording from the approved comps, placeholders kept in brackets.

## 2026-10-08 — Sign-in (PLAN task 1.5)

24. **Three checks keep the Studio to `psd401.net`:** Google's `hd` option (Google offers only district accounts, and Better Auth rejects an id token whose `hd` claim differs), `user.validateUserInfo` on every Google sign-in (verified email whose domain is exactly `psd401.net`), and a `session.create.before` hook that refuses a session for any person row that isn't a verified district account. The rule is one function, `lib/auth/domain.ts`.
25. **Studio pages render with Nexus CSS only** (`tokens.css` + `bundle.css`, `nx-` classes) and no Nexus React bundle yet, which targets React 18 (QUESTIONS 15). Each Studio page checks the session itself as well as the layout.
26. **`BETTER_AUTH_SECRET` is required in production** (Better Auth refuses its default secret there). With no Google client configured, the sign-in page says so and the button is disabled.

## 2026-10-08 — District hub (PLAN task 2.1)

27. **The score ticker has a pause button** and pauses on hover and keyboard focus. It scrolls for more than five seconds, which WCAG 2.2.2 says needs a way to stop it; the comp had none. Under reduced motion it doesn't move and becomes a scrollable row.
28. **Links to pages that don't exist yet are left out** until the PR that builds the page: Full schedule and calendar subscribe (2.3), Photos in the header (Phase 5), Fish Bowl history, Sideline Store, Watch live and Tickets quick links (no URLs yet, QUESTIONS 20), the Puget Sound League link (URL to confirm). Families cards other than Final Forms show "Link coming soon" (QUESTIONS 23).
29. **The ticker shows the latest finals whatever the result.** The comp's hub ticker happened to show only wins; a district site reports losses too.
30. **Afternoon games today are tagged "Today", evening games "Tonight"** (5 PM and later, or no listed time). The hero tag is Live/Tonight/Today when it applies, otherwise "Home" or "Next up".
31. **Small layout changes from the comp:** the hero school names scale with the viewport (clamp to 10vw) so "Seahawks" fits its half; the hero clips the center slash; on phones each game's title row spans the full card width instead of the 72px time column.
32. **Images in `public/` are served as-is** (`images.unoptimized`). They're already web-sized; on-the-fly resizing needs sharp and a hosting decision, revisited in Phase 5. Photos and logos are copies of `design/assets/` (credits in `design/assets/photos/CREDITS.md`).
