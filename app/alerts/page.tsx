import type { Metadata } from "next";
import { connection } from "next/server";

import { HubHeader } from "../../components/hub/hub-header";
import { HubFooter } from "../../components/hub/hub-sections";
import a from "../../components/hub/alerts.module.css";
import styles from "../../components/hub/hub.module.css";
import { appDb } from "../../lib/data/db";
import { listSchools, listTeams } from "../../lib/data/queries";
import { levelLabel } from "../../lib/schedule/games";
import { startFollowAction } from "./actions";

export const metadata: Metadata = { title: "Follow a team · Peninsula Athletics" };

type Search = Promise<{ team?: string; error?: string }>;

/** Follow a team by text or email (SPEC §9). Also where the home-page forms land with an error. */
export default async function AlertsPage({ searchParams }: { searchParams: Search }) {
  await connection();
  const db = await appDb();
  const [schools, teams] = await Promise.all([listSchools(db), listTeams(db)]);
  const { team, error } = await searchParams;
  return (
    <div data-school="hub" className={styles.page}>
      <HubHeader />
      <main className={`ath-wrap ${a.main}`}>
        <h1 className={`ath-display ${a.h1}`}>Follow a team</h1>
        <p className={a.lede}>
          Get one message when a game moves, and the final score if you want it. No app and no account. We send a code to confirm, and every message
          has a link to stop.
        </p>
        {error ? (
          <p className={a.error} role="alert">
            {error}
          </p>
        ) : null}
        <form className={a.card} action={startFollowAction}>
          <label>
            Team
            <select name="teamId" required defaultValue={teams.some((t) => t.id === team) ? team : ""}>
              <option value="" disabled>
                Choose a team
              </option>
              {schools.map((s) => (
                <optgroup key={s.id} label={s.name}>
                  {teams
                    .filter((t) => t.schoolId === s.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {`${s.shortName} · ${t.sport} · ${levelLabel[t.level]}`}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
          <label>
            Email or mobile number
            <input name="contact" required autoComplete="email" inputMode="email" maxLength={254} />
          </label>
          <fieldset className={a.checks}>
            <legend>Send me</legend>
            <label className={a.check}>
              <input type="checkbox" name="changes" defaultChecked /> Schedule changes
            </label>
            <label className={a.check}>
              <input type="checkbox" name="finals" /> Final scores
            </label>
          </fieldset>
          <button type="submit" className={`${styles.pill} ${styles.pillDark}`}>
            Send my code
          </button>
          <p className={a.note}>Messages go out between 7 am and 9 pm, except changes to a game that day.</p>
        </form>
      </main>
      <HubFooter schools={schools} />
    </div>
  );
}
