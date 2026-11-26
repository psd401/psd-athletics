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

## 2026-11-26 — Dependabot auto-merge

1. **A Dependabot PR the auto-merge workflow accepts merges without a human approval** (decided by Kris Hagel, 2026-11-26). `.github/workflows/dependabot-auto-merge.yml` calls the org reusable at PSD401/.github v1.23.0 with `psd_reusable_pins: true`. It turns on auto-merge only when every update is a patch to a development dependency, or a patch or minor bump of a PSD401/.github reusable workflow pin, Dependabot wrote and signed every commit, and `main` enforces a required status check (psd-dev-standards standards/04 rule 4). Why: nothing else merges a shared-workflow pin bump, and the pins age past the 21-day rule until someone moves them by hand. Cost: those PRs reach `main` on CI alone, and the AI review does not run on a Dependabot PR. A major bump, any other action, a production dependency and every PR a person opens still need the approval.

