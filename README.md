# template-nextjs-app

PSD401 template for Next.js applications. Start every new Next.js repo from this template — never from scratch ([01-repo-lifecycle.md](https://github.com/PSD401/psd-dev-standards)).

## What this template gives you

- **Next.js 16 (App Router) + React 19 + TypeScript** — `strict` and `noUncheckedIndexedAccess` on.
- **Vitest 4 + Testing Library** with one real, behavior-asserting example test (`components/counter.test.tsx`). PSD CI fails repos with zero tests by design — keep at least one real test at all times.
- **ESLint (flat config)** — `next/core-web-vitals`, `next/typescript`, and the PSD test-quality rules (`vitest/expect-expect`, no `.only`, no `.skip`).
- **PSD CI wiring** — `.github/workflows/` call the org reusable workflows (`reusable-psd-ci`, `reusable-claude-review`, `reusable-license-check`). No CI logic lives in this repo.
- **Dependabot** — weekly GitHub Actions + npm updates, minor/patch grouped.
- **MIT LICENSE, CLAUDE.md, AGENTS.md** — required in every PSD repo.

## First 10 minutes

1. **Rename**: update `name` in `package.json`, the `<h1>` in `app/page.tsx`, and `metadata` in `app/layout.tsx`. Naming: lowercase-kebab; prefix `psd-` for district-specific tools.
2. **Set repo custom properties**: `tier` (default `c-experiment`), `owner`, `lifecycle: active` — a repo is born governed or not born.
3. **Add topics** for discovery (e.g. `nextjs`, `student-facing`).
4. **Review CLAUDE.md**: fill in the architecture map for your app; prune anything that doesn't apply. It is kept under 100 lines — treat it like code.
5. **Install and verify green**: `bun install && bun run test && bun run lint && bun run typecheck` (bun is the PSD JS runtime rule; `bun.lock` is committed).
6. Replace `components/counter.tsx` and its test with your first real component — do not delete the test without replacing it.

## Commands

| Task | Command |
|------|---------|
| Install | `bun install` |
| Dev server | `bun run dev` |
| Build | `bun run build` |
| Test | `bun run test` |
| Lint | `bun run lint` |
| Typecheck | `bun run typecheck` |

## Owner

Technology Services, Peninsula School District. See [SECURITY.md](https://github.com/PSD401/.github) (inherited from the org `.github` repo) for contact.
