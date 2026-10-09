# CLAUDE.md — template-nextjs-app

Map, not manual. If a line here wouldn't prevent a mistake, delete it. Change this file in the same PR that changes the convention.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript (strict, `noUncheckedIndexedAccess`)
- Vitest 4 + @testing-library/react (jsdom) · ESLint flat config (`eslint.config.mjs`)

## Commands (exact)

```bash
bun install          # bun is the PSD JS package manager (bun.lock is committed)
bun run dev          # local dev server
bun run build        # production build — must pass before PR
bun run test         # vitest run (CI gate; a zero-test repo fails psd-ci)
bun run lint         # eslint . — includes test-quality rules
bun run typecheck    # tsc --noEmit
```

Always `bun run test` (the package script), never bare `bun test` (bun's own runner).

## Map

- `app/` — App Router routes. `layout.tsx` = root shell, `page.tsx` = home.
- `components/` — shared components, colocated `*.test.tsx` beside each.
- `vitest.config.ts` / `vitest.setup.ts` — jsdom env, jest-dom matchers.
- `.github/workflows/` — thin callers of `PSD401/.github` reusable workflows. Never add CI logic here.

## Conventions

- Server Components by default; add `"use client"` only when state/effects/events are needed.
- Test-first for non-trivial logic; watch the test fail before making it pass.
- Tests assert rendered behavior (roles, text, interactions) — not implementation details or snapshots.
- Existing tests are contracts: weakening or deleting an assertion must be declared in the PR body.
- Evidence, not assertions: paste test/lint/typecheck output in the PR before claiming done.
- Colocate tests: `components/foo.tsx` → `components/foo.test.tsx`.

## Anti-patterns (will fail review)

- Deleting or `.skip`-ing a failing test to get green (lint blocks `.only`/`.skip`).
- Assertion-free tests to inflate coverage (`vitest/expect-expect` blocks these).
- Weakening CI: loosening lint rules, removing gates, editing `.github/workflows/` to bypass psd-ci.
- Adding dependencies without stating why in the PR body.
- `any`, `@ts-ignore`/`@ts-expect-error` without an explanatory comment.
- Fetching data in Client Components when a Server Component can do it.

## PR evidence bar

Tests pass, lint clean, typecheck clean, build succeeds; bug fixes include a failing-then-passing test.
