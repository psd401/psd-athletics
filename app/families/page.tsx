import type { Metadata } from "next";
import { connection } from "next/server";

import { HubHeader } from "../../components/hub/hub-header";
import { HubFooter } from "../../components/hub/hub-sections";
import f from "../../components/hub/families.module.css";
import styles from "../../components/hub/hub.module.css";
import { appDb } from "../../lib/data/db";
import { listSchools } from "../../lib/data/queries";
import { familySteps } from "../../lib/families/steps";

export const metadata: Metadata = { title: "For families · Peninsula Athletics" };

/** Everything a family does before the first practice, both schools (SPEC §4). */
export default async function FamiliesPage() {
  await connection();
  const schools = await listSchools(await appDb());
  return (
    <div data-school="hub" className={styles.page}>
      <HubHeader />
      <main>
        <section className={`${f.head} ath-on-dark`} aria-labelledby="families-title">
          <div className={`ath-wrap ${f.headIn}`}>
            <span className={`ath-label ${f.kicker}`}>For families · both schools</span>
            <h1 id="families-title" className={`ath-display ${f.h1}`}>
              Get your athlete on the field
            </h1>
            <p className={f.lede}>
              Same forms, same steps at Gig Harbor and Peninsula. Finish these before the first practice. Registration stays in Final
              Forms; this page explains each step and links to it.
            </p>
          </div>
        </section>
        <div className={`ath-wrap ${f.body}`}>
          <ol className={f.steps}>
            {familySteps.map((step) => (
              <li key={step.id} id={step.id} className={f.step}>
                <span className={f.num} aria-hidden="true" />
                <div className={f.stepBody}>
                  <h2 className={f.h2}>{step.title}</h2>
                  <ul className={f.how}>
                    {step.how.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                  {step.link ? (
                    <a className={`${styles.pill} ${styles.pillDark} ${f.link}`} href={step.link.href}>
                      {step.link.label}
                    </a>
                  ) : (
                    <p className={f.soon}>Link coming soon. Your athletics office can help now.</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
          <aside className={f.aside} aria-label="Athletics offices">
            {schools.map((school) => (
              <div key={school.id} className={f.card}>
                <h2 className={`ath-label ${f.cardTitle}`}>{school.name}</h2>
                {school.contacts.map((c) => (
                  <p key={c.name} className={f.contact}>
                    <b>{c.name}</b>, {c.role}
                  </p>
                ))}
              </div>
            ))}
          </aside>
        </div>
      </main>
      <HubFooter schools={schools} />
    </div>
  );
}
