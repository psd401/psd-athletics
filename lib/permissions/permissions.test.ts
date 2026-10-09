// @vitest-environment node
import { describe, expect, it } from "vitest";

import { can, type Actor, type Action, type Scope } from "./index";

// Two schools, a few teams. Football and soccer at Gig Harbor, volleyball at Peninsula.
const GH = "ghhs";
const PHS = "phs";
const ghFootball = { schoolId: GH, teamId: "gh-fb" };
const ghSoccer = { schoolId: GH, teamId: "gh-soc" };
const phsVolleyball = { schoolId: PHS, teamId: "phs-vb" };
const ghSchool = { schoolId: GH, teamId: null };
const phsSchool = { schoolId: PHS, teamId: null };

const actor = (grants: Actor["grants"], assistantsMayPublish: string[] = []): Actor => ({
  personId: "p",
  grants,
  assistantsMayPublish: new Set(assistantsMayPublish),
});

const districtAd = actor([{ role: "district_ad", schoolId: null, teamId: null }]);
const ghAd = actor([{ role: "school_ad", schoolId: GH, teamId: null }]);
const ghSecretary = actor([{ role: "secretary", schoolId: GH, teamId: null }]);
const fbHead = actor([{ role: "head_coach", schoolId: GH, teamId: "gh-fb" }]);
const fbAssistant = actor([{ role: "assistant_coach", schoolId: GH, teamId: "gh-fb" }]);
const fbAssistantAllowed = actor([{ role: "assistant_coach", schoolId: GH, teamId: "gh-fb" }], ["gh-fb"]);
const fbPhotographer = actor([{ role: "photographer", schoolId: GH, teamId: "gh-fb" }]);
const nobody = actor([]);

describe("can", () => {
  it.each<[string, Actor, Action, Scope, boolean]>([
    // Head coaches publish their own teams, nobody else's (SPEC §2).
    ["head coach edits own team page", fbHead, "team.edit", ghFootball, true],
    ["head coach publishes own story", fbHead, "story.publish", ghFootball, true],
    ["head coach can't touch another team", fbHead, "story.draft", ghSoccer, false],
    ["head coach can't take down", fbHead, "content.takedown", ghFootball, false],
    ["head coach edits the roster", fbHead, "roster.edit", ghFootball, true],
    ["head coach confirms schedule changes", fbHead, "schedule.confirm", ghFootball, true],
    // Assistants draft; they publish only when the head coach allows it.
    ["assistant drafts", fbAssistant, "story.draft", ghFootball, true],
    ["assistant can't publish by default", fbAssistant, "story.publish", ghFootball, false],
    ["assistant publishes when allowed", fbAssistantAllowed, "story.publish", ghFootball, true],
    ["assistant posts from the sideline", fbAssistant, "feed.post", ghFootball, true],
    ["assistant can't edit the team page", fbAssistant, "team.edit", ghFootball, false],
    // Photographers upload, held for the coach. Nothing else, and no roster access.
    ["photographer uploads", fbPhotographer, "photo.upload", ghFootball, true],
    ["photographer can't publish albums", fbPhotographer, "album.publish", ghFootball, false],
    ["photographer can't see the roster", fbPhotographer, "roster.view", ghFootball, false],
    ["photographer can't draft", fbPhotographer, "story.draft", ghFootball, false],
    // School AD: anything at their school, nothing at the other.
    ["school AD publishes any team at school", ghAd, "story.publish", ghSoccer, true],
    ["school AD takes down at school", ghAd, "content.takedown", ghFootball, true],
    ["school AD manages people at school", ghAd, "people.manage", ghSchool, true],
    ["school AD sets rules", ghAd, "rules.manage", ghSchool, true],
    ["school AD can't act at the other school", ghAd, "story.publish", phsVolleyball, false],
    ["school AD can't post to official social", ghAd, "social.share", ghSchool, false],
    // Secretary: school pages, forms, contacts, uploads to school albums, invitations.
    ["secretary edits school pages", ghSecretary, "school.edit", ghSchool, true],
    ["secretary uploads to school albums", ghSecretary, "photo.upload", ghSchool, true],
    ["secretary invites people", ghSecretary, "people.invite", ghSchool, true],
    ["secretary can't publish a team story", ghSecretary, "story.publish", ghFootball, false],
    ["secretary can't manage roles", ghSecretary, "people.manage", ghSchool, false],
    // District AD: everything, both schools; the only role that shares to official social.
    ["district AD publishes anywhere", districtAd, "story.publish", phsVolleyball, true],
    ["district AD takes down anywhere", districtAd, "content.takedown", ghFootball, true],
    ["district AD shares to official social", districtAd, "social.share", phsSchool, true],
    // No assignment, no access.
    ["no roles, no access", nobody, "story.draft", ghFootball, false],
  ])("%s", (_name, who, action, scope, expected) => {
    expect(can(who, action, scope)).toBe(expected);
  });

  it("a team-scoped grant doesn't leak to the school level", () => {
    expect(can(fbHead, "team.edit", ghSchool)).toBe(false);
    expect(can(fbHead, "school.edit", ghSchool)).toBe(false);
  });

  it("a grant for one school's team doesn't apply to a same-id team elsewhere", () => {
    expect(can(fbHead, "team.edit", { schoolId: PHS, teamId: "gh-fb" })).toBe(false);
  });
});
