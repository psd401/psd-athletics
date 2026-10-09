---
type: Domain Feature
title: Photos pipeline and governance
description: Planned photo ingest, agent assistance, photo-release holds, publishing, family reporting and AD governance for PSD Athletics, the district AD's priority feature.
tags: [photos, media, privacy, studio]
openwiki:
  roles: [domain, workflow]
  change_kinds: [media, privacy, publishing]
  source_paths: [docs/SPEC.md, CLAUDE.md]
  invariants: [All EXIF and location data is stripped before anything is stored publicly; originals stay private., Publishing is blocked until every photo has an image description., No face recognition; jersey-number matches against opted-out roster entries are held., Family report hides the photo immediately.]
---

# Photos

**Consult this page** for anything that ingests, holds, publishes or removes photos. Source: `docs/SPEC.md` §7. The district AD wants one home for every team's pictures so teams stop running their own social accounts. Not built yet (Phase 5; Studio screens `CMS-Photo-Upload`, `CMS-Sideline-Mobile`, `CMS-Media-Review`, public `GHHS-Photos` — see [routes](../product/surfaces-and-routes.md)).

<!-- openwiki: mermaid parse failed and this diagram was converted to a text fence so it does not break rendering. Fix the diagram source and restore the mermaid fence. Parser error: Heuristic: a semicolon inside a label breaks rendering; rephrase the label. -->
```text
flowchart TD
  U["Upload: desktop batch, phone camera roll, volunteer photographer"] --> T[Read capture timestamp]
  T --> S[Strip EXIF + location]
  S --> Z["Generate sizes thumb/card/full WebP/AVIF; keep original private"]
  Z --> A["Agent assist: match game by time, pick best set, draft alt text, jersey-number check"]
  A --> H{"Jersey matches opted-out roster entry?"}
  H -- yes --> Hold[Hold photo, held_reason set]
  H -- no --> C[Coach reviews every photo]
  Hold --> C
  C --> D{"Every photo has description?"}
  D -- no --> Block[Publishing blocked]
  D -- yes --> P[Coach publishes album / feed post]
  P --> R["Family 'Report this photo' hides immediately, notifies coach + AD, logs decision"]
```

Diagram: ordering from SPEC §7 ingest/agent/publishing lists. Volunteer uploads are held for the coach regardless.

## Rules

- **Agent assistance, coach approves everything**: match to game by capture time vs game window; drop blurry/near-duplicates; draft descriptions; photo-release check by reading visible jersey numbers vs `RosterEntry.photo_release_opt_out`. Face recognition is never used.
- Albums attach to a team and optionally a game; they show on team page, school photo hub and optionally the team feed; followers can be emailed on a new album ([alerts](../integrations/schedule-sync-and-alerts.md#alerts)).
- Team feed has no likes or comments by default (AD setting).
- Posting to official social accounts is AD-only; v1 may only export a ready-to-post carousel (API feasibility unconfirmed).
- AD governance view: cross-school activity, open reports, held-for-opt-out counts, teams not posting, inventory of unofficial team social accounts with wind-down plan, media rules (`Rule`).
- Entities: `Album`, `Photo`, `PhotoReport` in the [data model](data-model.md). Opt-out source (Final Forms vs student information system) and jersey-number availability are open.

## Change guidance

- Privacy invariants belong in [permission/privacy rules](roles-permissions-privacy.md); test-first for holds, description gating and EXIF stripping (assert stored output has no GPS fields).
- Uploads through MCP use `psd_athletics_media_upload`, which must run opt-out checks ([MCP tools](../integrations/mcp-server-and-agents.md)).
- Design photos in `design/assets/photos/` are excluded from this wiki; credits are in `design/assets/photos/CREDITS.md`.
