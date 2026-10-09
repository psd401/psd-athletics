# Decisions

Choices made while building, newest last. Each entry says what was decided, why, and what it costs. Add to this file in the same PR as the change.

## 2026-10-08 — Repo setup

1. **Repo `psd401/psd-athletics`, created from `template-nextjs-app`.** The standards say start from a template and name district tools `psd-` plus lowercase-kebab (standards/01).
2. **Tier `a-production`, lifecycle `active`, owner `krishagel`.** It will be the public athletics site for both schools and will hold student rosters and photos, which makes it Tier A by definition (standards/00). Cost: PRs need a human approval other than the author once the production ruleset is active, plus E2E smoke tests and monitoring before launch.
3. **Visibility: public** (created internal, made public 2026-10-08). Public is the PSD default and brings free code scanning, secret scanning and push protection. The publication checklist passed first (standards/01): every version of every file on every branch was scanned for secrets (only false positives on `secrets: inherit`), no student records, README, LICENSE and the org SECURITY.md in place, student photos cleared (12). Cost: everything committed here is public for good, so student data and secrets must never land in the repo.
4. **One Next.js app, not a monorepo**, unless `docs/PLAN.md` argues otherwise. The public sites, the Studio and the MCP endpoint must share one permission module, and the template is a single app.
5. **bun, Vitest, ESLint config from the template; Playwright + axe added in Phase 1** (standards/02 and /05).
6. **Nexus vendored** from `psd-dev-standards` at commit `4f0358a` into `vendor/nexus/` (standards/10). Swap for a package if one appears.
7. **Public school themes are tokens layered on Nexus.** Nexus supplies spacing, radii, motion and breakpoints; each school's colors and the athletics typefaces are theme tokens. Pending sign-off (`docs/QUESTIONS.md`).
8. **MCP tool names follow `psd_<system>_<resource>_<verb>`** (standards/07). The design comps show short names; `docs/SPEC.md` §8 maps them.
9. **OpenWiki caller added** (required on every repo, standards/06). `.openwikiignore` keeps the fixtures (staff names and emails), photos and the vendored Nexus copy out of the generated wiki.
10. **CODEOWNERS covers agent config and workflows** (`.claude/`, `.mcp.json`, `.github/`, `CLAUDE.md`, `AGENTS.md`), per standards/02 and /04 rule 13.
11. **The `mcp-server` property stays `false`** until the MCP server exists. Set it to `true` and add `server.json` in the PR that adds the server.
12. **Photos of student athletes in the repo are fine.** Students who take part in athletics waive photo privacy as part of participating (Kris Hagel). This resolves the claude-review finding on PR #2 about the photos in `design/assets/photos/`. The product's opt-out holds in SPEC §7 stay as designed.

## 2026-10-08 — Build plan (`docs/PLAN.md`)

13. **Stack for the open slots:** Postgres + Drizzle ORM with committed SQL migrations; PGlite in process when `DATABASE_URL` is unset, so dev, Vitest and Playwright need no database server (`psd-ci` has none); S3 for photos; scheduled job handlers in `jobs/`; the official TypeScript MCP SDK. Reasons and costs in PLAN §2.
14. **Better Auth instead of Auth.js** (CLAUDE.md said Auth.js). Auth.js is maintained by the Better Auth team since September 2025, is in security-patch mode, and v5 never left beta; Better Auth is stable and keeps sessions in our database. Approved by Kris Hagel 2026-10-08 (QUESTIONS 21).
15. **Missing data shows as missing.** Tickets, Watch and Directions buttons render only when the game has the link or venue; stories hide when there are none; alert forms are disabled until Phase 6; EN · ES and Search wait until they work. The comps show these filled in; the fixtures don't have the data (PLAN §4).
16. **Public pages render per request in Phase 2** because Live/Tonight/Final depend on the time. Caching with revalidate-on-sync arrives with the sync in Phase 3.

## 2026-10-08 — School themes (PLAN task 1.2)

17. **Theme tokens live in `styles/themes.css` only.** Raw palettes (`--ghh-*`, `--phs-*`, `--hub-*`) map to semantic `--ath-*` tokens per `data-school` theme. `styles/tokens.test.ts` fails on hex colors, literal font families, or px values that equal a Nexus `--space-*`/`--radius-*` token in `app/` and `components/`. `styles/themes.test.ts` checks every text/background pair at 4.5:1 (3:1 for large score numerals).
18. **Live red is `#D62F33`, not BRAND's `#E5383B`.** White 12px label text on `#E5383B` is 4.23:1, below AA; `#D62F33` is 4.87:1 and reads the same. Muted score numerals use `#74859F` (3.75:1, large text) instead of the comp's `#8597B0` (2.98:1).
19. **Big Shoulders, opsz 72, stands in for Big Shoulders Display.** Google Fonts merged Display into the variable Big Shoulders family and `next/font` only offers the merged family; optical size 72 is the Display cut. `next/font` has no fallback metrics for it, so the build prints a harmless warning.

