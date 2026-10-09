# PSD Athletics — build spec

Peninsula School District · Gig Harbor High School (Tides) and Peninsula High School (Seahawks)
Design approved October 8, 2026. Design canvas: https://claude.ai/artifact/Uuc9DFFqqM3S8rYXWWMpRR (private to the owner until shared).

## 1. What we're building

One platform, four surfaces:

| Surface | URL | Audience | Look |
|---|---|---|---|
| District hub | `athletics.psd401.net` | Families and community, both schools | Neutral night ink with both school colors |
| Gig Harbor site | `athletics.psd401.net/ghh` | Tides families | Navy, Columbia blue, wave motif |
| Peninsula site | `athletics.psd401.net/phs` | Seahawks families | Deep teal-green, silver, chevron motif |
| Athletics Studio (CMS) | `athletics.psd401.net/studio` (suggested) | Coaches, athletic directors, secretaries | Nexus design system |

Plus three back-end pieces: an Arbiter schedule sync, an MCP server so coaches' own AI assistants can work in the Studio as them, and a text/email alert service.

This becomes **the official athletics site for both schools**. It replaces the athletics pages on `ghh.psd401.net` and `phs.psd401.net` and the PlayOn sites (`tidesathletics.com`, `peninsulaathletics.com`).

### Decisions already made
- **Coaches publish their own teams' content** without review. Coaches are responsible for it. Athletic directors can edit or take down anything at their schools.
- **Photos are a first-class feature.** The district AD wants this to be the central home for team photos so teams stop starting their own social accounts.
- **No drag-and-drop page builder.** Pages are built from fixed, designed templates. Coaches edit content, not layout.
- **No ParentSquare integration.** Alerts are sent by this platform directly (text and email).
- **Registration stays in Final Forms.** The site explains and links; it does not rebuild forms.
- **Agents never exceed the person who connected them**, and every agent action is logged and undoable.

## 2. Roles and permissions

| Role | Scope | Publishes | Photos | Also |
|---|---|---|---|---|
| District athletic director | Both schools | Any page | Takes down anything | Only role that posts to official school social accounts |
| School athletic director | One school | Any page at their school | Takes down at their school | Sets rules for their coaches |
| Athletic secretary | One school | Forms, contacts, school pages | Uploads to school albums | Manages invitations |
| Head coach | Assigned teams | Team pages, stories, feed posts, albums | Publishes their albums | Responsible for their team's content |
| Assistant coach | Assigned teams | Drafts; head coach can allow publishing | Upload, publish if allowed | Sideline posting |
| Volunteer photographer | Assigned teams | Nothing | Uploads held for the coach | No roster access |
| AI agent | Same as the person who connected it | Same as that person | Same as that person | Logged, undoable, time-boxed connection |

Sign-in: Google Workspace, restricted to `psd401.net` accounts. Team assignments should come from the district's coaching assignment list (source to confirm). Access ends when the assignment ends.

## 3. Screens → routes → design files

All design files are in `design/` (see `design/README.md` for how to read them).

### Public
| Route | Design file | Notes |
|---|---|---|
| `/` | `Main.dc.html` | Split hero per school, live score ticker, combined week with school + home-only filters, Fish Bowl band, school cards, family registration hub, follow-a-team alerts |
| `/ghh` | `GHHS-Home.dc.html` | Teams mega-menu, scoreboard ticker, next-game hero with live countdown, tonight card, this-week grid with filters, latest finals, season form cards (last 5 W/L), stories, teams by season tabs, state-titles band, Fan Zone, alerts sign-up, partners, footer |
| `/ghh/teams/football` (pattern for every team) | `GHHS-Football.dc.html` | Level switcher (Varsity/JV/C-team), record stat band, tabs: Schedule, Roster, Coaches, News, Photos, Documents; next-game aside, coach's note, league standings link, team partners |
| `/ghh/game/:id` on phones | `GHHS-GameDay-Mobile.dc.html` | Game-day page: countdown that flips to Live, ticket/watch/directions, know-before-you-go accordion, text-me toggles, up next |
| `/ghh/photos` | `GHHS-Photos.dc.html` | Photo of the week, albums tied to games with team filter, lightbox (download, share, follow, report), "From the sidelines" coach posts, photo-release explainer |
| `/phs` | `PHS-Home.dc.html` | Same system, Seahawks layout: osprey hero, match card with tickets, live-now strip, week board by day with level filter, finals, Fish Bowl champions band, teams, stories, community pillars, athletics office, alerts |
| `/phs/schedule` (pattern for both schools) | `PHS-Schedule.dc.html` | Search, sport/level/home-away filters, list and month views, subscribe (Google/Apple/Outlook/ICS link) honoring filters, "Updated" tag for Arbiter changes |
| `/phs` on phones | `PHS-Mobile.dc.html` | Live strip, Friday hero with ticket button, My teams (next up / this week), finals carousel, quick links, tab bar |
| `/phs/feed` on phones (pattern for both schools) | `PHS-Feed-Mobile.dc.html` | Team feed: following vs all, team rings, posts (photo, album, score, note), follow buttons, share; no likes or comments by default |
| `/phs/staff` (pattern for both schools) | `PHS-Staff.dc.html` | Athletics office contacts, head coaches by season with search, "Message the coach" (no public email addresses) |

