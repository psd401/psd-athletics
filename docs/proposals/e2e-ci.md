# Proposal: make Playwright + axe smoke tests block merge

Status: suggestion for `psd401/psd-dev-standards` and `PSD401/.github`, written 2026-10-08 for QUESTIONS 18. Nothing here is built; this repo can't add CI logic (CLAUDE.md).

## Where things stand

- **The rule:** standards/05 §5 says "Playwright smoke suite (3–5 core journeys) blocks merge on user-facing apps; full E2E nightly", and "one org reusable workflow implements the gates; repos supply commands only". The PR-check budget is under 5 minutes. standards/00 marks E2E on critical flows as Required for Tier A.
- **No reusable exists or is planned.** `PSD401/.github` has reusables for psd-ci, claude-review, license-check, security-scan and openwiki. `plans/phase-3-standard-ci.md` lists six reusables and none is E2E. ROADMAP Phase 4 item 17 waits on "Phase 3 E2E infra" that isn't built.
- **The accessibility gate is only proposed.** standards/10 Enforcement row 3 ("Playwright check in the reusable CI: render key pages in each `data-theme` and run axe contrast rules") is marked Proposed. It needs approval, Tier A only at first.
- **Four repos already run Playwright in their own CI**, none of them through a reusable: `psd401-prr`, `psd-eoc`, `psd-maps` and `atrium-capture`. `psd401-prr` is the best model: it installs Chromium with `--with-deps`, uploads the axe report, screenshots and Playwright report, and pins upload-artifact by SHA. None of the four caches browsers. `template-nextjs-app` has no E2E.
- **How rulesets roll out:** `psd-production` (Tier A) and `psd-standard` are still in **evaluate**. New required checks follow standards/06 §2: create in Evaluate, watch Rule Insights, then flip to Active. Flips need Kris's approval (`plans/flip-checklist.md`).

## Recommendation: a new `reusable-e2e.yml` in `PSD401/.github`

**Inputs:**

| Input | Default |
|---|---|
| `working-directory` | `.` |
| `install-command` | `bun install --frozen-lockfile` |
| `browsers` | `chromium` |
| `e2e-command` | `bun run test:e2e` |
| `mode` | `smoke` (or `full`) |
| `shard-total` | `1` |
| `artifact-paths` | `playwright-report/`, `test-results/` |
| `timeout-minutes` | `15` |

**The job:**

- Job `e2e` with `permissions: contents: read`.
- Actions SHA-pinned like psd-ci: checkout with `persist-credentials: false`, setup-bun, `actions/cache` and `actions/upload-artifact`. All of them are allowed by the org's Actions policy.
- Cache `~/.cache/ms-playwright`, keyed on the OS and the resolved `@playwright/test` version.
- Run `playwright install-deps` every time, because system packages aren't cached. Run `playwright install <browsers>` only on a cache miss.
- Pass inputs through `env:` only, matching psd-ci's hardening note.
- Upload artifacts on failure (7 days) and on success (14 days).

**Why a separate reusable instead of an `e2e-command` input on psd-ci:**

- E2E gets its own check (`e2e / e2e`), its own timeout and sharding, and the same file runs the nightly full suite.
- psd-ci stays under its 5-minute budget, and an E2E failure doesn't look like a unit-test failure.
- The cost: a second reusable to maintain, and `next build` runs in both jobs.

**One catch to solve first:** `psd-production` covers every Tier A repo, including non-UI ones like the MCP servers. Requiring `e2e / e2e` there would block them. Two ways around it:

- **Option 1:** a new repo property such as `ui: true`, with a `psd-ui` ruleset that targets it.
- **Option 2:** a reusable that passes quickly when the repo has no `test:e2e` script.

Option 1 is clearer.

**Rollout:**

1. Prove it on `psd-standards-canary`.
2. Add the `psd-ui` ruleset in Evaluate.
3. Soak it for a week, using the flip-checklist bar.
4. Kris flips it to Active.

Separately, approving standards/10 row 3 would let these axe runs count as the design-system accessibility gate.

## What psd-athletics would add

A caller in the repo's CI, the same kind as `psd-ci.yml`, with no logic of its own:

```yaml
name: E2E
on:
  pull_request:
  push:
    branches: [main]
  schedule:
    - cron: "0 10 * * *" # nightly full run
jobs:
  e2e:
    uses: PSD401/.github/.github/workflows/reusable-e2e.yml@main
    with:
      e2e-command: bun run test:e2e
      mode: ${{ github.event_name == 'schedule' && 'full' || 'smoke' }}
    secrets: inherit
```

## Prep in this repo, whichever way it goes

- **Measure the run:** the suite takes about 17 seconds locally on top of `next build` (34 tests across desktop and 390px). Measure it on a runner before promising the 5-minute budget.
- **Tag the smoke set:** add a `@smoke` tag to the 3–5 blocking journeys, so `mode: smoke` can run `playwright test --grep @smoke` and the rest run nightly.
- **Fix the handbook:** `PSD401/.github/handbook/ci-checks.md` says `bun test`. On repos that use Vitest the right command is `bun run test`, which is what this repo's CLAUDE.md requires.

Sources: `psd-dev-standards`: standards/00, 05, 06, 10, ROADMAP.md, research/testing.md, plans/phase-3-standard-ci.md, plans/flip-checklist.md, rulesets/production.json. `PSD401/.github`: .github/workflows/reusable-psd-ci.yml, handbook/ci-checks.md. Workflow files in `psd401-prr`, `psd-eoc`, `psd-maps` and `atrium-capture`. Live org rulesets and Actions policy (`gh api`).
