---
type: Roadmap
title: Roadmap, decisions log and open questions
description: The eight build phases for PSD Athletics, the kickoff sequence, repo-setup decisions already made and the open district and standards questions that gate work.
tags: [roadmap, phases, decisions, open-questions]
openwiki:
  roles: [workflow, repository]
  change_kinds: [planning]
  source_paths: [docs/SPEC.md, docs/KICKOFF.md, docs/DECISIONS.md, docs/QUESTIONS.md]
  invariants: [Phases 1-2 run on fixtures so public sites work before Arbiter access., Questions for the district go in docs/QUESTIONS.md and choices in docs/DECISIONS.md in the same PR.]
---

# Roadmap, decisions and open questions

**Consult this page** to know what is in scope now and what is blocked. Status: design approved Oct 8, 2026; the app is not built ([current state](../architecture/current-app.md)).

## Phases (SPEC §11)

| # | Phase | Depends on |
|---|---|---|
| 1 | Foundation: tokens for both school themes, Nexus in Studio, [data model](../domain/data-model.md), fixtures seed, Google sign-in, Playwright + axe | choose DB/ORM, auth |
| 2 | Public sites read-only: hub, school homes, schedule, team template, staff, families hub, game-day page (fixtures-driven) | Phase 1 |
| 3 | [Arbiter sync](../integrations/schedule-sync-and-alerts.md) | Arbiter access (Q1) |
| 4 | Studio core: Today, team pages, roster, stories with Studio agent, people/roles, audit log | [permissions](../domain/roles-permissions-privacy.md) |
| 5 | [Photos](../domain/photos.md) | opt-out source (Q4) |
| 6 | Alerts | SMS/email provider (Q3) |
| 7 | [MCP server](../integrations/mcp-server-and-agents.md) | Phase 4 permission module |
| 8 | Migration and launch: content from school sites and PlayOn, redirects, accessibility audit, load test before a Friday | everything |

## Kickoff sequence (`docs/KICKOFF.md`)

1. Write `docs/PLAN.md` (layout, open stack choices with reasons, schema, Phase 1–2 task list) and open it as its own PR.
2. Add needs to `docs/QUESTIONS.md`.
3. Phase 1 in small PRs; replace the counter component and test.
4. Start Phase 2 with the hub and the Gig Harbor home, matching designs at 390px.
Don't provision cloud or buy anything.

## Decisions on record (`docs/DECISIONS.md`, 2026-10-08)

Repo `psd401/psd-athletics` from `template-nextjs-app`; Tier A; public with publication checklist passed; single Next.js app; bun/Vitest/ESLint with Playwright+axe in Phase 1; Nexus vendored (commit `4f0358a`); school themes as tokens on Nexus (pending sign-off); MCP names `psd_<system>_<resource>_<verb>`; OpenWiki caller added; CODEOWNERS on agent config; `mcp-server` property false until server exists; repo photos of student athletes accepted. Detail: [CI and workflow](../operations/ci-and-workflow.md), [design system](../design/brand-and-design-system.md).

## Open questions

Owners are in `docs/QUESTIONS.md`.

| # | Question |
|---|---|
| 1 | Arbiter data access; which entity ID (8486, 17802) is which school |
| 2 | Hosting/DNS: AWS `us-west-2`, Amplify or CDK, account |
| 3 | SMS/email provider and budget |
| 4 | Where photo-release opt-outs live; jersey numbers on rosters |
| 5 | Source of coaching assignments |
| 6 | Gig Harbor AD and head coach names/photos |
| 7 | Official social accounts and holders |
| 8 | Spanish at launch: human, machine or both |
| 9 | PlayOn contract end dates; GoFan/NFHS mapping |
| 10 | Hall of fame/records source |
| 11 | Second Tier A human approver |
| 12 | Closed: repo is public |
| 13 | Sign-off on school-themed tokens over Nexus |
| 14 | Official GH and P logo files |
| 15 | Packaged Nexus for React 19 |
| 16 | MCP behind gateway or app-level OAuth |