Every public page pattern exists for **both** schools; the design shows each pattern once, in one school's skin. Build them as shared templates with a school theme.

### Athletics Studio (Nexus)
| Route | Design file | Notes |
|---|---|---|
| `/studio` | `CMS-Today.dc.html` | Coach's day: context chips, status strip, decision cards (publish recap, confirm schedule change), coming up, record tiles, team-page checklist, assistant rail |
| `/studio/stories/:id` | `CMS-Story-Editor.dc.html` | Agent-drafted recap from Arbiter final + coach notes, suggestion blocks, "Needs you" for athlete names, where-it-appears switches, phone preview, tool call card |
| `/studio/media/albums/new` | `CMS-Photo-Upload.dc.html` | Batch upload → game match by timestamp, agent picks, opt-out holds, required image descriptions, destinations |
| `/studio/post` on phones | `CMS-Sideline-Mobile.dc.html` | Post photos, a score update, or a note during a game |
| `/studio/media` (AD) | `CMS-Media-Review.dc.html` | Media across both schools, family reports, official-account requests, team social account wind-down, media rules |
| `/studio/schedule-sync` (AD) | `CMS-Schedule-Sync.dc.html` | Diff of Arbiter changes, publishing rules, standing sync task, connected sources, sync agent with tool calls |
| `/studio/people` (AD) | `CMS-People-Roles.dc.html` | Roles matrix, people list, coach onboarding checklist, content migration sources |
| `/studio/agents` (AD) | `CMS-Agents.dc.html` | MCP tool table, agent activity log with undo, permission request, connected agents, connection config |

## 4. Public site requirements

- **Schedule everywhere.** Every game shows date, time, level, opponent, home/away, and per-game actions: Tickets (GoFan, home games), Watch (NFHS), Directions (venue map), Add to calendar. Live / Tonight / Final / Updated states.
- **Score ticker** on hub and school pages: live, tonight, final, next. Pauses under `prefers-reduced-motion`.
- **Countdowns** to the next marquee game; switch to "Live" at start time.
- **Calendar subscriptions** per school, per team, and per filtered view (ICS feed + Google/Apple/Outlook links).
- **Follow a team** → text and/or email: schedule changes (one message per change) and finals (optional). No account. STOP to end.
- **Team pages** for every sport and level, from one template.
- **Stories** (recaps, announcements) attached to teams and optionally to games.
- **Photos**: see section 7.
- **Staff directory** with contact-the-coach messaging that hides addresses.
- **Families hub**: Final Forms registration, physicals (MyWIAA), ASB card, self-transportation form, insurance/health forms, eligibility and transfers. Links and plain-language steps.
- **EN · ES toggle** in the header (translation approach to confirm).
- **Monthly athletics updates** become pages, not PDFs.
- **Partners/sponsors** blocks per school and per team.
- Responsive to 390px wide; phone layouts shown in the `*-Mobile` designs.

## 5. Data model (starting point)

- `School` (id, name, mascot, path, colors, logo, address, contacts)
- `Season` (fall/winter/spring + school year)
- `Sport`, `Team` (school, sport, level, season, slug, record cache)
- `Person` (Google account), `RoleAssignment` (person, role, school?, team?, starts, ends)
- `Game` (arbiter_id, team, opponent, home/away, start_at, venue, status, score_us, score_them, is_league, stream_url, ticket_url, last_synced_at, updated_fields[], updated_at)
- `ScheduleChange` (game, field, old, new, source, matched_league_site bool, status pending/applied/held, rule, decided_by, decided_at)
- `Story` (team, game?, title, body, status draft/published, author, drafted_by_agent, published_at)
- `Album` (team, game?, title, cover_photo, status)
- `Photo` (album, storage_key, sizes, width, height, taken_at, alt_text, credit, held_reason, hidden_reason, uploaded_by)
- `PhotoReport` (photo, reporter contact, reason, status, decided_by)
- `FeedPost` (team, kind photo/score/note, body, photos[], game?, author)
- `Follower` (contact, verified, teams[], wants_changes, wants_finals)
- `AlertMessage` (follower, channel, kind, body, sent_at, provider_id)
- `RosterEntry` (team, display_name per directory-info rules, jersey_number, position, grade, photo_release_opt_out)
- `Document`, `Sponsor`, `CoachNote`
- `AgentConnection` (person, client, scopes, created, expires)
- `AuditLog` (actor person or agent-as-person, verb, object, scope, before/after, undo_until, undone_by)
- `Rule` (kind, scope, settings) for publishing and media rules