## 2026-10-08 — Seed (PLAN task 1.4)

20. **How the snapshot maps to rows.** A game with a score is `final`; a note saying "in progress" makes it `live`; anything else is `scheduled`, including two past Peninsula football games with no captured result (QUESTIONS 24). Missing times and league flags stay null. The snapshot's `tickets`/`stream` flags have no URLs, so no links are written. Home games get the school's venue (Roy Anderson Field for Peninsula); away venues stay unknown. Peninsula's fall "Water Polo" game is filed under the school's listed fall sport, Boys Water Polo.
21. **Teams for the whole school year** come from each school's `sportsBySeason` lists (varsity), plus any other level that appears in the games (Peninsula JV and freshman football and volleyball, JV girls soccer): 51 teams.
22. **The seed only runs on an empty database** (no schools). It's a bootstrap; once the Arbiter sync runs, the sync owns schedule data.
23. **`fixtures/school-content.json`** holds the honors for the titles bands: facts from the snapshot, figures and wording from the approved comps, placeholders kept in brackets.

## 2026-10-08 — Sign-in (PLAN task 1.5)

24. **Three checks keep the Studio to `psd401.net`:** Google's `hd` option (Google offers only district accounts, and Better Auth rejects an id token whose `hd` claim differs), `user.validateUserInfo` on every Google sign-in (verified email whose domain is exactly `psd401.net`), and a `session.create.before` hook that refuses a session for any person row that isn't a verified district account. The rule is one function, `lib/auth/domain.ts`.
25. **Studio pages render with Nexus CSS only** (`tokens.css` + `bundle.css`, `nx-` classes) and no Nexus React bundle yet, which targets React 18 (QUESTIONS 15). Each Studio page checks the session itself as well as the layout.
26. **`BETTER_AUTH_SECRET` is required in production** (Better Auth refuses its default secret there). With no Google client configured, the sign-in page says so and the button is disabled.

## 2026-10-08 — District hub (PLAN task 2.1)

27. **The score ticker has a pause button** and pauses on hover and keyboard focus. It scrolls for more than five seconds, which WCAG 2.2.2 says needs a way to stop it; the comp had none. Under reduced motion it doesn't move and becomes a scrollable row.
28. **Links to pages that don't exist yet are left out** until the PR that builds the page: Full schedule and calendar subscribe (2.3), Photos in the header (Phase 5), Fish Bowl history, Sideline Store, Watch live and Tickets quick links (no URLs yet, QUESTIONS 20), the Puget Sound League link (URL to confirm). Families cards other than Final Forms show "Link coming soon" (QUESTIONS 23).
29. **The ticker shows the latest finals whatever the result.** The comp's hub ticker happened to show only wins; a district site reports losses too.
30. **Afternoon games today are tagged "Today", evening games "Tonight"** (5 PM and later, or no listed time). The hero tag is Live/Tonight/Today when it applies, otherwise "Home" or "Next up".
31. **Small layout changes from the comp:** the hero school names scale with the viewport (clamp to 10vw) so "Seahawks" fits its half; the hero clips the center slash; on phones each game's title row spans the full card width instead of the 72px time column.
32. **Images in `public/` are served as-is** (`images.unoptimized`). They're already web-sized; on-the-fly resizing needs sharp and a hosting decision, revisited in Phase 5. Photos and logos are copies of `design/assets/` (credits in `design/assets/photos/CREDITS.md`).

## 2026-10-08 — School home template (PLAN task 2.2)

33. **`/ghh` and `/phs` are one route, `app/[school]`,** limited to those two slugs. Per-school words and images live in `lib/schools/content.ts` (copy from both comps); everything else comes from the database and the theme tokens. Peninsula's own layout (`PHS-Home.dc.html`) is task 2.5.
34. **The hero headline is written from the game** ("Friday night at Central Kitsap."), since the comp's "in Silverdale" needs the away venue's city, which we don't have. The countdown flips to Live at the listed start time (SPEC §4); the browser's countdown carries the server's clock offset so a pinned demo clock stays consistent.
35. **Team names aren't links yet.** The Teams menu and the season tiles open the Teams section at that season until team pages exist (2.4). The "Game-day info", "All scores", "Records & Hall of Fame", "Become a sponsor" and team-page buttons are left out for the same reason (DECISIONS 28). Fan Zone cards without a confirmed link say "Link coming soon".
36. **Season form cards** show varsity teams with at least one final, the marquee sport first, then the most recently played, three at most. The record is the published one when the fixture has it, otherwise counted from the finals.
37. **The Peninsula logo sits on a white tile in the masthead**, because its green fill disappears on the school green (docs/BRAND.md).

