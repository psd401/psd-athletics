// Following a team (SPEC §9): no account, a code to confirm (double opt-in
// for text and email alike), and a signed stop link in every message.

import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { and, eq, inArray } from "drizzle-orm";

import type { Db } from "../db/client";
import * as s from "../db/schema";
import { ValidationError } from "../studio/errors";
import { parseContact } from "./contact";
import type { Senders } from "./sender";

const CODE_MINUTES = 30;
const RESEND_MS = 2 * 60_000;
const MAX_TRIES = 5;

const identifier = (followerId: string) => `follow:${followerId}`;
const hash = (followerId: string, code: string) => createHash("sha256").update(`${followerId}:${code}`).digest("hex");

function secret(): string {
  const value = process.env.ALERTS_SECRET ?? process.env.BETTER_AUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") throw new Error("ALERTS_SECRET is not set");
  return "local-development-only-alerts-secret";
}

/** The token in a follower's stop link. */
export function stopToken(followerId: string): string {
  return createHmac("sha256", secret()).update(`stop:${followerId}`).digest("base64url");
}

export interface FollowInput {
  contact: string;
  teamIds: string[];
  wantsChanges: boolean;
  wantsFinals: boolean;
}

/** Save the follow (unconfirmed for a new contact) and send a six-digit code. */
export async function startFollow(db: Db, senders: Senders, input: FollowInput, now: Date): Promise<{ followerId: string; code: string }> {
  const contact = parseContact(input.contact);
  const sender = senders[contact.kind];
  if (!sender) {
    throw new ValidationError(contact.kind === "sms" ? "Text alerts aren't available yet. Use an email address for now." : "Alerts start later this season.");
  }
  const teamIds = [...new Set(input.teamIds.filter(Boolean))];
  if (!teamIds.length) throw new ValidationError("Pick a team to follow.");
  if (!input.wantsChanges && !input.wantsFinals) throw new ValidationError("Choose schedule changes, final scores, or both.");
  const teams = await db.select({ id: s.team.id }).from(s.team).where(inArray(s.team.id, teamIds));
  if (teams.length !== teamIds.length) throw new ValidationError("That team doesn't exist.");

  let [follower] = await db.select().from(s.follower).where(and(eq(s.follower.contactKind, contact.kind), eq(s.follower.contactValue, contact.value)));
  if (follower) {
    const [pending] = await db.select().from(s.verification).where(eq(s.verification.identifier, identifier(follower.id)));
    if (pending && now.getTime() - pending.createdAt.getTime() < RESEND_MS) {
      throw new ValidationError("We just sent a code. Check your messages, or try again in two minutes.");
    }
    [follower] = await db
      .update(s.follower)
      .set({ wantsChanges: input.wantsChanges, wantsFinals: input.wantsFinals })
      .where(eq(s.follower.id, follower.id))
      .returning();
  } else {
    [follower] = await db
      .insert(s.follower)
      .values({ contactKind: contact.kind, contactValue: contact.value, wantsChanges: input.wantsChanges, wantsFinals: input.wantsFinals })
      .returning();
  }
  const followerId = follower!.id;
  // Add teams; never drop ones already followed.
  await db.insert(s.followerTeam).values(teamIds.map((teamId) => ({ followerId, teamId }))).onConflictDoNothing();

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.delete(s.verification).where(eq(s.verification.identifier, identifier(followerId)));
  await db.insert(s.verification).values({
    id: `follow-${followerId}-${now.getTime()}`,
    identifier: identifier(followerId),
    value: `${hash(followerId, code)}:0`,
    expiresAt: new Date(now.getTime() + CODE_MINUTES * 60_000),
    createdAt: now,
    updatedAt: now,
  });
  await sender.send({
    to: contact.value,
    subject: "Your Peninsula Athletics code",
    body: `Your Peninsula Athletics alerts code is ${code}. It works for ${CODE_MINUTES} minutes. If you didn't ask for alerts, ignore this.`,
  });
  return { followerId, code };
}

/** Confirm with the code. Five wrong tries or 30 minutes ends the code. */
export async function confirmFollow(db: Db, { followerId, code }: { followerId: string; code: string }, now: Date) {
  const expired = new ValidationError("That code has expired. Sign up again for a new one.");
  const [pending] = await db.select().from(s.verification).where(eq(s.verification.identifier, identifier(followerId)));
  if (!pending || pending.expiresAt.getTime() < now.getTime()) throw expired;
  const [stored = "", triesText = "0"] = pending.value.split(":");
  const tries = Number(triesText);
  if (tries >= MAX_TRIES) throw expired;
  const given = hash(followerId, code.trim());
  if (given.length !== stored.length || !timingSafeEqual(Buffer.from(given), Buffer.from(stored))) {
    await db.update(s.verification).set({ value: `${stored}:${tries + 1}`, updatedAt: now }).where(eq(s.verification.id, pending.id));
    throw new ValidationError("That code doesn't match. Check the latest message we sent.");
  }
  await db.delete(s.verification).where(eq(s.verification.id, pending.id));
  const [follower] = await db.update(s.follower).set({ verifiedAt: now, stoppedAt: null }).where(eq(s.follower.id, followerId)).returning();
  return follower!;
}

/** Stop every alert for this follower. False when the link doesn't check out. */
export async function stopFollow(db: Db, followerId: string, token: string, now: Date): Promise<boolean> {
  const expected = stopToken(followerId);
  if (token.length !== expected.length || !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) return false;
  const rows = await db.update(s.follower).set({ stoppedAt: now }).where(eq(s.follower.id, followerId)).returning({ id: s.follower.id });
  return rows.length === 1;
}
