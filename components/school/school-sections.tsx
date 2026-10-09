import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { SchoolView, TeamView } from "../../lib/data/queries";
import { LEAGUE_URL, type SchoolContent } from "../../lib/schools/content";
import { levelLabel, opponentLine, result, type GameView } from "../../lib/schedule/games";
import type { FormCard } from "../../lib/schedule/school";
import { formatShortDate } from "../../lib/schedule/time";
import { BackIcon, BagIcon, BellIcon, FormIcon, TicketIcon, WatchIcon } from "../athletics/icons";
import styles from "./school.module.css";
import { TeamsMenu, type MenuSeason } from "./teams-menu";

import { FINAL_FORMS_URL } from "../../lib/families/steps";

export const FINAL_FORMS = FINAL_FORMS_URL;

// ------------------------------------------------------------ top of page

export function UtilityBar({ other, content }: { other: SchoolView; content: SchoolContent }) {
  return (
    <div className={`${styles.util} ath-on-dark`}>
      <div className={`ath-wrap ${styles.utilIn}`}>
        <Link href="/">
          <BackIcon />
          Peninsula Athletics
        </Link>
        <span className={styles.utilSep} aria-hidden="true">
          |
        </span>
        <Link href={`/${other.slug}`}>
          {other.shortName} {other.mascot}
        </Link>
        <span className={styles.utilEnd}>
          <a href={content.links.tickets}>Tickets</a>
          <a href={content.links.watch}>Watch live</a>
          <a href={FINAL_FORMS}>Register</a>
          <a href={content.links.store}>Sideline Store</a>
        </span>
      </div>
    </div>
  );
}

export function Masthead({
  school,
  seasons,
  current = "home",
  traditionNav = "Tradition",
}: {
  school: SchoolView;
  seasons: MenuSeason[];
  traditionNav?: string;
  current?: "home" | "schedule" | "team" | "staff";
}) {
  const tile = school.id === "phs"; // The P logo disappears on green; it sits on a white tile (docs/BRAND.md).
  const home = `/${school.slug}`;
  // On the home page the section links stay in-page; elsewhere they go back to it.
  const section = (id: string) => (current === "home" ? `#${id}` : `${home}#${id}`);
  return (
    <header className={`${styles.mast} ath-on-dark`}>
      <div className={`ath-wrap ${styles.mastIn}`}>
        <Link href={home} className={styles.brand}>
          {tile ? (
            <span className={styles.brandTile}>
              <Image src={school.logoPath} alt="" width={46} height={36} />
            </span>
          ) : (
            <Image className={styles.brandLogo} src={school.logoPath} alt="" width={64} height={54} />
          )}
          <span className={styles.brandText}>
            <span className={`ath-label ${styles.brandSchool}`}>{school.shortName}</span>
            <span className={`ath-display ${styles.brandMascot}`}>{school.mascot}</span>
          </span>
        </Link>
        <nav aria-label={`${school.mascot} Athletics`}>
          <ul className={styles.nav}>
            <li>{current === "home" ? <TeamsMenu seasons={seasons} /> : <a href={section("teams")}>Teams</a>}</li>
            <li>
              <Link href={`${home}/schedule`} aria-current={current === "schedule" ? "page" : undefined}>
                Schedule
              </Link>
            </li>
            <li>
              <a href={section("results")}>Scores</a>
            </li>
            <li>
              <Link href={`${home}/staff`} aria-current={current === "staff" ? "page" : undefined}>
                Coaches
              </Link>
            </li>
            <li>
              <a href={section("fan")}>Fan Zone</a>
            </li>
            <li>
              <a href={section("tradition")}>{traditionNav}</a>
            </li>
            <li>
              <a href={section("fan")}>Forms</a>
            </li>
          </ul>
        </nav>
        <a className={`${styles.btn} ${styles.btnAccent} ${styles.followBtn}`} href={section("alerts")} aria-label="Follow a team">
          <BellIcon />
          <span className={styles.followLabel}>Follow a team</span>
        </a>
      </div>
    </header>
  );
}

// ------------------------------------------------------------ finals and form