## 2026-10-08 — Answers from the plan review

38. **The Google OAuth client is set up through `psd-gcp-infra`.** That repo keeps OAuth clients and consent screens out of Terraform (no public API) and documents them in its `RUNBOOK.md`, so the athletics client is a runbook entry there: an Internal consent screen (district accounts only), scopes `openid email profile`, redirect URIs `http://localhost:3000/api/auth/callback/google` and `https://athletics.psd401.net/api/auth/callback/google`. The client ID and secret go to the Keychain locally and Secrets Manager in the cloud (QUESTIONS 17).
39. **Away venues come from Arbiter.** No hand entry; away games keep no Directions button until the sync brings venues (QUESTIONS 19).
40. **PRs stay stacked** and work continues without waiting for each merge.

## 2026-10-08 — Schedule (PLAN task 2.3)

41. **`/ghh/schedule` and `/phs/schedule` are one route** with the school masthead, not the comp's white schedule header, so every page of a school's site has the same navigation (the current page is marked with `aria-current`).
42. **Filters live in the URL** (`?sport=football&level=varsity&where=home&q=…&view=month`) and unknown values fall back to "all". The subscribe links always point at the feed for exactly what's filtered: `/api/calendar/<school>.ics` with the same query (a team feed is `?sport=…&level=…`). Google gets the `webcal://` address as `cid`, Apple gets `webcal://`, Outlook gets `outlook.office.com …/addfromweb`, and Copy link copies the `https://` address. Feeds may be cached for 15 minutes; the Arbiter sync will revalidate them in Phase 3.
43. **The month view is a real table** (a caption, Sunday-first column headers, today marked `aria-current="date"`) instead of the comp's `role="grid"`, which would need full grid keyboard support. On phones the table scrolls sideways inside a focusable, labeled region (axe `scrollable-region-focusable`). Away games say "@" and home games "vs", so home and away aren't shown by color alone.
44. **Every past game without a score shows "Result not reported"**, and finals say "Final · Win 37–8" in words. "Jump to today" moves to the first day from today onward.
45. **The hub links to both school schedules** instead of the comp's single "Full schedule", since there isn't a combined schedule page.

## 2026-10-08 — School links

46. **School-level ticket, stream, store and league links** (QUESTIONS 20). Verified on 2026-10-08: the GoFan API returns each school's name, mascot and address for its ID, the NFHS page titles name the school and city, and the schools' own athletics pages link to the stores and to ArbiterLive. Recorded in `lib/schools/content.ts` and used for the Fan Zone, utility bar, footers and hub cards. Per-game Tickets and Watch buttons still need a per-event link, because a school page isn't the game.

| | Gig Harbor | Peninsula |
|---|---|---|
| GoFan | https://gofan.co/app/school/WA23221 | https://gofan.co/app/school/WA23302 |
| NFHS Network | https://www.nfhsnetwork.com/schools/gig-harbor-high-school-gig-harbor-wa | https://www.nfhsnetwork.com/schools/peninsula-high-school-gig-harbor-wa |
| Team store (BSN Sideline, as linked from the school sites) | http://sideline.bsnsports.com/schools/washington/gigharbor/gig-harbor-high-school | https://sideline.bsnsports.com/schools/washington/gigharbor/peninsula-high-school |
| ArbiterLive | https://www.arbiterlive.com/School/8486 | https://www.arbiterlive.com/School/17802 |

League: Puget Sound League, https://www.pugetsoundleague.org/.

47. **School links are live** in each school's utility bar, Fan Zone and footer, and on the hub's school cards: GoFan, NFHS Network, BSN Sideline store and Puget Sound League, from `lib/schools/content.ts`. That closes the "Link coming soon" placeholders from DECISIONS 28 and 35 for these four. The seed now records the confirmed ArbiterLive ids (`fixtures/school-content.json`).


## 2026-10-08 — Team pages (PLAN task 2.4)

