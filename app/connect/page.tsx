import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { verifyOAuthQueryParams } from "@better-auth/oauth-provider";
import { eq } from "drizzle-orm";

import "../../vendor/nexus/bundle.css";
import styles from "../../components/studio/studio.module.css";
import { TrustFooter } from "../../components/studio/trust-footer";
import { ConsentButtons } from "../../components/studio/consent-buttons";
import { oauthQuery } from "../../lib/auth/oauth-flow";
import { currentPerson, getAuth } from "../../lib/auth/server";
import { appDb } from "../../lib/data/db";
import { listSchools, listTeams } from "../../lib/data/queries";
import * as s from "../../lib/db/schema";
import { can, loadActor } from "../../lib/permissions";
import { levelLabel } from "../../lib/schedule/games";
import { currentTime, pacificDate } from "../../lib/schedule/time";

export const metadata: Metadata = { title: "Connect an assistant · Athletics Studio" };

/** The consent screen when an AI assistant asks to work in the Studio as this person (SPEC §8). */
export default async function ConnectPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = oauthQuery(await searchParams);
  if (!query) notFound();
  const auth = await getAuth();
  const { secret } = await auth.$context;
  if (!(await verifyOAuthQueryParams(query, secret))) notFound();
  const person = await currentPerson();
  if (!person) redirect(`/sign-in?${query}`);

  const db = await appDb();
  const clientId = new URLSearchParams(query).get("client_id") ?? "";
  const [client] = await db.select({ name: s.oauthClient.name, uri: s.oauthClient.uri }).from(s.oauthClient).where(eq(s.oauthClient.clientId, clientId));
  if (!client) notFound();
  const name = client.name?.trim() || "An AI assistant";
  const [actor, schools, teams] = await Promise.all([loadActor(db, person.id, pacificDate(currentTime())), listSchools(db), listTeams(db)]);
  const mine = teams.filter((t) => can(actor, "story.draft", { schoolId: t.schoolId, teamId: t.id }));
  const school = (id: string) => schools.find((x) => x.id === id)?.shortName ?? "";

  return (
    <div data-theme="nexus" className={styles.shell}>
      <header className="nx-header">
        <span className="nx-header__mark">Athletics Studio</span>
      </header>
      <main className={styles.main}>
        <div className={`nx-card ${styles.narrow}`}>
          <div className={styles.stack}>
            <h1 className={styles.title}>Connect {name}?</h1>
            <p className={styles.lede}>
              {name} will work in the Athletics Studio as you, {person.name}. It can do what you can, nothing more, and everything it does is logged.
            </p>
            <div>
              <h2 className="nx-card__title">It can</h2>
              <ul>
                <li>Read schedules and results.</li>
                {mine.length ? (
                  <li>
                    Write and publish stories, edit the roster and post to the team feed, as far as your role allows, for{" "}
                    {mine.map((t) => `${school(t.schoolId)} ${t.sport} · ${levelLabel[t.level]}`).join(", ")}.
                  </li>
                ) : (
                  <li>Nothing else yet: you don&apos;t have a team assignment.</li>
                )}
              </ul>
              <h2 className="nx-card__title">It can&apos;t</h2>
              <ul>
                <li>Do anything your role can&apos;t, post to official school accounts, or change the schedule.</li>
                <li>See student contact, medical or eligibility information.</li>
              </ul>
            </div>
            <p className={styles.muted}>Everything it does shows in Activity and can be undone for 30 minutes. Turn it off any time in Studio → Assistants.</p>
            <ConsentButtons query={query} />
          </div>
        </div>
      </main>
      <TrustFooter items={["Works as you, never more", "Logged in Activity", "Undo for 30 minutes"]} />
    </div>
  );
}
