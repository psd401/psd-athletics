import Image from "next/image";
import { backgroundAlt } from "../../lib/schools/photos";
import Link from "next/link";
import type { ReactNode } from "react";

import type { SchoolView, TeamView } from "../../lib/data/queries";
import { familySteps, type FamilyIcon } from "../../lib/families/steps";
import { LEAGUE_URL, schoolContent } from "../../lib/schools/content";
import { levelLabel, type FishBowlResult } from "../../lib/schedule/games";
import { formatShortDate } from "../../lib/schedule/time";
import { BusIcon, CardIcon, FormIcon, InfoIcon, PulseIcon, ShieldIcon } from "../athletics/icons";
import { startFollowAction } from "../../app/alerts/actions";
import alerts from "./alerts.module.css";
import styles from "./hub.module.css";

// ------------------------------------------------------------ Fish Bowl

export function FishBowlBand({ result }: { result: FishBowlResult | null }) {
  if (!result) return null;
  const year = Number(result.date.slice(0, 4));
  const sideClass = (schoolId: string) => (schoolId === "ghhs" ? styles.sideTides : styles.sideHawks);
  const [first, second] = result.sides;
  return (
    <section className={`${styles.fish} ${styles.sec} ath-on-dark`} id="fishbowl" aria-labelledby="fishbowl-title">
      <Image className={styles.fishShot} src="/images/ghhs-fishbowl-crowd.jpg" alt={backgroundAlt("/images/ghhs-fishbowl-crowd.jpg")} fill sizes="100vw" />
      <svg className={styles.fishWaves} viewBox="0 0 1440 600" preserveAspectRatio="none" aria-hidden="true">
        <path className={styles.waveTides} d="M0 520 C 240 470, 480 570, 720 520" />
        <path className={styles.waveTides} d="M0 548 C 240 498, 480 598, 720 548" />
        <path className={styles.waveHawks} d="M720 470 L 900 540 L 720 610" />
        <path className={styles.waveHawks} d="M780 470 L 960 540 L 780 610" />
      </svg>
      <div className={`ath-wrap ${styles.fishIn}`}>
        <div className={styles.secTitle}>
          <span className={`ath-label ${styles.fishKicker}`}>The rivalry that splits the peninsula</span>
          <h2 id="fishbowl-title" className={`ath-display ${styles.fishTitle}`}>
            The Fish Bowl
          </h2>
          <p className={styles.fishIntro}>
            Every September, Gig Harbor and Peninsula settle it on the field. One night, two sidelines, a whole community in the
            stands.
          </p>
        </div>
        {first && second ? (
          <div className={styles.scoreSplit}>
            <div className={`${styles.scoreSide} ${sideClass(first.schoolId)}`}>
              <span className={`ath-label ${styles.sideLabel}`}>
                {first.schoolShortName} {first.mascot}
                {first.winner ? " · Winner" : ""}
              </span>
              <span className={`ath-display ${styles.scoreNum}`}>{first.score}</span>
            </div>
            <div className={styles.scoreMid}>
              <span className={`ath-label ${styles.scoreMidLabel}`}>Final</span>
              <span className={`ath-display ${styles.scoreMidYear}`}>{year}</span>
              <p className={styles.scoreMidWhen}>
                {formatShortDate(result.date)}
                <br />
                at {result.hostShortName}
              </p>
            </div>
            <div className={`${styles.scoreSide} ${sideClass(second.schoolId)}`}>
              <span className={`ath-label ${styles.sideLabel}`}>
                {second.schoolShortName} {second.mascot}
                {second.winner ? " · Winner" : ""}
              </span>
              <span className={`ath-display ${styles.scoreNum}`}>{second.score}</span>
            </div>
          </div>
        ) : null}
        <dl className={styles.facts}>
          <div>
            <dt>All-time series</dt>
            <dd>[series record]</dd>
          </div>
          <div>
            <dt>First played</dt>
            <dd>[year]</dd>
          </div>
          <div>
            <dt>Next Fish Bowl</dt>
            <dd>September {year + 1}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ school cards

interface Honor {
  figure: string;
  title: string;
}

export function SchoolCards({ schools }: { schools: { school: SchoolView; honors: Honor[] }[] }) {
  return (
    <section className={styles.sec} aria-labelledby="sideline-title">
      <div className="ath-wrap">
        <div className={styles.secHead}>
          <h2 id="sideline-title" className={`ath-display ${styles.h2}`}>
            Pick your sideline
          </h2>
          <p className={styles.intro}>
            Each school runs its own site, team pages and news. Schedules, scores and alerts stay in sync across both.
          </p>
        </div>
        <div className={styles.schools}>
          {schools.map(({ school, honors: list }) => {
            const tides = school.id === "ghhs";
            const links = schoolContent[school.slug]?.links;
            return (
              <div key={school.id} className={`${styles.schoolCard} ${tides ? styles.tides : styles.hawks} ath-on-dark`}>
                <div className={styles.cardTop}>
                  <div className={styles.secTitle}>
                    <span className={`ath-label ${styles.cardPath}`}>athletics.psd401.net/{school.slug}</span>
                    <h3 className={`ath-display ${styles.cardName}`}>
                      {school.shortName}
                      <br />
                      {school.mascot}
                    </h3>
                  </div>
                  {tides ? (
                    <Image className={styles.cardLogo} src={school.logoPath} alt="Gig Harbor GH logo" width={104} height={88} />
                  ) : (
                    <span className={styles.cardLogoTile}>
                      <Image src={school.logoPath} alt="Peninsula P logo" width={78} height={60} />
                    </span>
                  )}
                </div>
                <div className={styles.secTitle}>
                  <ul className={styles.honors} aria-label={`${school.shortName} highlights`}>
                    {list.map((h) => (
                      <li key={h.title}>
                        <p className={`ath-display ${styles.honorFigure}`}>{h.figure}</p>
                        <span className={`ath-label ${styles.honorTitle}`}>{h.title}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className={styles.quick}>
                    <li>
                      <a href={`/${school.slug}#teams`}>
                        Teams <span aria-hidden="true">→</span>
                      </a>
                    </li>
                    <li>
                      <a href={`/${school.slug}/schedule`}>
                        Schedule <span aria-hidden="true">→</span>
                      </a>
                    </li>
                    <li>
                      <a href={`/${school.slug}#results`}>
                        Scores <span aria-hidden="true">→</span>
                      </a>
                    </li>
                    {links ? (
                      <>
                        <li>
                          <a href={links.watch}>
                            Watch live <span aria-hidden="true">→</span>
                          </a>
                        </li>
                        <li>
                          <a href={links.tickets}>
                            Tickets <span aria-hidden="true">→</span>
                          </a>
                        </li>
                        <li>
                          <a href={links.store}>
                            Sideline Store <span aria-hidden="true">→</span>
                          </a>
                        </li>
                      </>
                    ) : null}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ families

const familyIcons: Record<FamilyIcon, ReactNode> = {
  form: <FormIcon />,
  pulse: <PulseIcon />,
  card: <CardIcon />,
  bus: <BusIcon />,
  shield: <ShieldIcon />,
  info: <InfoIcon />,
};

export function FamiliesGrid() {
  return (
    <section className={`${styles.sec} ${styles.secTight}`} id="families" aria-labelledby="families-title">
      <div className="ath-wrap">
        <div className={styles.secHead}>
          <div className={styles.secTitle}>
            <span className={`ath-label ${styles.kicker}`}>For families · both schools</span>
            <h2 id="families-title" className={`ath-display ${styles.h2}`}>
              Get your athlete on the field
            </h2>
          </div>
          <p className={styles.intro}>Same forms, same steps at Gig Harbor and Peninsula. Finish these before the first practice.</p>
        </div>
        <ul className={styles.fam}>
          {familySteps.map((step) => {
            const body = (
              <>
                <span className={styles.famIco}>{familyIcons[step.icon]}</span>
                <h3 className={styles.famTitle}>{step.title}</h3>
                <p className={styles.famText}>{step.summary}</p>
              </>
            );
            return (
              <li key={step.id}>
                {step.link ? (
                  <a className={styles.famItem} href={step.link.href}>
                    {body}
                  </a>
                ) : (
                  <Link className={styles.famItem} href={`/families#${step.id}`}>
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <p className={styles.famMore}>
          <Link className={`${styles.pill} ${styles.pillDark}`} href="/families">
            Every step for families
          </Link>
        </p>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ alerts

export function AlertsSignup({ teams, schools }: { teams: TeamView[]; schools: SchoolView[] }) {
  const name = (t: TeamView) => schools.find((s) => s.id === t.schoolId)?.shortName ?? "";
  return (
    <section className={`${styles.sec} ${styles.secTight}`} id="alerts" aria-labelledby="alerts-title">
      <div className="ath-wrap">
        <div className={styles.alerts}>
          <div className={styles.alertsCopy}>
            <span className={`ath-label ${styles.alertsKicker}`}>Never miss a change</span>
            <h2 id="alerts-title" className={`ath-display ${styles.alertsTitle}`}>
              Rain delay? Time change? You&apos;ll know first.
            </h2>
            <p className={styles.alertsText}>
              Follow any team and get a text or email the moment Arbiter changes a game. No app, no account, no Instagram
              required. Grandparents welcome.
            </p>
          </div>
          <form className={styles.form} action={startFollowAction} aria-labelledby="alerts-title" aria-describedby="alerts-note">
            <div className={styles.field}>
              <label htmlFor="hub-team">Team</label>
              <select id="hub-team" name="teamId" required defaultValue="">
                <option value="" disabled>
                  Choose a team
                </option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {name(t)} · {t.sport} · {levelLabel[t.level]}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="hub-contact">Email or mobile number</label>
              <input id="hub-contact" name="contact" type="text" required autoComplete="email" inputMode="email" placeholder="name@email.com" />
            </div>
            <fieldset className={alerts.checks}>
              <legend className="ath-visually-hidden">Send me</legend>
              <label className={alerts.check}>
                <input type="checkbox" name="changes" defaultChecked /> Schedule changes
              </label>
              <label className={alerts.check}>
                <input type="checkbox" name="finals" /> Final scores
              </label>
            </fieldset>
            <button type="submit" className={`${styles.pill} ${styles.pillDark} ${styles.submit}`}>
              Start alerts
            </button>
            <span id="alerts-note" className={styles.formNote}>
              No account. We send a code to confirm; every message has a link to stop. Messages go out 7 am to 9 pm, except changes to a game that day.
            </span>
          </form>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ footer

const NOTICE =
  "Peninsula School District does not discriminate in any programs or activities on the basis of sex, race, creed, religion, color, national origin, age, veteran or military status, sexual orientation, gender expression or identity, disability, or the use of a trained dog guide or service animal.";

export function HubFooter({ schools }: { schools: SchoolView[] }) {
  return (
    <footer className={`${styles.foot} ath-on-dark`}>
      <div className={`ath-wrap ${styles.footIn}`}>
        <div className={styles.footGrid}>
          <div className={styles.footCol}>
            <span className={`ath-display ${styles.footTitle}`}>Peninsula Athletics</span>
            <span>
              Interscholastic sports promote sportsmanship and citizenship. This is where Gig Harbor and Peninsula families find
              every game, score and form.
            </span>
          </div>
          {schools.map((school) => {
            const [street, ...rest] = school.address.split(", ");
            const lead = school.contacts.find((c) => c.role === "Athletic Director") ?? school.contacts[0];
            return (
              <div className={styles.footCol} key={school.id}>
                <h2 className={`ath-label ${styles.footLabel}`}>{school.shortName} High</h2>
                <span>
                  {street}
                  <br />
                  {rest.join(", ")}
                </span>
                {lead ? (
                  <span>
                    {lead.role}
                    <br />
                    <span className={styles.footStrong}>{lead.name}</span>
                  </span>
                ) : null}
                <a href={`/${school.slug}`}>{school.mascot} Athletics</a>
              </div>
            );
          })}
          <div className={styles.footCol}>
            <h2 className={`ath-label ${styles.footLabel}`}>Links</h2>
            <ul className={styles.footList}>
              <li>
                <a href={LEAGUE_URL}>Puget Sound League</a>
              </li>
              <li>
                <a href="https://www.wiaa.com">WIAA</a>
              </li>
              <li>
                <a href="https://www.nfhsnetwork.com">NFHS Network</a>
              </li>
              <li>
                <a href="https://gofan.co">GoFan tickets</a>
              </li>
              <li>
                <a href="https://www.psd401.net">Peninsula School District</a>
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.notice}>{NOTICE}</p>
      </div>
    </footer>
  );
}
