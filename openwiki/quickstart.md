---
type: Wiki Entrypoint
title: PSD Athletics wiki quickstart
description: Entry point for the psd-athletics knowledge base, covering the Peninsula School District athletics platform (spec-stage, Next.js template starter), task-routing table, page map and backlog.
tags: [quickstart, overview, routing]
openwiki:
  roles: [repository]
  source_paths: [README.md, CLAUDE.md, docs/SPEC.md, package.json]
  validation_commands: [bun run test, bun run lint, bun run typecheck]
---

# PSD Athletics wiki

**What this repo is:** the planned athletics platform for Peninsula School District: district hub (`athletics.psd401.net`), Gig Harbor Tides (`/ghh`), Peninsula Seahawks (`/phs`), and Athletics Studio (`/studio`, the coach CMS) with an MCP server so coaches' AI assistants work as them. Schedules sync read-only from Arbiter. Tier A (public site, student data); owner @krishagel.

**Status that shapes everything:** design approved Oct 8, 2026, but the app is **not built**. Real code is only the Next.js template starter (`app/layout.tsx`, `app/page.tsx`, `components/counter*`). Most of this wiki therefore documents the *contract* from `docs/SPEC.md`, `docs/BRAND.md`, `CLAUDE.md`; treat it as intent, and prefer code once it exists. Excluded from the wiki by `.openwikiignore`: `fixtures/`, `vendor/`, `design/*.dc.html`, `design/assets/photos/`.

## Task routing

| Intent | Wiki page | Entry points (today / planned) | Key symbols | Focused tests | Minimal validation |
|---|---|---|---|---|---|
| Edit the existing starter, tooling or tests | [Current app](architecture/current-app.md) | `app/layout.tsx`, `app/page.tsx`, `components/counter.tsx`, `vitest.config.ts`, `eslint.config.mjs` | `RootLayout`, `Home`, `Counter` | `components/counter.test.tsx` | `bun run test components/counter.test.tsx` then `bun run lint && bun run typecheck` |
| Decide where a feature lives; pick stack | [Planned architecture](architecture/planned-architecture.md) | `docs/SPEC.md`, `CLAUDE.md`; `docs/PLAN.md` (to be written) | permission module (planned) | none yet | doc review only |
| Add a route/page | [Surfaces and routes](product/surfaces-and-routes.md) | `app/` (planned `/ghh`, `/phs`, `/studio`, `/mcp`) | shared themed templates | colocated `*.test.tsx` | `bun run test && bun run build` |
| Roles, publish/takedown, privacy | [Roles, permissions, privacy](domain/roles-permissions-privacy.md) | planned shared server module | `RoleAssignment`, `AuditLog` | write test-first | `bun run test <file>` |
| Schema, migrations, seed | [Data model](domain/data-model.md) | planned DB layer; `fixtures/fall-2026-snapshot.json` (seed, not readable here) | `Game`, `ScheduleChange`, `Photo` | write test-first | `bun run typecheck` plus focused test |
| Photos, holds, reports | [Photos](domain/photos.md) | planned ingest pipeline | `Photo`, `PhotoReport`, `RosterEntry` | write test-first | `bun run test <file>` |
| Arbiter sync, alerts, external links | [Schedule sync and alerts](integrations/schedule-sync-and-alerts.md) | planned job runner | `ScheduleChange`, `Follower`, `AlertMessage` | write test-first | `bun run test <file>` |
| MCP tools, agents | [MCP and agents](integrations/mcp-server-and-agents.md) | planned `/mcp` | `psd_athletics_*` tools | write test-first, plus MCP eval in CI | `bun run test <file>` |
| Styling, themes, Nexus | [Brand and design system](design/brand-and-design-system.md) | `docs/BRAND.md`, `vendor/nexus/` (read-only) | theme tokens | axe/Playwright (planned) | `bun run lint` |
| CI, PR, review | [CI and workflow](operations/ci-and-workflow.md) | `.github/workflows/*.yml`, `.github/CODEOWNERS` | n/a | n/a | `bun run test && bun run lint && bun run typecheck && bun run build` (build conditional on code changes) |
| Phase scope, decisions, questions | [Roadmap and decisions](planning/roadmap-and-decisions.md) | `docs/DECISIONS.md`, `docs/QUESTIONS.md` | n/a | n/a | n/a |

## Page map

- Architecture: [current app](architecture/current-app.md), [planned architecture](architecture/planned-architecture.md)
- Product: [surfaces and routes](product/surfaces-and-routes.md)
- Domain: [roles, permissions, privacy](domain/roles-permissions-privacy.md), [data model](domain/data-model.md), [photos](domain/photos.md)
- Integrations: [schedule sync and alerts](integrations/schedule-sync-and-alerts.md), [MCP server and agents](integrations/mcp-server-and-agents.md)
- Design: [brand and design system](design/brand-and-design-system.md)
- Operations: [CI and workflow](operations/ci-and-workflow.md)
- Planning: [roadmap and decisions](planning/roadmap-and-decisions.md)

## Cross-cutting rules (canonical homes linked)

Single server permission module and audit/undo ([roles](domain/roles-permissions-privacy.md)); Arbiter is never written to ([sync](integrations/schedule-sync-and-alerts.md)); no hex/px literals when a token covers it ([design](design/brand-and-design-system.md)); always `bun run test`, never bare `bun test`.

## Backlog

- `docs/PLAN.md` does not exist yet; when written, update [planned architecture](architecture/planned-architecture.md) with the chosen DB/ORM, storage, auth, job runner and MCP SDK.
- Once app code appears under `app/` and `lib/` (or similar), document real entry points, symbols and tests; the routing table currently points to planned locations.
- `fixtures/` and `vendor/nexus/` are excluded by `.openwikiignore`; their contents are intentionally undocumented.
