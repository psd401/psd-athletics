---
type: Operations
title: CI, repository standards and PR workflow
description: How changes land in psd-athletics (thin org reusable workflows, Tier A review, CODEOWNERS, OpenWiki refresh), the exact commands, PR evidence bar and anti-patterns that fail review.
tags: [ci, github-actions, standards, pull-requests, codeowners]
openwiki:
  roles: [delivery, operations]
  change_kinds: [ci, review-process]
  source_paths: [.github/workflows/psd-ci.yml, .github/workflows/claude-review.yml, .github/workflows/license-check.yml, .github/workflows/openwiki.yml, .github/CODEOWNERS, .github/dependabot.yml, CLAUDE.md, .openwikiignore]
  invariants: [Workflow files are thin callers of PSD401/.github reusable workflows; never add CI logic here., Tier A requires one human approval other than the author., Zero-test repos fail psd-ci.]
  validation_commands: [bun run test, bun run lint, bun run typecheck, bun run build]
---

# CI, standards and PR workflow

**Consult this page** before changing workflows, review rules, or opening a PR. Repo follows `psd-dev-standards`: Tier A (`a-production`), started from `template-nextjs-app`, bun, MIT licensed, owner @krishagel (DECISIONS #1–2). Tier A means PRs need a human approval besides the author (question #11: who is the second approver is open), plus E2E smoke tests and monitoring before launch.

## Workflows (`.github/workflows/`)

| File | Trigger | Delegates to |
|---|---|---|
| `psd-ci.yml` | PRs, push to `main` | `PSD401/.github/.github/workflows/reusable-psd-ci.yml@main` |
| `claude-review.yml` | PR opened/ready/reopened (skipped for Dependabot) | `reusable-claude-review.yml` (needs `id-token: write`) |
| `license-check.yml` | PRs | `reusable-license-check.yml` |
| `openwiki.yml` | manual, push to `main` ignoring `openwiki/**`, Monday 08:00 cron | `reusable-openwiki.yml`; refreshes this wiki |

Never edit workflows to bypass psd-ci. `.github/`, `.claude/`, `.mcp.json`, `CLAUDE.md`, `AGENTS.md` and `vendor/nexus/` require owner review via `.github/CODEOWNERS`. `.github/dependabot.yml` handles dependency updates; adding dependencies requires stating why in the PR body.

## Commands

```bash
bun install
bun run dev          # localhost:3000
bun run test         # vitest run (CI gate)
bun run lint         # eslint .
bun run typecheck    # tsc --noEmit
bun run build        # must pass before PR
```

Use `bun run test`, not bare `bun test`. See [current app state](../architecture/current-app.md) for config details and focused invocation.

## PR expectations

Branch + PR for every change, small and single-purpose. Body follows the org template: purpose, AI disclosure, evidence (paste test/lint/typecheck/build output). Evidence bar: tests pass, lint clean, typecheck clean, build succeeds; bug fixes include a failing-then-passing test; UI changes include screenshots at desktop and 390px. Convention changes update `CLAUDE.md` in the same PR; choices go to `docs/DECISIONS.md` ([roadmap](../planning/roadmap-and-decisions.md)).

## Anti-patterns that fail review

- Deleting or `.skip`-ing a failing test (lint blocks `.only`/`.skip`), or assertion-free tests (`vitest/expect-expect`).
- Weakening CI or lint rules.
- Dependencies without justification; `any`; `@ts-ignore`/`@ts-expect-error` without a comment.
- Fetching in Client Components when a Server Component can.
- Secrets or student records in the repo, `.env` in synced folders ([privacy](../domain/roles-permissions-privacy.md)).

## OpenWiki scope

`.openwikiignore` keeps `fixtures/` (staff names/emails), `design/assets/photos/`, `design/*.dc.html` and `vendor/` out of generated wiki (DECISIONS #9). The repo is public (DECISIONS #3): everything committed is permanent.
