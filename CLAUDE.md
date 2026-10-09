# CLAUDE.md — psd-athletics

Map, not manual. If a line here wouldn't prevent a mistake, delete it. Change this file in the same PR that changes the convention.

## What this is

The athletics platform for Peninsula School District: the district hub at `athletics.psd401.net`, the Gig Harbor (`/ghh`) and Peninsula (`/phs`) sites, and Athletics Studio (`/studio`), the coach CMS, with an MCP server so coaches' AI assistants can work as them. Tier A (public site, student data). Owner: @krishagel.

**Status:** design approved; the app isn't built yet. Start from `docs/KICKOFF.md`.

## Read first

1. `docs/SPEC.md` — surfaces, decisions, roles, routes, data model, integrations, MCP tools, phases.
2. `docs/BRAND.md` — school palettes, type, motifs, logo rules; Nexus for the Studio.
3. `design/README.md`, then the `.dc.html` screens. They're the approved look and behavior; match them closely.
4. `vendor/nexus/NEXUS-README.md` and `vendor/nexus/index.d.ts` before writing Studio UI.
5. `docs/DECISIONS.md` and `docs/QUESTIONS.md`.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript (strict, `noUncheckedIndexedAccess`) — from `template-nextjs-app`
- Vitest 4 + @testing-library/react (jsdom) · ESLint flat config · Playwright + axe for smoke and accessibility (add in Phase 1)
- Chosen in `docs/PLAN.md` §2: Postgres + Drizzle ORM (SQL migrations in `drizzle/`; PGlite in process when `DATABASE_URL` is unset), S3 for photos (Phase 5), Better Auth with Google limited to `psd401.net`, scheduled job handlers in `jobs/` (Phase 3), the official TypeScript MCP SDK (Phase 7).
- Hosting: AWS `us-west-2`, not yet confirmed. Don't provision anything or add IaC until it is.

## Commands (exact)

```bash
bun install          # bun is the PSD JS package manager (bun.lock is committed)
bun run dev          # local dev server
bun run build        # production build — must pass before PR
bun run test         # vitest run (CI gate; a zero-test repo fails psd-ci)
bun run lint         # eslint . — includes test-quality rules
bun run typecheck    # tsc --noEmit
bun run db:generate  # drizzle-kit: write a new SQL migration in drizzle/ after editing lib/db/schema.ts
bun run db:migrate   # apply migrations to DATABASE_URL (without it, the app uses in-memory PGlite and migrates itself)
bun run db:seed      # load fixtures/ into DATABASE_URL (the in-memory dev database seeds itself)
```

Always `bun run test` (the package script), never bare `bun test` (bun's own runner).

## Map

- `app/` — App Router routes. Planned: `/` hub, `/ghh`, `/phs`, `/studio`, `/mcp`.
- `components/` — shared components, colocated `*.test.tsx` beside each. Public-site components in `components/athletics/`.
- `styles/themes.css` — the only place raw colors live: school palettes and `--ath-*` theme tokens (`data-school="hub|ghh|phs"`) over Nexus tokens.
- `lib/db/schema.ts` — the data model; `drizzle/` — committed migrations (never edit one; generate a new one).
- `design/` — approved comps (`*.dc.html`) and `assets/` (logos, photos). Reference only; the app doesn't import from here.
- `docs/` — `SPEC.md`, `BRAND.md`, `KICKOFF.md`, `DECISIONS.md`, `QUESTIONS.md` (`PLAN.md` arrives in Phase 1).
- `fixtures/fall-2026-snapshot.json` — real fall 2026 games, records and school facts; `fixtures/school-content.json` — honors for the titles bands. Loaded by `lib/db/seed.ts`.
- `vendor/nexus/` — read-only copy of Nexus from `psd-dev-standards`. Never edit.
- `.github/workflows/` — thin callers of `PSD401/.github` reusable workflows. Never add CI logic here.

## Non-negotiables

- **WCAG 2.1 AA:** 4.5:1 text contrast, 44px targets, keyboard and screen reader support, real `<button>`/`<a>`/`<label>`, reduced motion respected. Every published photo needs an image description.
- **Permissions live on the server, in one module,** shared by the web app and the MCP server. Coaches publish their own teams; ADs can edit or take down anything at their schools; only the district AD posts to official social accounts; agents never exceed the person who connected them.
- **Every change is audited** (`AuditLog`) with an undo window. Agents propose; people publish.
- **Arbiter is the source of truth.** Never write to it. Never invent schedule data; show unknown values as unknown.
- **Student privacy:** strip photo location data, follow directory-information rules for names, hold photos with opted-out jersey numbers, never use face recognition, never expose student contact, medical or eligibility data (including through MCP). No student records in the repo, fixtures, tests or logs.
- **Secrets** never go in the repo or in `.env` files in synced folders: macOS Keychain locally, AWS Secrets Manager in the cloud (standards/04, rule 15a).
- **Tokens, not raw values:** no hex colors, font families or px spacing in components when a token covers it. School themes are tokens too (`docs/BRAND.md`).
- No drag-and-drop page builder. No ParentSquare integration.

## Conventions

- Server Components by default; add `"use client"` only when state/effects/events are needed.
- Build each public page pattern once as a shared template with a school theme; both schools use every pattern.
- Test-first for non-trivial logic (permissions, sync rules, photo holds); watch the test fail before making it pass.
- Tests assert rendered behavior (roles, text, interactions), not implementation details or snapshots.
- Existing tests are contracts: weakening or deleting an assertion must be declared in the PR body.
- When a design detail and the spec disagree, follow the spec and note it in `docs/DECISIONS.md`.
- Keep `[bracket]` placeholders from the designs as placeholders; don't invent people.

## Working style

- Every change goes through a branch and PR: `psd-ci`, `license-check` and `claude-review` run, and Tier A needs one human approval. Keep PRs small and single-purpose.
- PR body follows the org template: purpose, AI disclosure, evidence (paste test/lint/typecheck/build output).
- Build in the phases in `docs/SPEC.md` §11. Phases 1–2 run on fixtures, so the public sites work before Arbiter access is sorted.
- Questions for the district go in `docs/QUESTIONS.md`; choices you make go in `docs/DECISIONS.md`.

## Anti-patterns (will fail review)

- Deleting or `.skip`-ing a failing test to get green (lint blocks `.only`/`.skip`).
- Assertion-free tests to inflate coverage (`vitest/expect-expect` blocks these).
- Weakening CI: loosening lint rules, removing gates, editing `.github/workflows/` to bypass psd-ci.
- Adding dependencies without stating why in the PR body.
- `any`, `@ts-ignore`/`@ts-expect-error` without an explanatory comment.
- Fetching data in Client Components when a Server Component can do it.

## PR evidence bar

Tests pass, lint clean, typecheck clean, build succeeds; bug fixes include a failing-then-passing test; UI changes include a screenshot at desktop and 390px.
