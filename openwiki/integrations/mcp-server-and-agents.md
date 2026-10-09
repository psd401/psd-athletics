---
type: Integration
title: Studio agents and MCP server
description: "The planned MCP server at /mcp and built-in Studio agents: tool inventory, PSD MCP standard requirements, risk tier, audit/undo and permission-request behavior."
tags: [mcp, agents, oauth, audit, studio]
openwiki:
  roles: [integration, domain]
  change_kinds: [mcp-tools, public-api, permissions]
  source_paths: [docs/SPEC.md, docs/DECISIONS.md, docs/QUESTIONS.md]
  invariants: [Tools act as the signed-in person and never exceed that person's role., Every tool call writes an AuditLog row., Change tools are dry-run by default and need explicit confirmation., No update_schedule tool exists., Never return student contact, medical, eligibility or Final Forms data.]
---

# Studio agents and MCP server

**Consult this page** when adding or changing an MCP tool or agent behavior. Source: `docs/SPEC.md` §8 and DECISIONS #8, #11. Not built (Phase 7). DECISIONS #11: the `mcp-server` repo property stays `false` until the server exists; set it `true` and add `server.json` in the PR that adds the server.

## Built-in agents

Named by role, never human names: **Studio agent** (recaps, captions, schedule notes), **Sync agent** ([Arbiter](schedule-sync-and-alerts.md)), **Comms agent** (district hub stories, social suggestions). Nexus agent patterns apply: propose don't apply, show work steps, one primary action per view, trust footer, undo with stated window, first-person voice saying what was not changed ([design system](../design/brand-and-design-system.md)).

## Server

`athletics.psd401.net/mcp` (suggested); OAuth with `psd401.net` Google accounts; stateless streamable HTTP; OAuth 2.1 resource-server pattern with audience validation, no token passthrough; paginated, truncated responses; errors saying what to do next; `readOnlyHint`/`destructiveHint` on every tool; ship `server.json`, a tool inventory (tools, data touched, owner) in the README, MCP scanning and an eval suite in CI. Risk tier 3 until Technology Services says otherwise: gateway access, per-user auth, human confirmation, full audit log, code-owner review. Gateway vs app-level OAuth is open (question #16).

## Tools

Names follow `psd_<system>_<resource>_<verb>`; designs show the short names.

| Tool | Short name | Access | Who |
|---|---|---|---|
| `psd_athletics_teams_list` | `list_teams` | Read | Everyone |
| `psd_athletics_schedule_get` | `get_schedule` | Read | Everyone |
| `psd_athletics_story_draft` | `draft_story` | Draft | Coaches |
| `psd_athletics_roster_update` | `update_roster` (directory info only) | Draft | Coaches |
| `psd_athletics_media_upload` | `upload_media` (after opt-out checks) | Draft | Coaches, photographers |
| `psd_athletics_feed_post` | `post_update` | Change | Coaches, own teams |
| `psd_athletics_content_publish` | `publish` | Change | Coaches (own teams), ADs (any) |
| `psd_athletics_social_share` | `share_to_social` | Change | ADs, per use |
| none | `update_schedule` | Not offered | No one |

## Behavior

- Every call writes `AuditLog`; changes get a 30-minute default undo window; the AD agents screen (`/studio/agents`) shows activity with undo, connected agents (`AgentConnection`: client, scopes, expiry) and permission requests ([data model](../domain/data-model.md)).
- Authorization is delegated to the shared [permission module](../domain/roles-permissions-privacy.md); the MCP layer must not re-implement it.
- Media tools reuse the [photo holds](../domain/photos.md).

## Change recipe: add a tool

1. Add the tool in the MCP module with `psd_athletics_<resource>_<verb>` name, annotations and dry-run/confirm for change tools.
2. Route authorization through the permission module; add audit write and undo handler.
3. Update the tool inventory/`server.json` and this table plus SPEC §8.
4. Tests: role denial, dry-run default, audit row, privacy (no student contact data in output). Escalate to Technology Services if a tool writes rosters or posts publicly beyond tier 3 controls.
