import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { HubHeader } from "../../../components/hub/hub-header";
import { HubFooter } from "../../../components/hub/hub-sections";
import a from "../../../components/hub/alerts.module.css";
import styles from "../../../components/hub/hub.module.css";
import { appDb } from "../../../lib/data/db";
import { listSchools } from "../../../lib/data/queries";
import { stopFollowAction } from "../actions";

export const metadata: Metadata = { title: "Stop alerts · Peninsula Athletics" };

type Search = Promise<{ f?: string; t?: string; done?: string; bad?: string }>;

/** The stop link in every message. A button press stops alerts, so link scanners can't. */
export default async function StopPage({ searchParams }: { searchParams: Search }) {
  await connection();
  const { f, t, done, bad } = await searchParams;
  const schools = await listSchools(await appDb());
  return (
    <div data-school="hub" className={styles.page}>
      <HubHeader />
      <main className={`ath-wrap ${a.main}`}>
        <h1 className={`ath-display ${a.h1}`}>Stop alerts</h1>
        {done ? (
          <p className={a.ok} role="status">
            Alerts stopped. You won&apos;t get any more messages from Peninsula Athletics. <Link href="/alerts">Follow again</Link> any time.
          </p>
        ) : bad || !f || !t ? (
          <p className={a.error} role="alert">
            That stop link didn&apos;t work. Use the link in your most recent message, or contact your school&apos;s athletics office.
          </p>
        ) : (
          <form className={a.card} action={stopFollowAction.bind(null, f, t)}>
            <p className={a.note}>This stops every team you follow, by text and email.</p>
            <button type="submit" className={`${styles.pill} ${styles.pillDark}`}>
              Stop all alerts
            </button>
          </form>
        )}
      </main>
      <HubFooter schools={schools} />
    </div>
  );
}
