# MCP server — tool inventory

The Athletics Studio MCP server lets a coach's or athletic director's AI assistant work in the Studio **as that person** (SPEC §8, psd-dev-standards 07). Owner: @krishagel. Risk tier: **MCP-3** (it edits rosters, which are student directory information), until Technology Services says otherwise.

- **Endpoint:** `https://athletics.psd401.net/mcp`. Stateless streamable HTTP, POST only. It accepts the 2026-07-28 protocol and 2025-era clients (stateless).
- **Auth:** OAuth 2.1 through this app (Better Auth `mcp` plugin). Clients register dynamically (RFC 7591) and discover through `/.well-known/oauth-protected-resource/mcp` and `/.well-known/oauth-authorization-server`. A psd401.net person signs in and allows the assistant on `/connect`. Access tokens are JWTs bound to the `/mcp` resource. Signature, issuer, audience and expiry are checked on every request. There's no token passthrough: the server never calls another service with the token.
- **Connections:** each person + client pair is an `agent_connection`. Every change it makes is in the audit log with that connection's id, shown in Activity, and can be undone for 30 minutes. The person turns it off in Studio → Assistants, which revokes its tokens and consent. Tokens issued before that are refused.
- **Same access as the person** (DECISIONS 112). OAuth is the gate: an assistant can do whatever its person's role allows, including publishing, and nothing more. There are no extra preview or confirmation steps. Every change is audited and can be undone for 30 minutes.

| Tool | Access | Annotations | Data touched | Who |
|---|---|---|---|---|
| `psd_athletics_teams_list` | Read | readOnly | Team names, levels, what the person can do | Anyone signed in |
| `psd_athletics_schedule_get` | Read | readOnly | Games: date, time, opponent, venue, status, result. Unknown values are null. Paged, max 50. | Anyone signed in |
| `psd_athletics_drafts_list` | Read | readOnly | Unpublished stories, roster entries and feed posts | Coaches, ADs |
| `psd_athletics_story_draft` | Change | write | Stories: create (as a draft) or edit. Editing a published story needs publish rights. | `story.draft` holders |
| `psd_athletics_roster_update` | Change | write, destructive | Roster directory information only: first name and last initial, jersey, position, grade. Add and remove. | `roster.edit` holders |
| `psd_athletics_feed_post` | Change | write | Notes and score updates, live at once. Never the game's recorded score. | `feed.post` holders |
| `psd_athletics_content_publish` | Change | write, idempotent | Publishes a story, a roster's new entries, or a draft feed post | Whoever can publish that content |

**Never returned:** student contact details, medical or eligibility records, Final Forms data, family alert contacts, or photo-report contacts.

**Not offered:**
- `update_schedule`: Arbiter is the source of truth.
- `share_to_social`: no official-account integration exists.
- `upload_media`: photos come through the Studio, where the image-description and hold rules apply. A base64 upload tool would put large student images through model context. It can be added if needed.

**Before production** (QUESTIONS 16, 28):
- Gateway placement (AgentCore per standards/07).
- mcp-scan and an eval suite in CI. These need the org's reusable workflow; this repo can't add CI logic.
- Turning the repo's `mcp-server` property on.
- Client ID Metadata Documents, if Technology Services prefers them over dynamic registration.

Local check: `bunx playwright test e2e/mcp.spec.ts` runs the whole flow (register, authorize with PKCE, sign in, consent, token, tools, turn off) against the dev server.
