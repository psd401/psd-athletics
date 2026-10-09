// The alert outbox (SPEC §9): one message per change per follower, finals for
// those who asked, quiet hours 9 pm to 7 am Pacific except for same-day games,
// and a link to the game page and a stop link in every message.

import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { SITE_URL } from "../config/site";
import type { Db } from "../db/client";
import * as s from "../db/schema";
import { listGames } from "../data/queries";
import { levelLabel, opponentLine, result, type GameView } from "../schedule/games";
import { pacificDate, TIME_ZONE } from "../schedule/time";
import { stopToken } from "./follow";
import type { Senders } from "./sender";

const QUIET_START = 21;
const QUIET_END = 7;

async function gameView(db: Db, gameId: string): Promise<GameView | null> {
  const [row] = await db.select({ teamId: s.game.teamId, schoolId: s.team.schoolId }).from(s.game).innerJoin(s.team, eq(s.game.teamId, s.team.id)).where(eq(s.game.id, gameId));
  if (!row) return null;
  return (await listGames(db, { schoolId: row.schoolId })).find((g) => g.id === gameId) ?? null;
}

const teamName = (g: GameView) => `${g.schoolShortName} ${g.sport}${g.level === "varsity" ? "" : ` ${levelLabel[g.level]}`}`;
const link = (g: GameView) => `${SITE_URL}/${g.schoolSlug}/game/${g.id}`;

async function queue(db: Db, game: GameView, kind: "change" | "final", body: string, wants: "wantsChanges" | "wantsFinals", now: Date): Promise<number> {
  const followers = await db
    .select({ id: s.follower.id, channel: s.follower.contactKind })
    .from(s.follower)
    .innerJoin(s.followerTeam, eq(s.followerTeam.followerId, s.follower.id))
    .where(and(eq(s.followerTeam.teamId, game.teamId), isNotNull(s.follower.verifiedAt), isNull(s.follower.stoppedAt), eq(s.follower[wants], true)));
  if (!followers.length) return 0;
  const already = await db
    .select({ followerId: s.alertMessage.followerId })
    .from(s.alertMessage)
    .where(and(eq(s.alertMessage.gameId, game.id), eq(s.alertMessage.body, body), inArray(s.alertMessage.followerId, followers.map((f) => f.id))));
  const fresh = followers.filter((f) => !already.some((a) => a.followerId === f.id));
  if (!fresh.length) return 0;
  await db.insert(s.alertMessage).values(fresh.map((f) => ({ followerId: f.id, channel: f.channel, kind, gameId: game.id, body, createdAt: now })));
  return fresh.length;
}

/** "moved to Thu, Oct 8 at 7:30 PM", "is cancelled". Called after the sync rules decide a change goes out. */
export async function queueGameChange(db: Db, gameId: string, change: { what: string }, now: Date): Promise<number> {
  const game = await gameView(db, gameId);
  if (!game) return 0;
  return queue(db, game, "change", `${teamName(game)} ${opponentLine(game)} ${change.what}. Details: ${link(game)}`, "wantsChanges", now);
}

/** A final, from the recorded score only. No score, no message. */
export async function queueFinal(db: Db, gameId: string, now: Date): Promise<number> {
  const game = await gameView(db, gameId);
  if (!game || !result(game) || game.scoreUs === null || game.scoreThem === null) return 0;
  const body = `Final: ${game.schoolShortName} ${game.scoreUs}, ${game.opponent} ${game.scoreThem} (${game.sport}${game.level === "varsity" ? "" : ` ${levelLabel[game.level]}`}). Details: ${link(game)}`;
  return queue(db, game, "final", body, "wantsFinals", now);
}

function pacificHour(now: Date): number {
  return Number(new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "2-digit", hourCycle: "h23" }).format(now));
}

/** Send what's queued. Quiet hours hold everything except messages about today's games. */
export async function deliverOutbox(db: Db, senders: Senders, now: Date, limit = 200) {
  const hour = pacificHour(now);
  const quiet = hour >= QUIET_START || hour < QUIET_END;
  const today = pacificDate(now);
  const queued = await db
    .select({ msg: s.alertMessage, to: s.follower.contactValue, startDate: s.game.startDate, stoppedAt: s.follower.stoppedAt })
    .from(s.alertMessage)
    .innerJoin(s.follower, eq(s.alertMessage.followerId, s.follower.id))
    .leftJoin(s.game, eq(s.alertMessage.gameId, s.game.id))
    .where(eq(s.alertMessage.status, "queued"))
    .limit(limit);
  let sent = 0;
  let failed = 0;
  let waiting = 0;
  for (const { msg, to, startDate, stoppedAt } of queued) {
    if (stoppedAt) {
      await db.update(s.alertMessage).set({ status: "failed" }).where(eq(s.alertMessage.id, msg.id));
      continue;
    }
    if (quiet && startDate !== today) {
      waiting++;
      continue;
    }
    const sender = senders[msg.channel];
    if (!sender) {
      waiting++;
      continue;
    }
    const stop = `${SITE_URL}/alerts/stop?f=${msg.followerId}&t=${stopToken(msg.followerId)}`;
    try {
      const { providerId } = await sender.send({
        to,
        subject: msg.kind === "final" ? "Final score" : "Schedule change",
        body: `${msg.body}\n\nStop these alerts: ${stop}`,
      });
      await db.update(s.alertMessage).set({ status: "sent", sentAt: now, providerId }).where(eq(s.alertMessage.id, msg.id));
      sent++;
    } catch {
      await db.update(s.alertMessage).set({ status: "failed" }).where(eq(s.alertMessage.id, msg.id));
      failed++;
    }
  }
  return { sent, failed, waiting };
}
