# Kickoff prompt for Claude Code

Paste this into Claude Code from the root of this repo.

---

We're building the Peninsula School District athletics platform: a district hub at athletics.psd401.net, a site for Gig Harbor (/ghh) and Peninsula (/phs), and Athletics Studio, a coach CMS on our Nexus design system with an MCP server for coaches' AI assistants.

Start by reading CLAUDE.md, docs/SPEC.md, docs/BRAND.md, docs/DECISIONS.md and design/README.md, then skim every screen in design/.

Then:
1. Write docs/PLAN.md: the app layout (this repo started from template-nextjs-app; keep one Next.js app unless you can say why not), the choices CLAUDE.md leaves open (database and ORM, storage, auth, job runner, MCP SDK) with reasons, the database schema from SPEC §5, and a task list for Phases 1 and 2. Open it as a PR on its own so we can review the plan before code.
2. Add to docs/QUESTIONS.md anything else you need from us.
3. Build Phase 1 in small PRs: both school themes as design tokens layered on Nexus, the data model with migrations, a seed script that loads fixtures/fall-2026-snapshot.json, Google sign-in restricted to psd401.net, and Playwright + axe smoke tests. Replace the template's counter component and test with real ones.
4. Then begin Phase 2 with the district hub (design/Main.dc.html) and the Gig Harbor home page (design/GHHS-Home.dc.html), driven by the seed data. Match the designs closely, including at 390px.

Rules: every change goes through a branch and PR with the org PR template (purpose, AI disclosure, evidence). Run bun run test, lint, typecheck and build before each PR and paste the output. Don't provision cloud infrastructure or buy anything; hosting isn't confirmed. Keep accessibility checks passing as you go.
