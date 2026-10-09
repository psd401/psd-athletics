# Open questions

Things the district needs to answer. When one is answered, write the answer here, move the decision into `docs/DECISIONS.md` if it changes the build, and mark it closed.

## From the build spec (SPEC §12)

| # | Question | Who | Status |
|---|---|---|---|
| 1 | How do we get Arbiter data (API, partner feed, ICS)? Which entity ID (8486, 17802) is which school? | District AD, Technology Services | Open |
| 2 | Hosting and DNS for `athletics.psd401.net`. Standards point to AWS `us-west-2`; Amplify or CDK? Which account? | Technology Services | Open |
| 3 | SMS and email provider, and budget. | District AD | Open |
| 4 | Where photo-release opt-outs live (Final Forms or the student information system), and whether rosters carry jersey numbers. | District AD | Open |
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
| 12 | Stay internal, or go public after the publication checklist (which brings free CodeQL and secret scanning)? Either way, confirm photo releases for the students in `design/assets/photos/` or replace those photos. | Technology Services, District AD | Open |
| 13 | Is the school-themed public site (school colors and athletics typefaces as tokens layered on Nexus) an acceptable reading of standards/10, which otherwise asks for Nexus colors and type? | Technology Services | Open |
| 14 | Official source files for the GH and P logos. The current ones were cut from the school websites. | Communications, schools | Open |
| 15 | Is there a packaged Nexus for React 19? The vendored bundle targets React 18. | Technology Services | Open |
| 16 | Does the MCP server sit behind the planned MCP gateway at launch (standards/07; the gateway phase is on hold), or start with app-level OAuth? | Technology Services | Open |
