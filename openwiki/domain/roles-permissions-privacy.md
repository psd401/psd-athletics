---
type: Domain Rules
title: Roles, permissions, student privacy and accessibility
description: The role matrix, single-server-module permission rule, audit/undo requirement, student-privacy constraints and WCAG 2.1 AA requirements that every PSD Athletics feature must satisfy.
tags: [permissions, roles, privacy, accessibility, audit]
openwiki:
  roles: [domain]
  change_kinds: [permissions, privacy, accessibility]
  source_paths: [docs/SPEC.md, CLAUDE.md]
  invariants: [Permissions live on the server in one module shared by the web app and MCP server., Agents never exceed the person who connected them., Every change is audited with an undo window; agents propose and people publish., Never expose student contact, medical or eligibility data., No student records in repo, fixtures, tests or logs.]
---

# Roles, permissions, privacy, accessibility

**Consult this page** before writing any publish/edit/takedown path, any roster or photo handling, or any UI. Source: `docs/SPEC.md` §2 and §10, `CLAUDE.md` "Non-negotiables". No permission module exists yet ([current state](../architecture/current-app.md)); this is the contract it must implement, test-first.

## Role matrix

| Role | Scope | Publishes | Photos | Also |
|---|---|---|---|---|
| District athletic director | Both schools | Any page | Takes down anything | Only role that posts to official school social accounts |
| School AD | One school | Any page at their school | Takes down at their school | Sets rules for their coaches |
| Athletic secretary | One school | Forms, contacts, school pages | Uploads to school albums | Manages invitations |
| Head coach | Assigned teams | Team pages, stories, feed posts, albums (no review) | Publishes own albums | Responsible for team content |
| Assistant coach | Assigned teams | Drafts; head coach may allow publishing | Upload; publish if allowed | Sideline posting |
| Volunteer photographer | Assigned teams | Nothing | Uploads held for the coach | No roster access |
| AI agent | Same as the person who connected it | Same | Same | Logged, undoable, time-boxed |

Sign-in is Google Workspace limited to `psd401.net`. Assignments should come from the district coaching assignment list (source unconfirmed, open question #5); access ends when the assignment ends. Model: `Person` + `RoleAssignment` with `starts`/`ends` ([data model](data-model.md)).

## Rules that must hold

1. **One server-side permission module**, shared by the Studio UI, public actions and the [MCP server](../integrations/mcp-server-and-agents.md). Anything beyond a person's role becomes a **permission request** shown to someone who holds it.
2. **Audit everything**: each change writes `AuditLog` (actor or agent-as-person, verb, object, scope, before/after, `undo_until`); default undo window 30 minutes.
3. **Agents propose; people publish.** Change tools are dry-run by default (see MCP page). `update_schedule` is never offered.
4. **Arbiter is read-only**; unknown values display as unknown, never invented ([sync](../integrations/schedule-sync-and-alerts.md)).
5. Only the district AD triggers posts to official social accounts.

## Student privacy

- Strip EXIF/location from photos before public storage; keep originals private ([photos](photos.md)).
- Names follow directory-information rules; agent drafts default to first name + last initial.
- Hold photos whose visible jersey numbers match roster entries with `photo_release_opt_out`. **Never use face recognition.**
- Never expose student contact, medical or eligibility data, or Final Forms data, including through MCP.
- Coach emails never public; messages relay through the site.
- No student records in the repo, fixtures, tests or logs. Secrets live in macOS Keychain locally and AWS Secrets Manager in cloud, never in the repo or synced `.env` files. (Repo-held photos of student athletes were explicitly accepted: DECISIONS #12.)

## Accessibility and performance

- WCAG 2.1 AA: text contrast ≥ 4.5:1 (3:1 at 24px+), targets ≥ 44px, keyboard support with visible focus, real `<button>`/`<a>`/`<label>`, ordered headings, `prefers-reduced-motion` stops ticker, wave drift and pulses.
- Image descriptions required on every published photo (publishing blocked otherwise).
- Playwright + axe smoke tests are planned for Phase 1.

## Test matrix to build (test-first)

| Behavior | Invariant to assert |
|---|---|
| Coach publishes own team | Allowed; other team denied |
| AD at school A edits school B content | Denied; district AD allowed |
| Agent connected by assistant coach | Cannot publish beyond that coach; request raised instead |
| Role assignment past `ends` | No access |
| Mutation | `AuditLog` row with `undo_until`; undo within window works, after fails |
| Volunteer photographer upload | Held for coach; roster inaccessible |
