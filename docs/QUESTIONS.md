# Open questions

Things the district needs to answer. When one is answered, write the answer here, move the decision into `docs/DECISIONS.md` if it changes the build, and mark it closed.

## From the build spec (SPEC §12)

| # | Question | Who | Status |
|---|---|---|---|
| 1 | How do we get Arbiter data (API, partner feed, ICS)? Which entity ID (8486, 17802) is which school? | District AD, Technology Services | Partly answered 2026-10-08: **8486 is Gig Harbor, 17802 is Peninsula** (each ArbiterLive page names the school; Gig Harbor's athletics page links to 8486). How we get the data is still open. |
| 2 | Hosting and DNS for `athletics.psd401.net`. Standards point to AWS `us-west-2`; Amplify or CDK? Which account? | Technology Services | Open |
| 3 | SMS and email provider, and budget. | District AD | Open |
| 4 | Where photo-release opt-outs live (Final Forms or the student information system), and whether rosters carry jersey numbers. | District AD | Partly answered 2026-10-09: athletics has no directory-information opt-out (Kris Hagel). Photo-release opt-outs and jersey numbers still open. |
| 5 | Source of coaching assignments for roles. | District AD, HR | Open |
| 6 | Gig Harbor athletic director's name, and all head coach names and photos. | School ADs | Open |
| 7 | Official school social accounts and who holds them. | District AD | Open |
| 8 | Spanish at launch: human translation, machine translation, or both. | District AD, Communications | Open |
| 9 | End dates for the PlayOn contracts; GoFan and NFHS event mapping. | District AD | Open |
| 10 | Hall of fame and records content source. | School ADs | Open |

## From the PSD development standards

| # | Question | Who | Status |
|---|---|---|---|
| 11 | Who is the second human approver for Tier A PRs? The owner can't approve their own PRs. | Technology Services | Open |
| 12 | Stay internal, or go public after the publication checklist (which brings free CodeQL and secret scanning)? | Technology Services | Closed 2026-10-08: public (DECISIONS 3) |
| 13 | Is the school-themed public site (school colors and athletics typefaces as tokens layered on Nexus) an acceptable reading of standards/10, which otherwise asks for Nexus colors and type? | Technology Services | Open |
| 14 | Official source files for the GH and P logos. The current ones were cut from the school websites. | Communications, schools | Open |
| 15 | Is there a packaged Nexus for React 19? The vendored bundle targets React 18. | Technology Services | Open |
| 16 | Does the MCP server sit behind the planned MCP gateway at launch (standards/07; the gateway phase is on hold), or start with app-level OAuth? | Technology Services | Open |

## From the build plan (`docs/PLAN.md`, 2026-10-08)

| # | Question | Who | Status |
|---|---|---|---|
| 17 | Who creates the Google OAuth client for Studio sign-in (dev with `http://localhost:3000`, and production), and which Google Cloud project holds it? Nobody can sign in until it exists. | Technology Services | Answered 2026-10-08: the client lives with the district's Google Cloud setup in `psd-gcp-infra` and is created there. That repo keeps OAuth clients out of Terraform (no public API) and records them in its `RUNBOOK.md`; the athletics entry to add is in `docs/PLAN.md` §2 (DECISIONS 38). Open until the client exists. |
| 18 | Can the org add a reusable E2E workflow (Playwright + axe) so the smoke suite blocks merge, as standards/05 requires? This repo can't add CI logic. Until then Playwright output is pasted into PRs. | Technology Services | Suggestions in `docs/proposals/e2e-ci.md` (a `reusable-e2e.yml` in `PSD401/.github` plus a property-targeted ruleset). Open until Technology Services decides. |
| 19 | Away-game venues: wait for Arbiter, or should the athletics office enter league venues by hand? Until one happens, away games show no Directions button. | District AD | Closed 2026-10-08: wait for Arbiter (DECISIONS 39). |
| 20 | Does each school have a GoFan school page and an NFHS Network school page we can link to while per-game mapping (9) is sorted? Without links, no Tickets or Watch buttons appear. | District AD | Answered 2026-10-08 by research, see DECISIONS 46: GoFan `WA23221` (Gig Harbor) and `WA23302` (Peninsula); NFHS Network school pages for both; BSN Sideline stores; Puget Sound League site. |
| 21 | Sign-off on Better Auth instead of Auth.js for sign-in (reasons in `docs/PLAN.md` §2). | Technology Services | Closed 2026-10-08: approved (DECISIONS 14). |
| 22 | Which game gets the countdown hero? Plan: next varsity football game in the fall, otherwise the next varsity game. Is there a winter/spring equivalent (for example basketball)? | District AD | Open |
| 23 | Link targets for the families hub: the WIAA physical form, each school's ASB payment portal, the self-transportation form, insurance and health forms, eligibility and transfer rules. | School ADs, athletic secretaries | Open |
| 24 | Peninsula varsity football results for Sep 25 (at Timberline) and Oct 2 (vs Capital) aren't in the fixture. The site shows "Result not reported" until they're added. | Peninsula AD | Open |
| 25 | Fish Bowl all-time series record and the first year it was played (shown as placeholders on the hub). | School ADs | Open |
| 26 | Terraform for AWS: does it live in this repo (`infra/`) or a shared AWS infrastructure repo (like `psd-gcp-infra` for GCP)? Which account, region (assumed `us-west-2`) and state backend? | Technology Services | Open |
| 27 | Text alerts: which SMS provider (AWS End User Messaging/SNS with a registered 10DLC or toll-free number, or Twilio), and the monthly budget? Email uses AWS SES (answered 2026-10-09); what sending address and domain (for example `alerts@athletics.psd401.net`)? | Technology Services | Open |
| 28 | MCP before production: confirm tier MCP-3, gateway placement (QUESTIONS 16), whether dynamic client registration is acceptable or Client ID Metadata Documents are required, and who adds mcp-scan and an eval suite to the org's reusable CI. | Technology Services | Open |
