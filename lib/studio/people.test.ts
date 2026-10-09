// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { undoChange } from "../audit";
import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listTeams } from "../data/queries";
import { loadActor, type Actor } from "../permissions";
import { PermissionError, ValidationError } from "./errors";
import { accessListCsv, assignRole, endRole, listPeople } from "./people";

let db: Db;
let soccer: string;
let volleyball: string;
const now = new Date("2026-10-09T18:00:00Z"); // Friday, October 9 in Pacific time
const today = "2026-10-09";
let ghAd: Actor;
let ghSecretary: Actor;
let districtAd: Actor;

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  soccer = (await listTeams(db, { schoolId: "ghhs" })).find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!.id;
  volleyball = (await listTeams(db, { schoolId: "phs" })).find((t) => t.sportSlug === "volleyball" && t.level === "varsity")!.id;
  await db.insert(s.person).values([
    { id: "gh-ad", name: "GH AD", email: "gh-ad@psd401.net", emailVerified: true },
    { id: "gh-sec", name: "GH Secretary", email: "gh-sec@psd401.net", emailVerified: true },
    { id: "dist", name: "District AD", email: "dist@psd401.net", emailVerified: true },
  ]);
  await db.insert(s.roleAssignment).values([
    { personId: "gh-ad", role: "school_ad", schoolId: "ghhs", startsOn: "2026-08-01", source: "test" },
    { personId: "gh-sec", role: "secretary", schoolId: "ghhs", startsOn: "2026-08-01", source: "test" },
    { personId: "dist", role: "district_ad", startsOn: "2026-08-01", source: "test" },
  ]);
  ghAd = await loadActor(db, "gh-ad", today);
  ghSecretary = await loadActor(db, "gh-sec", today);
  districtAd = await loadActor(db, "dist", today);
}, 30_000);

const as = (actor: Actor) => ({ db, actor, now });

describe("assignRole", () => {
  it("adds a new coach by district email; they're invited until they sign in", async () => {
    const row = await assignRole(as(ghAd), { email: " New.Coach@PSD401.net ", name: "New Coach", role: "head_coach", teamId: soccer, startsOn: today });
    expect(row).toMatchObject({ role: "head_coach", teamId: soccer, schoolId: null, startsOn: today, endsOn: null, source: "manual" });

    const [person] = await db.select().from(s.person).where(eq(s.person.email, "new.coach@psd401.net"));
    expect(person).toMatchObject({ name: "New Coach", emailVerified: false });
    const actor = await loadActor(db, person!.id, today);
    expect(actor.grants).toEqual([{ role: "head_coach", schoolId: "ghhs", teamId: soccer }]);

    const people = await listPeople(db, { schoolIds: ["ghhs"], today });
    expect(people.find((p) => p.email === "new.coach@psd401.net")).toMatchObject({ role: "head_coach", scope: "Gig Harbor · Girls Soccer · Varsity", status: "Invited" });
    const log = await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, row.id));
    expect(log.map((l) => l.verb)).toEqual(["assign"]);
  });

  it("reuses the person when the email is already known, without renaming them", async () => {
    await assignRole(as(ghSecretary), { email: "GH-SEC@psd401.net", name: "Someone Else", role: "photographer", teamId: soccer, startsOn: today });
    const [person] = await db.select().from(s.person).where(eq(s.person.id, "gh-sec"));
    expect(person!.name).toBe("GH Secretary");
    expect((await loadActor(db, "gh-sec", today)).grants.map((g) => g.role).sort()).toEqual(["photographer", "secretary"]);
  });

  it("refuses bad input with a message that says what to fix", async () => {
    const base = { email: "x@psd401.net", name: "X", role: "assistant_coach" as const, teamId: soccer, startsOn: today };
    await expect(assignRole(as(ghAd), { ...base, email: "x@gmail.com" })).rejects.toThrow(new ValidationError("Use their psd401.net Google account."));
    await expect(assignRole(as(ghAd), { ...base, email: "x@psd401.net.evil.com" })).rejects.toThrow(ValidationError);
    await expect(assignRole(as(ghAd), { ...base, name: "  " })).rejects.toThrow(new ValidationError("The name can't be empty."));
    await expect(assignRole(as(ghAd), { ...base, teamId: undefined })).rejects.toThrow(new ValidationError("Pick a team for this role."));
    await expect(assignRole(as(ghAd), { ...base, endsOn: "2026-10-01" })).rejects.toThrow(new ValidationError("The end date can't be before the start date."));
    await expect(assignRole(as(ghAd), { ...base, startsOn: "October 9" })).rejects.toThrow(new ValidationError("Dates must look like 2026-10-09."));
    await expect(assignRole(as(ghAd), { ...base, role: "secretary", teamId: undefined })).rejects.toThrow(new ValidationError("Pick a school for this role."));
  });

  it("refuses a second current assignment for the same role and team", async () => {
    const input = { email: "dup@psd401.net", name: "Dup", role: "assistant_coach" as const, teamId: soccer, startsOn: today };
    await assignRole(as(ghAd), input);
    await expect(assignRole(as(ghAd), input)).rejects.toThrow(new ValidationError("They already have that role."));
  });

  it("keeps people within the schools and roles the person manages", async () => {
    const coach = { email: "v@psd401.net", name: "V", role: "head_coach" as const, teamId: volleyball, startsOn: today };
    await expect(assignRole(as(ghAd), coach)).rejects.toThrow(PermissionError);
    await expect(assignRole(as(ghSecretary), { email: "s2@psd401.net", name: "S2", role: "secretary", schoolId: "ghhs", startsOn: today })).rejects.toThrow(PermissionError);
    await expect(assignRole(as(ghAd), { email: "ad2@psd401.net", name: "AD2", role: "school_ad", schoolId: "ghhs", startsOn: today })).rejects.toThrow(PermissionError);
    const ad = await assignRole(as(districtAd), { email: "ad2@psd401.net", name: "AD2", role: "school_ad", schoolId: "phs", startsOn: today });
    expect(ad).toMatchObject({ role: "school_ad", schoolId: "phs", teamId: null });
  });
});

