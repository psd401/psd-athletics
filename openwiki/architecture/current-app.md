---
type: Architecture
title: Current app state (template starter)
description: What code actually exists in psd-athletics today (Next.js 16 template starter, counter example, Vitest/ESLint/TypeScript tooling) and how to validate changes to it.
tags: [nextjs, vitest, eslint, template, tooling]
openwiki:
  roles: [architecture, testing]
  change_kinds: [tooling, tests, routing]
  source_paths: [app/layout.tsx, app/page.tsx, components/counter.tsx, components/counter.test.tsx, package.json, vitest.config.ts, vitest.setup.ts, eslint.config.mjs, next.config.ts, tsconfig.json]
  symbols: [RootLayout, Home, Counter]
  test_paths: [components/counter.test.tsx]
  invariants: [At least one real behavior-asserting test must exist because psd-ci fails zero-test repos., Lint forbids .only, .skip and assertion-free tests in *.test.ts(x).]
  validation_commands: [bun run test, bun run lint, bun run typecheck]
---

# Current app state

**Consult this page** before touching anything under `app/`, `components/` or the tooling config. The product is specified but [not built yet](../planning/roadmap-and-decisions.md); the repo is the `template-nextjs-app` starter plus spec, design and brand material. Anything described in [planned architecture](planned-architecture.md) does not exist in code.

## What exists

| Piece | File | Behavior |
|---|---|---|
| Root layout | `app/layout.tsx` (`RootLayout`, `metadata`) | `<html lang="en">`, title "PSD Athletics", description naming the Tides and Seahawks. No theming, fonts or tokens yet. |
| Home route `/` | `app/page.tsx` (`Home`) | Static placeholder: heading, "being built" notice pointing at `docs/SPEC.md`, and an example `Counter`. |
| Example client component | `components/counter.tsx` (`Counter`) | `"use client"`; `useState` count rendered in an `<output>` inside a labelled `<section>`; "Increment" button. |
| Example test | `components/counter.test.tsx` | Asserts role-based behavior: region named by label, `status` role starts at "0", two clicks give "2". |

The kickoff prompt (`docs/KICKOFF.md`, summarized in [roadmap](../planning/roadmap-and-decisions.md#kickoff-sequence-docskickoffmd)) says to replace the counter and its test with real components in Phase 1. Tests are colocated beside components (`*.test.tsx`).

## Tooling configuration

- **Stack** (`package.json`): `next ^16`, `react`/`react-dom ^19`, TypeScript `~5.9`, Vitest 4, `@testing-library/react`, `jsdom`, ESLint 9 flat config. Package manager is **bun** (`bun.lock` committed).
- **Vitest** (`vitest.config.ts`): `@vitejs/plugin-react`, `globals: true` (needed for Testing Library auto-cleanup), `jsdom`, setup `vitest.setup.ts` (imports the `@testing-library/jest-dom/vitest` matchers such as `toBeInTheDocument`), includes `**/*.test.{ts,tsx}`.
- **ESLint** (`eslint.config.mjs`): `eslint-config-next` core-web-vitals + typescript; globally ignores `.next/**`, `out/**`, `node_modules/**`, `next-env.d.ts`, `coverage/**`, `design/**`, `vendor/**`. For test files adds `vitest/expect-expect`, `vitest/no-focused-tests`, `vitest/no-disabled-tests` as errors (PSD testing standard). Do not loosen them; see [anti-patterns](../operations/ci-and-workflow.md#anti-patterns-that-fail-review).
- **Next** (`next.config.ts`): only `reactStrictMode: true`.
- TypeScript (`tsconfig.json`) is strict with `noUncheckedIndexedAccess`, defines the `@/*` path alias to the repo root, and excludes `design/` and `vendor/` from type checking.
- `design/` and `vendor/` are reference/third-party material: the app never imports from `design/`, and `vendor/nexus/` is read-only (see [design system](../design/brand-and-design-system.md)).

## Change guidance

- Server Components by default; add `"use client"` only for state/effects/events. Fetch data in Server Components.
- Tests assert rendered behavior (roles, text, interactions), not snapshots or implementation. Weakening or deleting an assertion must be declared in the PR body.
- Always `bun run test` (the package script), never bare `bun test`.

| Check | Command | When |
|---|---|---|
| Focused unit test | `bun run test components/counter.test.tsx` | any component change |
| Lint | `bun run lint` | any change (includes test-quality rules) |
| Types | `bun run typecheck` | any TS change |
| Production build | `bun run build` | before PR; required by CLAUDE.md as a PR gate (conditional for doc-only edits) |
