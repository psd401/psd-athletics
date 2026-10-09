// Local development and test sign-in. Off unless ATHLETICS_DEV_SIGN_IN=1, and
// only ever with the in-memory database on a localhost URL: it can't turn on
// against real Postgres or a public host. The people below are made up; their
// emails are on the district domain only so the domain checks still apply.

import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";

import type { Db } from "../db/client";
import * as s from "../db/schema";

/** A test value, not a secret: it only works on the local in-memory database. */
export const DEV_PASSWORD = "local-dev-only";

export function devSignInEnabled(env: Record<string, string | undefined> = process.env): boolean {
  if (env.ATHLETICS_DEV_SIGN_IN !== "1" || env.DATABASE_URL) return false;
  try {
    const host = new URL(env.BETTER_AUTH_URL ?? "http://localhost:3000").hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

type DevRole =
  | { role: "district_ad" }
  | { role: "school_ad" | "secretary"; school: string }
  | { role: "head_coach" | "assistant_coach" | "photographer"; school: string; sport: string };

export const devPeople: { id: string; name: string; email: string; roles: DevRole[] }[] = [
  { id: "dev-district-ad", name: "[Dev] District AD", email: "dev.district-ad@psd401.net", roles: [{ role: "district_ad" }] },
  { id: "dev-ghh-ad", name: "[Dev] Gig Harbor AD", email: "dev.ghh-ad@psd401.net", roles: [{ role: "school_ad", school: "ghhs" }] },
  { id: "dev-ghh-secretary", name: "[Dev] Gig Harbor Secretary", email: "dev.ghh-secretary@psd401.net", roles: [{ role: "secretary", school: "ghhs" }] },
  {
    id: "dev-ghh-soccer-coach",
    name: "[Dev] Girls Soccer Coach",
    email: "dev.ghh-soccer@psd401.net",
    roles: [{ role: "head_coach", school: "ghhs", sport: "girls-soccer" }],
  },
  {
    id: "dev-ghh-football-assistant",
    name: "[Dev] Football Assistant",
    email: "dev.ghh-football-asst@psd401.net",
    roles: [{ role: "assistant_coach", school: "ghhs", sport: "football" }],
  },
  {
    id: "dev-ghh-photographer",
    name: "[Dev] Volunteer Photographer",
    email: "dev.ghh-photos@psd401.net",
    roles: [{ role: "photographer", school: "ghhs", sport: "football" }],
  },
  {
    id: "dev-phs-volleyball-coach",
    name: "[Dev] Volleyball Coach",
    email: "dev.phs-volleyball@psd401.net",
    roles: [{ role: "head_coach", school: "phs", sport: "volleyball" }],
  },
];

/** Adds the dev people, their password accounts and roles to an in-memory database. */
export async function seedDevPeople(db: Db, startsOn: string): Promise<void> {
  const password = await hashPassword(DEV_PASSWORD);
  const teams = await db.select({ id: s.team.id, schoolId: s.team.schoolId, slug: s.team.slug, level: s.team.level }).from(s.team);
  for (const p of devPeople) {
    const existing = await db.select({ id: s.person.id }).from(s.person).where(eq(s.person.id, p.id));
    if (existing.length) continue;
    await db.insert(s.person).values({ id: p.id, name: p.name, email: p.email, emailVerified: true });
    await db.insert(s.account).values({ id: `${p.id}-credential`, accountId: p.id, providerId: "credential", userId: p.id, password });
    for (const r of p.roles) {
      const teamId =
        "sport" in r ? teams.find((t) => t.schoolId === r.school && t.slug === r.sport && t.level === "varsity")?.id ?? null : null;
      await db.insert(s.roleAssignment).values({
        personId: p.id,
        role: r.role,
        schoolId: "school" in r && !("sport" in r) ? r.school : null,
        teamId,
        startsOn,
        source: "dev",
      });
    }
  }
}
