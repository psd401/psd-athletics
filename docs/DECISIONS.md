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
49. **Roster, Coaches, News, Photos and Documents read their real tables** (published rows only; roster fields are directory information) and show a plain empty state until coaches post in the Studio. The comp's `[Athlete name]` and `[Head coach name]` placeholders aren't shown on public pages, and neither is the comp's team photo, which comes from albums in Phase 5. Partner slots keep their `[Sponsor]` placeholders, as on the school home.
50. **Team names are now links** in the Teams menu, the season tiles, the season form cards and the hero ("Team page"). That closes that part of DECISIONS 35.
51. **"Subscribe to schedule" opens the schedule filtered to the team**, where the calendar links for that team live, rather than repeating the subscribe buttons on every team page.

## 2026-10-08 — Peninsula home (PLAN task 2.5)

52. **The athletics office's own published email and phone are shown** (AD and athletic secretary), as in the comp and on the school's site. Coaches' addresses are still never shown; the staff page relays messages (SPEC §4). `listSchools` now returns office emails; the contacts table holds only office staff.
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
