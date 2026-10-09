# psd-athletics

The athletics platform for Peninsula School District.

| Surface | URL | For |
|---|---|---|
| District hub | `athletics.psd401.net` | Families and community, both schools |
| Gig Harbor High School (Tides) | `athletics.psd401.net/ghh` | Tides families |
| Peninsula High School (Seahawks) | `athletics.psd401.net/phs` | Seahawks families |
| Athletics Studio | `athletics.psd401.net/studio` | Coaches, athletic directors, athletic secretaries |

It becomes the official athletics site for both schools, replacing the athletics pages on the school sites and the PlayOn sites. Coaches run their own team pages, stories, photos and feeds in Athletics Studio, and their AI assistants can work there as them through an MCP server. Schedules sync from Arbiter.

## Status

Design approved October 8, 2026. The app isn't built yet: this repo holds the build spec, the approved screens, the brand assets, seed data and the Next.js template the app grows from.

- Build spec: [docs/SPEC.md](docs/SPEC.md)
- Brand and visual system: [docs/BRAND.md](docs/BRAND.md)
- Approved screens: [design/](design/README.md) (live canvas: https://claude.ai/artifact/Uuc9DFFqqM3S8rYXWWMpRR, private to the owner)
- First prompt for Claude Code: [docs/KICKOFF.md](docs/KICKOFF.md)
- Decisions and open questions: [docs/DECISIONS.md](docs/DECISIONS.md), [docs/QUESTIONS.md](docs/QUESTIONS.md)

## Run it

```bash
bun install
bun run dev        # http://localhost:3000
bun run test
bun run lint
bun run typecheck
bun run build
```

## Layout

| Path | What's in it |
|---|---|
| `app/`, `components/` | The Next.js app (still the template starter) |
| `design/` | The 18 approved screens as `.dc.html` source, logos, photos with credits |
| `docs/` | Spec, brand, kickoff prompt, decisions, questions |
| `fixtures/` | Real fall 2026 games, records and school facts, as of October 8, 2026 |
| `vendor/nexus/` | Read-only copy of the Nexus design system web package, from `psd-dev-standards` |

## Standards

This repo follows [psd-dev-standards](https://github.com/psd401/psd-dev-standards): Tier A (`a-production`), started from `template-nextjs-app`, bun, CI through the org reusable workflows, MIT licensed. Agent instructions are in [CLAUDE.md](CLAUDE.md).

## Owner

Kris Hagel (@krishagel), Technology Services, Peninsula School District. Security contact: see [SECURITY.md](https://github.com/psd401/.github/blob/main/SECURITY.md), inherited from the org `.github` repo.
