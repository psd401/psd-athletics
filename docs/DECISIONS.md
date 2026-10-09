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