export function LatestFinals({ games }: { games: GameView[] }) {
  if (games.length === 0) return null;
  return (
    <section className={`${styles.sec} ${styles.secTight}`} id="results" aria-labelledby="results-title">
      <div className="ath-wrap">
        <div className={styles.secHead}>
          <h2 id="results-title" className={`ath-display ${styles.h2} ${styles.h2Small}`}>
            Latest finals
          </h2>
        </div>
        <ul className={styles.results}>
          {games.map((game) => {
            const r = result(game)!;
            const word = r === "W" ? "Win" : r === "L" ? "Loss" : "Tie";
            return (
              <li key={game.id}>
                <div className={styles.res}>
                  <div className={styles.resHead}>
                    <span className={`ath-label ${styles.resSport}`}>
                      {game.sport}
                      {game.level === "varsity" ? "" : ` · ${levelLabel[game.level]}`}
                    </span>
                    <span className={`${styles.resTag} ${styles[`res${r}`]}`}>
                      <span aria-hidden="true">{r}</span>
                      <span className="ath-visually-hidden">{word}</span>
                    </span>
                  </div>
                  <p className={`ath-display ${styles.resScore}`}>
                    <span className={styles.us}>{game.scoreUs}</span>
                    <span className={styles.dash} aria-hidden="true">
                      –
                    </span>
                    <span className="ath-visually-hidden"> to </span>
                    <span className={styles.them}>{game.scoreThem}</span>
                  </p>
                  <span className={styles.resOpp}>{opponentLine(game)}</span>
                  <span className={styles.resDate}>{formatShortDate(game.startDate)}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function SeasonForm({ cards, schoolSlug }: { cards: FormCard[]; schoolSlug: string }) {
  if (cards.length === 0) return null;
  return (
    <section className={`${styles.sec} ${styles.secTight}`} aria-label="Season form">
      <div className="ath-wrap">
      <ul className={styles.form3}>
        {cards.map((card, i) => (
          <li key={card.teamId}>
            <Link
              href={`/${schoolSlug}/teams/${card.sportSlug}${card.level === "varsity" ? "" : `?level=${card.level}`}`}
              className={`${styles.formCard} ${i === 0 ? `${styles.formCardLead} ath-on-dark` : ""}`}
            >
              <h3 className={`ath-label ${styles.formSport}`} style={{ margin: 0 }}>
                {card.sport} · {levelLabel[card.level]}
              </h3>
              <div className={styles.formRecordRow}>
                <p className={`ath-display ${styles.formRecord}`}>
                  <span className="ath-visually-hidden">Record </span>
                  {card.record}
                </p>
                {card.aside.length > 0 ? (
                  <p className={styles.formAside}>
                    {card.aside[0]}
                    {card.aside[1] ? (
                      <>
                        <br />
                        {card.aside[1]}
                      </>
                    ) : null}
                  </p>
                ) : null}
              </div>
              <ol className={styles.form} aria-label={card.formLabel}>
                {card.form.map((r, j) => (
                  <li key={j} className={styles[`form${r}`]} aria-hidden="true">
                    {r}
                  </li>
                ))}
              </ol>
              {card.next ? <p className={styles.formNext}>{card.next}</p> : null}
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ tradition

export function Tradition({
  school,
  content,
  honors,
}: {
  school: SchoolView;
  content: SchoolContent;
  honors: { figure: string; title: string; detail: string | null }[];
}) {
  if (honors.length === 0) return null;
  return (
    <section className={`${styles.sec} ${styles.hero} ath-on-dark`} id="tradition" aria-labelledby="tradition-title">
      <Image className={styles.heroShot} src={content.traditionPhoto} alt="" fill sizes="100vw" style={{ opacity: 0.22 }} />
      <div className={`ath-wrap ${styles.traditionIn}`}>
        <div className={styles.secTitle}>
          <span className={`ath-label ${styles.traditionKicker}`}>{content.traditionKicker(school.founded)}</span>
          <h2 id="tradition-title" className={`ath-display ${styles.traditionTitle}`}>
            {content.traditionTitle}
          </h2>
        </div>
        <ul className={styles.titles}>
          {honors.map((h) => (
            <li key={h.title}>
              <p className={`ath-display ${styles.titleFigure}`}>{h.figure}</p>
              <h3 className={styles.titleName}>{h.title}</h3>
              {h.detail ? <p className={styles.titleDetail}>{h.detail}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ fan zone

export function FanZone({ school, content }: { school: SchoolView; content: SchoolContent }) {
  const items: { icon: ReactNode; title: string; text: string; href?: string }[] = [
    { icon: <TicketIcon />, title: "Tickets", text: "Digital tickets on GoFan", href: content.links.tickets },
    { icon: <WatchIcon />, title: "Watch live", text: "Home games on the NFHS Network", href: content.links.watch },
    { icon: <BagIcon />, title: "Sideline Store", text: `Official ${school.mascot} gear`, href: content.links.store },
    { icon: <FormIcon />, title: "Register to play", text: "Final Forms, physicals, ASB", href: FINAL_FORMS },
  ];
  return (
    <section className={styles.sec} id="fan" aria-labelledby="fan-title">
      <div className="ath-wrap">
        <div className={styles.secHead}>
          <h2 id="fan-title" className={`ath-display ${styles.h2}`}>
            Fan Zone
          </h2>
          <p className={styles.intro}>{content.fanIntro}</p>
        </div>
        <ul className={styles.fan}>
          {items.map((item) => {
            const body = (
              <>
                <span className={styles.fanIco}>{item.icon}</span>
                <h3 className={styles.fanTitle}>{item.title}</h3>
                <p className={styles.fanText}>{item.text}</p>
              </>
            );
            return (
              <li key={item.title}>
                {item.href ? (
                  <a className={styles.fanItem} href={item.href}>
                    {body}
                  </a>
                ) : (
                  <div className={styles.fanItem}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ alerts, partners, footer

export function SchoolAlerts({ school, content, teams }: { school: SchoolView; content: SchoolContent; teams: TeamView[] }) {
  return (
    <section className={`${styles.hero} ${styles.alertsSec} ath-on-dark`} id="alerts" aria-labelledby="alerts-title">
      <div className={`ath-wrap ${styles.alerts}`}>
        <div className={styles.alertsCopy}>
          <span className={`ath-label ${styles.traditionKicker}`}>{content.alertsKicker}</span>
          <h2 id="alerts-title" className={`ath-display ${styles.alertsTitle}`}>
            {content.alertsTitle}
          </h2>
          <p className={styles.alertsText}>{content.alertsText}</p>
        </div>
        {/* Alerts ship in Phase 6 (DECISIONS 15). */}
        <form className={styles.alertForm} aria-labelledby="alerts-title" aria-describedby="school-alerts-note">
          <fieldset className={styles.alertForm} disabled>
            <div className={styles.field}>
              <label htmlFor={`${school.slug}-team`}>Teams</label>
              <select id={`${school.slug}-team`} defaultValue="">
                <option value="" disabled>
                  Choose a team
                </option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.sport} · {levelLabel[t.level]}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor={`${school.slug}-contact`}>Mobile number or email</label>
              <input id={`${school.slug}-contact`} type="text" autoComplete="email" placeholder="(253) 555-0123" />
            </div>
            <button type="submit" className={`${styles.btn} ${styles.btnAccent} ${styles.submit}`}>
              Start alerts
            </button>
          </fieldset>
          <span id="school-alerts-note" className={styles.formNote}>
            Text and email alerts start later this season.
          </span>
        </form>
      </div>
    </section>
  );
}

export function Partners({ content }: { content: SchoolContent }) {
  // Bracketed placeholders from the comp stay until sponsors are confirmed.
  const slots = ["[Sponsor logo]", "[Sponsor logo]", "[Sponsor logo]", "[Sponsor logo]", "[Sponsor logo]", "[Booster club]"];
  return (
    <section className={styles.sec} aria-labelledby="partners-title">
      <div className={`ath-wrap ${styles.partnersIn}`}>
        <h2 id="partners-title" className={`ath-display ${styles.h2} ${styles.h2Small}`}>
          {content.partnersTitle}
        </h2>
        <ul className={styles.sponsors}>
          {slots.map((slot, i) => (
            <li key={i}>{slot}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const NOTICE =
  "Peninsula School District does not discriminate in any programs or activities on the basis of sex, race, creed, religion, color, national origin, age, veteran or military status, sexual orientation, gender expression or identity, disability, or the use of a trained dog guide or service animal.";

const handleUrl = (network: "instagram" | "x", handle: string) =>
  `${network === "instagram" ? "https://www.instagram.com/" : "https://x.com/"}${handle.replace(/^@/, "")}`;

export function SchoolFooter({ school, content }: { school: SchoolView; content: SchoolContent }) {
  const hasAd = school.contacts.some((c) => c.role === "Athletic Director");
  return (
    <footer className={`${styles.foot} ath-on-dark`}>
      <div className={`ath-wrap ${styles.footIn}`}>
        <div className={styles.footGrid}>
          <div className={styles.footCol}>
            <span className={`ath-display ${styles.footSlogan}`}>{content.footerSlogan}</span>
            <span>
              {school.name} Athletics
              <br />
              {school.address}
            </span>
          </div>
          <div className={styles.footCol}>
            <h2 className={`ath-label ${styles.footLabel}`}>Athletics office</h2>
            {school.contacts.map((c) => (
              <span key={c.name}>
                <span className={styles.footStrong}>{c.name}</span>
                <br />
                {c.role}
                {c.phone ? ` · ${c.phone}` : ""}
              </span>
            ))}
            {hasAd ? null : <span>[Athletic director]</span>}
            <Link href={`/${school.slug}/staff`}>Coaches &amp; staff</Link>
          </div>
          <div className={styles.footCol}>
            <h2 className={`ath-label ${styles.footLabel}`}>Families</h2>
            <ul className={styles.footList}>
              <li>
                <a href={FINAL_FORMS}>Final Forms registration</a>
              </li>
              <li>
                <Link href="/families">Forms and steps for families</Link>
              </li>
            </ul>
          </div>
          <div className={styles.footCol}>
            <h2 className={`ath-label ${styles.footLabel}`}>Follow</h2>
            <ul className={styles.footList}>
              {school.social.instagram ? (
                <li>
                  <a href={handleUrl("instagram", school.social.instagram)}>Instagram {school.social.instagram}</a>
                </li>
              ) : null}
              {school.social.x ? (
                <li>
                  <a href={handleUrl("x", school.social.x)}>X {school.social.x}</a>
                </li>
              ) : null}
              <li>
                <a href={LEAGUE_URL}>Puget Sound League</a>
              </li>
              <li>
                <Link href="/">Peninsula Athletics</Link>
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.notice}>{NOTICE}</p>
      </div>
    </footer>
  );
}