## 6. Integrations

| System | Use | Status |
|---|---|---|
| **Arbiter** | Source of truth for schedules, times, venues, scores | **Access path to confirm.** The ArbiterLive team pages (entity IDs 8486 and 17802) block automated access. Ask Arbiter for an API, partner feed or ICS export. 8486 is Gig Harbor and 17802 is Peninsula (confirmed 2026-10-08, DECISIONS 46). |
| **Puget Sound League site** (ArbiterSports-powered) | Standings; second source for the league-match rule | Confirm data access |
| **MaxPreps** | Optional records and results backfill | Not a source of truth |
| **NFHS Network** | Stream link per home game | Mapping per event |
| **GoFan** | Ticket link per event | Needs event mapping |
| **Sideline Store** | Spirit wear links | Links only |
| **Final Forms** (`peninsula-wa.finalforms.com`) | Registration; possibly photo-release opt-outs | Links; opt-out data source to confirm |
| **Google Workspace** | Studio sign-in (`psd401.net` only) | — |
| **SMS + email provider** | Alerts | Provider and budget to confirm |
| **Official school social accounts** | AD-approved sharing (e.g. `@GHTidePride`) | API feasibility to confirm; v1 can export a ready-to-post carousel |

**Sync behavior** (from `CMS-Schedule-Sync.dc.html`): poll every 15 minutes, 6 AM–10 PM. For each change: if the league site shows the same change, publish automatically and text followers once; if not, hold for a person. JV and C-team changes can publish automatically. Any change within 2 hours of game time is held for a person. The platform never writes to Arbiter.

## 7. Photos

The district AD's priority: one place for every team's pictures instead of team-run social accounts.

**Ingest**
- Desktop batch upload, phone camera roll (sideline posting), and volunteer photographer submissions (held for the coach).
- Read the capture timestamp, then **strip all EXIF and location data** before anything is stored publicly.
- Generate responsive sizes (thumb, card, full; WebP/AVIF), keep the original private.

**Agent assistance** (coach approves everything)
- Match photos to the right game by capture time vs. scheduled game window.
- Pick the best set: drop blurry and near-duplicate shots.
- Draft an image description for every photo. **Publishing is blocked until every photo has one.**
- **Photo-release check:** read visible jersey numbers and compare to roster entries flagged as opted out; hold any match. **Never use face recognition.** The coach still reviews every photo.

**Publishing**
- Coaches publish their own albums and feed posts.
- Albums attach to a team and optionally a game; they appear on the team page, the school photo hub and (optionally) the team feed. Followers can get an email when a new album posts.
- Family "Report this photo" hides the photo immediately, notifies the coach and AD, and logs the decision.
- Team feed has **no likes or comments by default** (AD setting).
- Posting to official school social accounts is an AD-only action.

**Governance (AD view)**: activity across both schools, open reports, held-for-opt-out counts, teams not yet posting, an inventory of unofficial team social accounts with a wind-down plan, and media rules.

## 8. Studio agents and the MCP server

Built-in agents (role names, never human names): **Studio agent** (recaps, captions, schedule notes), **Sync agent** (Arbiter), **Comms agent** (district hub stories, social suggestions).

**MCP server** at `athletics.psd401.net/mcp` (suggested), OAuth with `psd401.net` Google accounts. Tools act as the signed-in person and never exceed that person's role. Names follow the PSD MCP standard (`psd_<system>_<resource>_<verb>`); the design comps show short names.