48. **`/[school]/teams/[sport]` is the one team page for every sport and level.** Levels are links (`?level=jv`), so they work without JavaScript and can be shared. The record band shows only what the published record has. When there's none (most non-varsity teams), a note says records appear once published and the schedule still shows each result.
49. **Roster, Coaches, News, Photos and Documents read their real tables** (published rows only; roster fields are directory information) and show a plain empty state until coaches post in the Studio. The comp's `[Athlete name]` and `[Head coach name]` placeholders aren't shown on public pages, and neither is the team page's own photo slot, which will come from that team's albums in Phase 5. Partner slots keep their `[Sponsor]` placeholders, as on the school home.
50. **Team names are now links** in the Teams menu, the season tiles, the season form cards and the hero ("Team page"). That closes that part of DECISIONS 35.
51. **"Subscribe to schedule" opens the schedule filtered to the team**, where the calendar links for that team live, rather than repeating the subscribe buttons on every team page.

## 2026-10-08 — Peninsula home (PLAN task 2.5)

52. ~~The athletics office's email and phone are shown~~ Superseded by 65.
53. **A home marquee game's "Buy tickets on GoFan" goes to the school's GoFan page** until per-event ticket links exist. The school page is where that game's tickets are sold. Other per-game Tickets buttons still need an event link.
54. **Each school picks a section order** (`layout` in `lib/schools/content.ts`): Gig Harbor uses the GHHS-Home order, Peninsula the PHS-Home order. The new patterns are shared components either school can use: match-card hero, Live now strip, week board, champions band, pillars and athletics office. The champions band only shows on the page of the school that won the latest Fish Bowl.
55. **Small departures from the PHS comp:** the opponent's crest is a monogram of their initials (we don't hold other schools' logos) instead of the comp's dashed placeholder; the photo tint is a flat 78% of the school's darkest color instead of a gradient; the pillars are 1978, Unified and Letter, picked by `pillarFigures` (the 2012–13 league titles are in 1978's text); Stories stay hidden until there are stories.

## 2026-10-08 — Game-day page (PLAN task 2.6)

56. **`/[school]/game/[id]` works for any game**, not just tonight's: before the game it counts down ("Start in 28:00"; "Kickoff" for football) and flips to Live at the listed start; after, it shows the final; a past game without a score says so. A game id under the other school's path is a 404. "Game-day info" links come from the school hero's tonight card, Peninsula's match card and the team page's next game.
57. **"Know before you go" shows only for home games** and keeps the comp's bracketed placeholders (gates, parking, bag policy, accessible seating) until the athletics office supplies them. It's a native `<details>` accordion.
58. **The text-me switches are shown disabled** with "Text alerts start later this season", like the other alert forms until Phase 6. The comp's search button and "More" tab are left out; the phone tab bar has Home, Schedule, Scores and Teams.

## 2026-10-08 — Coaches and staff (PLAN task 2.7)

59. **`/[school]/staff` lists the athletics office and one card per sport.** Head coaches come from active `head_coach` role assignments (started, not ended); names only, never contact details. With no assignments yet (QUESTIONS 5, 6), every card says "Head coach not listed yet" and links to its team page. Gig Harbor's office shows the comp's `[Athletic director]` placeholder until the name is confirmed.
60. **"Message the coach" waits for the relay.** It has to deliver to the coach's district inbox without exposing the address, which needs the email provider (QUESTIONS 3). Until then the page says the athletics office can pass messages along. The masthead gains a Coaches link, and the school footer gains "Coaches & staff".

## 2026-10-08 — Families hub (PLAN task 2.8)

61. **`/families` explains each step in plain language and links where a link is confirmed**: Final Forms and the WIAA Student Eligibility Center (both checked 2026-10-08). The physical form, ASB portal, self-transportation form and health forms say "Link coming soon. Your athletics office can help now." until QUESTIONS 23 is answered. Both offices' published contacts sit beside the steps. Registration stays in Final Forms (SPEC §1).
62. **One list of family steps** (`lib/families/steps.ts`) feeds the hub's grid and this page. Hub cards without a confirmed outside link now open their step on `/families`. The hub header's links work from any page (`/#week`, `/families`), and school footers link to `/families`.

## 2026-10-08 — Review fixes