describe("endRole", () => {
  it("ends a current role yesterday so access stops today, and can be undone", async () => {
    await db.insert(s.person).values({ id: "old", name: "Old Coach", email: "old@psd401.net", emailVerified: true });
    const [row] = await db
      .insert(s.roleAssignment)
      .values({ personId: "old", role: "assistant_coach", teamId: soccer, startsOn: "2026-08-15", source: "test" })
      .returning();
    const ended = await endRole(as(ghAd), row!.id);
    expect(ended).toMatchObject({ endsOn: "2026-10-08" });
    expect((await loadActor(db, "old", today)).grants).toEqual([]);

    const [entry] = await db.select().from(s.auditLog).where(eq(s.auditLog.objectId, row!.id));
    expect(entry!.verb).toBe("end");
    expect(await undoChange(db, { auditId: entry!.id, actor: ghAd, now })).toEqual({ ok: true });
    expect((await loadActor(db, "old", today)).grants.map((g) => g.role)).toEqual(["assistant_coach"]);
  });

  it("removes a role that hasn't started yet", async () => {
    const row = await assignRole(as(ghAd), { email: "winter@psd401.net", name: "Winter Coach", role: "head_coach", teamId: soccer, startsOn: "2026-11-16" });
    expect((await listPeople(db, { schoolIds: ["ghhs"], today })).find((p) => p.email === "winter@psd401.net")?.status).toBe("Starts Mon, Nov 16");
    await endRole(as(ghAd), row.id);
    expect(await db.select().from(s.roleAssignment).where(eq(s.roleAssignment.id, row.id))).toEqual([]);
  });

  it("won't let people end their own access or someone else's school", async () => {
    const [own] = await db.select().from(s.roleAssignment).where(eq(s.roleAssignment.personId, "gh-ad"));
    await expect(endRole(as(ghAd), own!.id)).rejects.toThrow(new PermissionError("You can't end your own access. Ask another athletic director."));
    const phsAd = (await listPeople(db, { schoolIds: ["phs"], today })).find((p) => p.email === "ad2@psd401.net")!;
    await expect(endRole(as(ghAd), phsAd.assignmentId)).rejects.toThrow(PermissionError);
  });
});

describe("listPeople and the access list", () => {
  it("shows only the schools asked for, active once they've signed in", async () => {
    await db.insert(s.account).values({ id: "acc-sec", accountId: "gh-sec", providerId: "google", userId: "gh-sec" });
    const gh = await listPeople(db, { schoolIds: ["ghhs"], today });
    expect(gh.every((p) => p.schoolId === "ghhs")).toBe(true);
    expect(gh.find((p) => p.email === "gh-sec@psd401.net" && p.role === "secretary")?.status).toBe("Active");
    expect(gh.some((p) => p.email === "old@psd401.net" && p.endsOn === "2026-10-08")).toBe(false);
  });

  it("exports CSV that spreadsheets won't run as formulas", () => {
    const csv = accessListCsv([
      { assignmentId: "a", personId: "p", name: '=HYPERLINK("x"), Jr.', email: "p@psd401.net", role: "head_coach", schoolId: "ghhs", scope: "Gig Harbor · Football · Varsity", startsOn: "2026-08-01", endsOn: null, status: "Active" },
    ]);
    expect(csv.split("\r\n")).toEqual([
      "Name,Email,Role,School and team,Starts,Ends,Status",
      `"'=HYPERLINK(""x""), Jr.",p@psd401.net,Head coach,Gig Harbor · Football · Varsity,2026-08-01,,Active`,
      "",
    ]);
  });
});