| Tool | Short name in designs | What it does | Access | Who |
|---|---|---|---|---|
| `psd_athletics_teams_list` | `list_teams` | Teams and levels the person coaches | Read | Everyone |
| `psd_athletics_schedule_get` | `get_schedule` | Games, times, sites, results, streams | Read | Everyone |
| `psd_athletics_story_draft` | `draft_story` | Create or edit a story draft | Draft | Coaches |
| `psd_athletics_roster_update` | `update_roster` | Edit roster rows (directory info only) | Draft | Coaches |
| `psd_athletics_media_upload` | `upload_media` | Add photos to an album after opt-out checks | Draft | Coaches, photographers |
| `psd_athletics_feed_post` | `post_update` | Post a score or note to a team feed | Change | Coaches, own teams |
| `psd_athletics_content_publish` | `publish` | Put a draft live | Change | Coaches (own teams), ADs (any) |
| `psd_athletics_social_share` | `share_to_social` | Post to an official school account | Change | Athletic directors, per use |
| — | `update_schedule` | **Not offered.** Arbiter stays the source of truth | — | No one |

Every tool call writes an `AuditLog` row. Changes get an undo window (default 30 minutes). Anything beyond the person's role becomes a permission request shown to someone who holds it. Never return student contact details, medical or eligibility records, or Final Forms data.

PSD MCP standard (`psd-dev-standards`, standards/07) requirements for this server:
- Stateless streamable HTTP; OAuth 2.1 resource-server pattern with audience validation; no token passthrough.
- `readOnlyHint` / `destructiveHint` annotations on every tool. Change tools are dry-run by default and need explicit confirmation, which matches "agents propose, people publish".
- Paginated, truncated responses; errors that say what to do next.
- Ship `server.json` and a tool inventory (tools, data touched, owner) in the README; MCP scanning and an eval suite in CI.
- The server writes rosters (student directory data) and posts publicly, so treat it as MCP risk tier 3 (gateway access, per-user auth, human confirmation, full audit log, code-owner review) until Technology Services says otherwise.

Follow the Nexus agent patterns in `vendor/nexus/guidelines/10-agent-patterns.md`: propose, don't apply; show work steps; one primary action per view; trust footer on every Studio screen; undo with a stated window.

## 9. Alerts

- Channels: SMS and email. Double opt-in for SMS. STOP/HELP handling.
- Triggers: a game's time, date, venue or status changes (after sync rules), and finals (opt-in).
- One message per change per follower. Quiet hours except same-day changes.
- Every message links to the game page.

## 10. Accessibility, privacy, performance

- **WCAG 2.1 AA.** Text contrast ≥ 4.5:1 (3:1 at 24px+), touch targets ≥ 44px, full keyboard support with visible focus, real buttons/links/labels, headings in order, `prefers-reduced-motion` stops the ticker, wave drift and pulses.
- Image descriptions required for every published photo.
- Student names follow the district's directory-information rules; first name + last initial is the default in agent drafts.
- Coach email addresses are never shown publicly; messages relay through the site.
- Friday-night traffic: cache and pre-render schedule and game pages; revalidate on sync.
- LCP under 2.5 s on a mid-range phone on 4G; responsive images everywhere.

## 11. Suggested phases

1. **Foundation** — on the template app: design tokens for both school themes, Nexus in the Studio, data model, fixtures from `fixtures/fall-2026-snapshot.json`, Google sign-in, Playwright + axe smoke tests.
2. **Public sites, read-only** — hub, both school homes, schedule (list/month/subscribe), team page template, staff directory, families hub, game-day phone page. Driven by fixtures.
3. **Arbiter sync** — once access is confirmed; change diff, rules, held changes, Updated tags.
4. **Studio core** — Today, team page content, roster, stories with the Studio agent, people and roles, audit log.
5. **Photos** — ingest pipeline, albums, lightbox, team feed, sideline posting, reports, AD media view.
6. **Alerts** — follow a team, SMS/email, change and final notifications.
7. **MCP server and agent access** — tools, OAuth, permission requests, activity log with undo.
8. **Migration and launch** — move content from `ghh.psd401.net`, `phs.psd401.net` and the PlayOn sites; redirects; accessibility audit; load test before a Friday.

## 12. Open questions

1. How do we get Arbiter data (API, partner feed, ICS)? Which entity ID is which school?
2. Hosting and domain/DNS for `athletics.psd401.net`. The PSD standards point to AWS in `us-west-2` (Amplify for simple hosting, CDK beyond that); confirm the account and which one.
3. SMS/email provider and budget.
4. Where photo-release opt-outs live (Final Forms or the student information system), and whether rosters carry jersey numbers.
5. Source of coaching assignments for roles.
6. Gig Harbor athletic director name and all head coach names/photos.
7. List of official school social accounts and who holds them.
8. Spanish at launch: human translation, machine translation, or both.
9. End dates for the PlayOn contracts; GoFan and NFHS event mapping.
10. Hall of fame / records content source.
