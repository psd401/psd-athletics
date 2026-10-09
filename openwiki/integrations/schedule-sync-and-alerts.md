---
type: Integration
title: Arbiter schedule sync, external integrations and alerts
description: Planned read-only Arbiter polling with auto-publish/hold rules, the table of external systems (GoFan, NFHS, Final Forms, Google, SMS/email), and the follower alert service.
tags: [arbiter, sync, alerts, sms, integrations]
openwiki:
  roles: [integration, workflow]
  change_kinds: [sync-rules, integration, notifications]
  source_paths: [docs/SPEC.md, CLAUDE.md, docs/QUESTIONS.md]
  invariants: [The platform never writes to Arbiter., Changes within 2 hours of game time are held for a person., One alert message per change per follower., SMS requires double opt-in and honours STOP/HELP.]
---

# Schedule sync, integrations and alerts

**Consult this page** for schedule ingestion, change-publishing rules, external links and notifications. Source: `docs/SPEC.md` §6 and §9; screen `CMS-Schedule-Sync` ([routes](../product/surfaces-and-routes.md)). Nothing is implemented; Phases 1–2 run on seed fixtures and Phase 3 starts once Arbiter access is confirmed ([roadmap](../planning/roadmap-and-decisions.md)).

## Arbiter sync rules

Arbiter is the source of truth. Access path is unconfirmed: the ArbiterLive team pages (entity IDs 8486 and 17802) block automated access, and which ID is which school is unknown (question #1). Ask for an API, partner feed or ICS export.

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: a semicolon inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
  Poll["Poll every 15 min, 6 AM to 10 PM"] --> Diff[Diff vs Game rows]
  Diff --> Near{"Within 2 hours of game time?"}
  Near -- yes --> Hold[Held for a person]
  Near -- no --> Lvl{"JV or C-team?"}
  Lvl -- yes --> Auto[Publish automatically]
  Lvl -- no --> League{"League site shows same change?"}
  League -- yes --> Auto
  League -- no --> Hold
  Auto --> Notify["Mark Updated; text followers once"]
  Hold --> Review["AD/coach decides in Studio schedule-sync diff"]
```

Diagram: rules from SPEC §6 "Sync behavior". The spec states the rules separately; the precedence shown (2-hour hold first) is an inference, so confirm in `docs/PLAN.md` before coding. Results are recorded as `ScheduleChange` rows (status pending/applied/held, rule, `matched_league_site`) and `Game.updated_fields` drives the "Updated" tag ([data model](../domain/data-model.md)). Pages are pre-rendered and revalidated on sync.

The Sync agent only reads Arbiter; the [MCP server](mcp-server-and-agents.md) deliberately offers no `update_schedule`.

## External systems

| System | Use | Status |
|---|---|---|
| Arbiter | Schedules, times, venues, scores | Access path to confirm |
| Puget Sound League site | Standings; second source for league-match rule | Data access to confirm |
| MaxPreps | Optional records backfill; never a source of truth | Optional |
| NFHS Network | Stream link per home game | Per-event mapping |
| GoFan | Ticket link per event | Needs event mapping |
| Sideline Store | Spirit wear links | Links only |
| Final Forms (`peninsula-wa.finalforms.com`) | Registration; possibly photo-release opt-outs | Links; opt-out source unconfirmed |
| Google Workspace | Studio sign-in, `psd401.net` only | Chosen |
| SMS + email provider | Alerts | Provider and budget TBD (question #3) |
| Official school social accounts | AD-approved sharing | API feasibility TBD |

## Alerts

A platform-owned service (no ParentSquare). Followers need no account.

- Channels SMS and email; double opt-in for SMS; STOP/HELP handling.
- Triggers: a game's time, date, venue or status changes (after sync rules), and finals (opt-in per `Follower.wants_finals`).
- One message per change per follower; quiet hours except same-day changes; every message links to the game page.
- Records: `Follower`, `AlertMessage` (channel, kind, body, `sent_at`, `provider_id`). Also email on new photo albums ([photos](../domain/photos.md)).

## Change guidance

Test-first: each sync rule (hold near game time, auto for JV/C, league-match) and alert dedupe/quiet-hours logic as pure functions. Never log follower contact details beyond what the provider needs ([privacy](../domain/roles-permissions-privacy.md)). Don't provision infrastructure for the job runner until hosting is confirmed ([planned architecture](../architecture/planned-architecture.md)).