63. **Roster entries need a publish step** (review finding on #16). `roster_entry` gains `published_at` (null until a coach publishes) in migration `0001`, and public pages show published entries only. There's no directory-information opt-out in athletics (Kris Hagel, 2026-10-09), so no opt-out column. Coach-supplied document and sponsor links render only if they're `https:` URLs.
64. **Every photo has alt text; darkened backgrounds say so** (Kris Hagel, 2026-10-09, replacing the first version of this entry). A photo used as a darkened background behind text gets alt text like "Darkened background photo: an osprey in flight over the Peninsula ballfield light tower". The descriptions live in `lib/schools/photos.ts`, and a test fails if a photo in `public/images/` has none or a component gives a photo an empty `alt`. Students in these photos are cleared for use (DECISIONS 12). Coach-published photos still can't be published without a description (`photo_published_has_alt`).

## 2026-10-09 — Answers from the stack review

65. **No email addresses or phone numbers for the athletics office on public pages** (Kris Hagel: no benefit). Office cards, footers, the staff page and the families hub show names and roles only. `listSchools` no longer returns them, and the contacts stay in the database for the Studio and the message relay. Coaches' contacts were never shown.
66. **The marquee home game's GoFan fallback stays** (DECISIONS 53, confirmed).


## 2026-10-09 — Phone home (design/PHS-Mobile.dc.html)

67. **Phones get additions, not a second page.** On screens up to 640px, every school page gets a bottom tab bar (Today, Schedule, Scores, Teams), and the school home adds "My teams" and Quick links, with latest finals as a swipeable row. Above 640px those stay hidden. The comp's "More" tab and "Email the AD" link are left out (DECISIONS 65).
68. **"My teams" is stored only in the visitor's browser** (`localStorage`, per school). There's no account and nothing is sent. "Next up" shows the next two games of the picked teams; "This week" shows the next seven days.
69. **Classes paired with `.ath-wrap` set vertical padding only.** The `padding` shorthand in a CSS module overrode the wrap's side gutter, so the school hero, Peninsula's match hero and the Teams menu touched the screen edge on phones. An e2e test now checks a 16px gutter around the main heading on four pages.

## 2026-10-09 — Studio core: permissions and audit (Phase 4)

70. **One permission function, `can(actor, action, scope)`,** in `lib/permissions`, for the Studio and the MCP server. Actions are named for what a person does (`story.publish`, `content.takedown`, `social.share`…) and scopes are a school plus an optional team. The role table follows SPEC §2. Assistants publish only when their head coach's `rule` allows it; photographers only upload; secretaries work at school level; only the district AD shares to official social accounts. Grants come from role assignments active on the day, so access ends when the assignment ends. An agent carries the connecting person's grants unchanged.
71. **Every change is recorded with before and after snapshots** (`lib/audit`), including which agent connection made it, with a 30-minute undo window. The person who made a change, or anyone who could take the content down, can undo it once inside the window; the undo is logged too. Undo is supported for coach notes, stories, roster entries, documents, partners and role assignments.
72. **Local and e2e sign-in uses made-up people** (`lib/auth/dev.ts`): `[Dev] Girls Soccer Coach`, `[Dev] Gig Harbor AD` and so on, one per role, seeded with password accounts into the in-memory database. It's on only when `ATHLETICS_DEV_SIGN_IN=1`, there's no `DATABASE_URL`, and the auth URL is localhost, so it can't run against real Postgres or a public host. Their emails are on the district domain so the domain checks still apply. The sign-in page shows a "Local development only" panel when it's on. Real sign-in is still Google only.
73. **Studio screens are built with Nexus's CSS classes** (`nx-card`, `nx-decision`, `nx-row`…) through small server components (`components/studio/ui.tsx`) instead of the Nexus React bundle, which targets React 18 (QUESTIONS 15). The comps' agent rail waits for the agent work. Navigation lists only pages that exist.
74. **Roster names must be "first name, last initial"** (`Alex R.`, `Mary Kate O.`). The editor refuses anything else, since that's the district's default for student names (SPEC §10). Roster entries start as drafts; "Publish" makes them public, and each publish is logged and can be undone. Jersey numbers are 1–3 digits and grades 9–12. Studio inputs and buttons get a 44px minimum height (Nexus's default is 40px).
75. **Activity rows say what changed**: a story's title, a roster name, or the start of a note, cut to 60 characters, so people can tell their changes apart before undoing.

## 2026-10-09 — Stories (Phase 4)

76. **Stories are drafts until a publisher publishes them.** Head coaches and ADs publish; assistants draft (or publish when the head coach's publish rule allows it). Editing a published story needs publish rights, because it changes what families read. Unpublishing returns it to a draft. Drafts and unpublished stories are not found on the public site.
77. **"Start from a final" fills in facts only:** the result, opponent, home or away, and date, from the schedule. It never adds athlete names or invents details (SPEC §8); the coach writes the rest.
78. **Story bodies are plain text.** A blank line starts a new paragraph. No HTML or Markdown, so nothing a coach or an agent pastes can change the page.
79. **Story addresses are `/{school}/stories/{slug}`,** with the slug made from the title and unique within the school (`-2`, `-3` for repeats). Renaming a story changes its address.
80. **Stories appear on the school home (the latest four) and in the team page's News tab.** The home's Stories section stays hidden until something is published (DECISIONS 15).

## 2026-10-09 — People and roles (Phase 4)

81. **Who can give which role is `canAssign()` in `lib/permissions`.** The district AD names school ADs. A school AD adds secretaries, coaches and photographers at their school. A secretary invites coaches and photographers at their school ("Manages invitations", SPEC §2). Coaches don't hand out access. The district AD role isn't assigned in the Studio. Ending a role follows the same rule, and nobody can end their own access.
82. **People are added by their psd401.net address.** A new address creates an unverified person row, and the role starts on the chosen date. Nothing is emailed: they sign in with Google. Better Auth is set to link that first Google sign-in to the row (`requireLocalEmailVerified: false`). This is safe because sign-up is off, so person rows come only from an AD or a Google sign-in, and Google sign-in still checks a verified psd401.net account three ways. Status reads "Invited" until they sign in, then "Active".
83. **Ending a role that has started sets its end date to yesterday,** so access stops today and the history stays. A role that hasn't started yet is removed. Both are audited and can be undone for 30 minutes. Activity shows whose role changed ("Pat Q. · Head coach").
84. **The access list exports as CSV** for the schools the person manages. Cells that start with `=`, `+`, `-` or `@` get a leading apostrophe so spreadsheets don't run them.
85. **Not built yet from the People and roles design:** the coach onboarding checklist (it depends on bios, the Studio agent and sideline posting, which come later) and "Move what's already out there" (the migration agent, Phase 7). Assignments are entered by hand until the coaching-assignment source is known (QUESTIONS 5).

## 2026-10-09 — Photo pipeline (Phase 5)

86. **No camera metadata is stored anywhere.** Ingest reads the capture time, then re-encodes every size with `sharp`, which drops EXIF, XMP and IPTC, including location. That includes the private full-size copy, a metadata-free JPEG rather than the camera's file. SPEC §7 asks to "keep the original private", but keeping the camera file would mean storing students' locations, so we don't. Public sizes are WebP at 480, 1200 and 2400 px wide, never enlarged. AVIF can come later if size matters. Files over 50 megapixels, and anything that isn't JPEG, PNG, WebP, HEIC or AVIF, are refused.
87. **Photo files go through a small storage interface** (`put`, `get`, `deletePrefix`), with a local folder (`PHOTO_STORAGE_DIR`, default `.data/photos`, git-ignored) until S3 exists (Hagel, 2026-10-09). The app never builds a public URL from a storage key. `app/media/[photo]/[size]` serves published photos with a five-minute public cache, so a report or removal takes effect quickly. Held and draft photos go only to signed-in people who can upload for, or take down, that team. The full-size copy is never served.
88. **Uploads from anyone who can't publish albums are held** ("Waiting for the coach to review") until the head coach or an AD releases them. That covers volunteer photographers, and assistants unless the head coach allows them to publish. Publishing an album publishes every photo that isn't held or removed, and is refused until each has an image description. The database's `photo_published_has_alt` check backs this up.
89. **A family's report hides the photo at once** and creates a `photo_report`. The head coach or an AD keeps it (the photo returns) or removes it. Both are audited. Notifying the coach and AD arrives with alerts (Phase 6); until then, open reports show in the Studio.
90. **Photos match a game by capture time:** a photo taken from an hour before a game's start to four hours after it counts toward that game. Most photos wins. A tie, a missing capture time, or a game with no start time gives no suggestion. Capture times without a recorded offset are read as Pacific time. Picking the best shots, drafting image descriptions and reading jersey numbers for photo-release holds are agent work (Phase 7). Until then, coaches write descriptions and review every photo.
91. **AWS is confirmed and Terraform is the standard** (Hagel, 2026-10-09). No Terraform is written yet. Where it lives and how state is kept are QUESTIONS 26.

## 2026-10-09 — Studio photos (Phase 5)

92. **Uploads go to a route handler, not a server action** (`/studio/photos/{id}/upload`). Raising the server-action body limit would raise it for every action. The handler checks that the request comes from the Studio's own origin (the session cookie is SameSite=Lax as well) and takes up to 20 photos of 25 MB each per upload. It works without JavaScript and redirects back with a message.
93. **Studio "Photos"** lists albums for the teams a person can upload for. Athletic directors also get counts (albums this week, fall teams posting, open family reports) and a decision card for each open report: "Keep it down" or "Restore it". The reporter's contact isn't shown in the Studio; it's kept for the follow-up. The design's team social accounts inventory, media rules switches and Instagram suggestions wait for real data and Phase 7.
94. **Albums are matched to a game from the photos' capture times** and the coach confirms with "Use this game", or picks any of the team's games. Holds, image descriptions, release and remove are per photo. "Publish N photos" counts only photos that aren't held or removed.

## 2026-10-09 — Public photos (Phase 5)

95. **The lightbox is a page per photo** (`/{school}/photos/{album}/{photo}`), not a script overlay. It works without JavaScript, the back button and shared links work, and screen readers get an ordinary page. It shows the full-size image, Previous and Next, the image description as visible text, Download full size, and the report form. The album page's grid links each photo with "Photo N of M: {description}".
96. **"Report this photo" asks for an email or phone and a reason**, then hides the photo at once (SPEC §7). Anyone can report, so anyone can hide a photo until the coach or AD restores it. SPEC accepts that trade. Rate limiting belongs with hosting (QUESTIONS 26). A reported photo's files return 404 immediately, and the media route's five-minute public cache covers the rest.
97. **The photo hub says only what's built.** The explainer covers coaching staff publishing, held volunteer photos, location data removal and reporting. It doesn't claim jersey-number opt-out checks until they exist (Phase 7), and it links to Final Forms for photo-release choices. "Photo of the week", "From the sidelines" (the team feed, next) and "Send us a photo" aren't built yet. The masthead gains a Photos link, and the team page's Photos tab shows that team's albums.
98. **Studio decision cards are regions named by their title,** so each one can be found by itself (screen readers and tests).

## 2026-10-09 — Team feed and sideline posting (Phase 5)

99. **Feed posts go live when posted** by anyone with `feed.post` (head coaches, assistants, ADs). That covers sideline posting, which SPEC gives assistants. An AI agent's post waits as a draft for a person, and agents can't post photos ("agents propose; people publish"). Removing a post takes it off the feed and can be undone. The author, the head coach or an AD can remove it.
100. **Sideline photos go into the team's "Sideline · {date}" album for the day,** published with the post. Every photo needs an image description when it's posted, and a post takes up to four photos. They get the same metadata stripping, serving and report handling as album photos. This also puts sideline photos in the photo hub and the team's Photos tab, so nothing gets lost in a feed.
101. **Score updates are words** ("Halftime: Tides 1, Capital 0.") tied to a game. They never change the game's score, which stays whatever Arbiter (the fixture, for now) says.
102. **The public feed is `/{school}/feed`, with team filter links,** newest first. It has no likes or comments (SPEC §7; the AD setting comes later), and posts show "Coaching staff" rather than a name. Team pages show the team's posts under News as "From the sidelines", and the photo hub shows the latest three. The design's "Teams I follow" view and Share button need the follow feature (Phase 6) and client script, so they wait. The masthead gains a Feed link.

## 2026-10-09 — Alerts (Phase 6)

103. **Following a team needs no account: a contact, a team, and a six-digit code.** The code is the double opt-in for text and email alike (SPEC §9). It's stored hashed, lasts 30 minutes and allows five tries, and a new one can be sent at most every two minutes. Following again with the same contact adds teams rather than replacing them. Contacts are an email address or a US mobile number. Screens show them masked, and they never go in a URL.
104. **The outbox sends one message per change per follower,** only to confirmed followers who haven't stopped. Schedule changes go to those who want them, and finals (from the recorded score only) to those who asked. Quiet hours are 9 pm to 7 am Pacific, except for messages about a game that day. Every message links to the game page and ends with a signed stop link. The stop page needs a button press, so email link scanners can't unsubscribe anyone. `jobs/deliver-alerts.ts` drains the outbox (`bun run job deliver-alerts`). The Arbiter sync (Phase 3) and the Studio's change confirmation will call `queueGameChange` and `queueFinal`; nothing calls them yet.
105. **Senders: email goes through AWS SES** (Hagel, 2026-10-09). The SES sender arrives with `infra/`, along with the sending identity. With local dev sign-in on, both channels only log, with the contact masked, and the confirm page shows the logged message so the flow can be tested. Anywhere else, with no provider configured, sign-ups say alerts start later. Texting waits for a provider (QUESTIONS 27). STOP and HELP replies by text need the provider's inbound messages, so they come with it.
106. **The hub, both school homes and the game-day page now sign people up.** The game-day page's disabled "Text me" switches are replaced by a "Follow {sport}" link to `/alerts` with the team chosen. Album emails to followers (SPEC §7) come with SES.

## 2026-10-09 — AWS infrastructure in Terraform

107. **Terraform in `infra/`** (Hagel, 2026-10-09; psd-dev-standards 08 v0.2 in psd401/psd-dev-standards#42).
   - **Site:** one container on ECS Fargate (ARM64) behind an ALB with WAF. That's simpler than Lambda adapters for Next.js with `sharp`, and the same image runs the scheduled jobs.
   - **Database:** RDS PostgreSQL. The app reads the RDS-managed master password at connect time, so it never sits in Terraform state and rotation doesn't break connections.
   - **No NAT gateway.** App tasks take public IPs for outbound calls (Google sign-in, SES, AWS APIs), and their security group admits only the load balancer. That's a Checkov skip (CKV_AWS_333). Adding a NAT gateway later is a small change if the district prefers private tasks.
   - **WAF:** AWS managed rules plus a per-IP rate limit, which also slows abuse of the public report and alert forms (DECISIONS 96, 103).
   - **Not applied.** The account, state bucket and SMS provider are open (QUESTIONS 26, 27).
108. **The app image runs Next.js on Node 24, with bun alongside** for installs and jobs. `next build` under bun's own runtime crashed (bun 1.2.23 segfault in Docker), and locally `bun run` already launches the Next CLI with Node, so the image matches what's tested. AWS pieces sit behind the existing interfaces, chosen by environment: S3 photo storage (`PHOTO_STORAGE=s3`), the SES sender (`ALERTS_EMAIL=ses`) and the RDS connection (`DATABASE_HOST`/`DATABASE_SECRET_ARN`, password read at connect time and cached for a minute). Without them, the local defaults (folder, log sender, PGlite or `DATABASE_URL`) are unchanged. Dev sign-in also stays off whenever `DATABASE_HOST` is set.

## 2026-10-09 — MCP server (Phase 7)

109. **The MCP server is in this app at `/mcp`** (`@modelcontextprotocol/server` 2.1.0, stateless, accepting 2025-era clients too).
   - **Authorization server:** this app, through Better Auth's `mcp` plugin (OAuth 2.1, dynamic client registration, audience-bound JWTs, consent on `/connect`).
   - **Connections:** each assistant is an `agent_connection` per person and client, so the audit log names it and the person can turn it off (Studio → Assistants). That revokes its tokens, and the server refuses tokens issued before the turn-off. Security times use the real clock, not the pinned app clock.
   - **Seven tools** (docs/MCP.md). **`psd_athletics_content_publish` never publishes.** It returns the Studio link where the person publishes. SPEC §8 lists it as a "Change" tool for coaches, but CLAUDE.md's non-negotiable "Agents propose; people publish" wins (spec-vs-rule conflicts follow the rule).
   - **Writes:** default to dry run. Story and feed tools only make drafts; roster adds stay unpublished; roster removals are limited to unpublished entries.
   - **Not offered:** `upload_media` and `share_to_social` (docs/MCP.md).
110. **Sign-in during an assistant's authorization:** the sign-in page verifies the signed request, signs the person in, and sends them back to the authorize endpoint (signature fields and a satisfied `prompt=login` removed). The authorize endpoint re-checks the client, redirect URI and PKCE. Better Auth's server-side sign-in hook didn't resume the flow for server actions, so this does it explicitly. Consent uses a small client component that posts to the consent endpoint and follows its redirect, as Better Auth's own client does.
111. **A person publishes assistant drafts:** `publishPost` refuses agents, and the Studio post page lists "Drafts from your assistant" with Publish. Story drafts already show in Stories, and unpublished roster entries in the team editor.
112. **An assistant has its person's full access** (Hagel, 2026-10-09: "The mcp should just have oauth so they can use it if they have access"). This supersedes the drafts-only parts of 109 and 111.
   - **What changed:** writes no longer default to dry run. `psd_athletics_content_publish` publishes when the person may. Feed posts from an assistant go live at once. Roster removals follow the normal rule.
   - **Gates:** OAuth (a psd401.net person signs in and allows the assistant) and `can()`.
   - **Kept:** audit with the connection id, 30-minute undo, and turning an assistant off.
   - **Also updated:** the CLAUDE.md non-negotiable "Agents propose; people publish" in this PR. Standards/07's "dry-run by default" for MCP-2/3 writes is set aside for this server by its owner.
