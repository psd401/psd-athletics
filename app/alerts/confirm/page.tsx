import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";

import { HubHeader } from "../../../components/hub/hub-header";
import { HubFooter } from "../../../components/hub/hub-sections";
import a from "../../../components/hub/alerts.module.css";
import styles from "../../../components/hub/hub.module.css";
import { maskContact } from "../../../lib/alerts/contact";
import { devLastMessage } from "../../../lib/alerts/sender";
import { appDb } from "../../../lib/data/db";
import * as s from "../../../lib/db/schema";
import { listSchools, listTeams } from "../../../lib/data/queries";
import { levelLabel } from "../../../lib/schedule/games";
import { confirmFollowAction } from "../actions";

export const metadata: Metadata = { title: "Confirm alerts · Peninsula Athletics" };

type Search = Promise<{ f?: string; error?: string; done?: string }>;

/** Enter the code we sent. The address is only shown masked. */
export default async function ConfirmPage({ searchParams }: { searchParams: Search }) {
  await connection();
  const { f, error, done } = await searchParams;
  if (!f || !/^[0-9a-f-]{36}$/i.test(f)) notFound();
  const db = await appDb();
  const [follower] = await db.select().from(s.follower).where(eq(s.follower.id, f));
  if (!follower) notFound();
  const [schools, teams, followed] = await Promise.all([
    listSchools(db),
    listTeams(db),
    db.select({ teamId: s.followerTeam.teamId }).from(s.followerTeam).where(eq(s.followerTeam.followerId, f)),
  ]);
  const names = followed
    .map(({ teamId }) => teams.find((t) => t.id === teamId))
    .filter((t) => t !== undefined)
    .map((t) => `${schools.find((x) => x.id === t.schoolId)?.shortName} ${t.sport} · ${levelLabel[t.level]}`);
  const masked = maskContact({ kind: follower.contactKind, value: follower.contactValue });
  const dev = done ? null : devLastMessage(follower.contactValue);

  return (
    <div data-school="hub" className={styles.page}>
      <HubHeader />
      <main className={`ath-wrap ${a.main}`}>
        {done && follower.verifiedAt ? (
          <>
            <h1 className={`ath-display ${a.h1}`}>You&apos;re following</h1>
            <p className={a.ok} role="status">
              {names.join(", ")}. Messages go to {masked}. Every message has a link to stop.
            </p>
            <p className={a.lede}>
              <Link href="/alerts">Follow another team</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className={`ath-display ${a.h1}`}>Check your messages</h1>
            <p className={a.lede}>
              We sent a six-digit code to {masked}. Enter it here to start alerts for {names.join(", ")}.
            </p>
            {dev ? (
              <p className={a.dev}>Local development: nothing was sent. The message was: “{dev.body}”</p>
            ) : null}
            {error ? (
              <p className={a.error} role="alert">
                {error}
              </p>
            ) : null}
            <form className={a.card} action={confirmFollowAction.bind(null, follower.id)}>
              <label>
                Code
                <input name="code" required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} />
              </label>
              <button type="submit" className={`${styles.pill} ${styles.pillDark}`}>
                Start alerts
              </button>
            </form>
          </>
        )}
      </main>
      <HubFooter schools={schools} />
    </div>
  );
}
