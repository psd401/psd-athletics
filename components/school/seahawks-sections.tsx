import Image from "next/image";
import Link from "next/link";

import type { SchoolView } from "../../lib/data/queries";
import type { SchoolContent } from "../../lib/schools/content";
import { initials } from "../../lib/schedule/board";
import { gameState, levelLabel, opponentLine, startInstant, timeLabel, type FishBowlResult, type GameView } from "../../lib/schedule/games";
import { heroHeadline } from "../../lib/schedule/school";
import { formatShortDate } from "../../lib/schedule/time";
import { mapsUrl } from "../athletics/game-actions";
import { CalendarAddIcon, PinIcon, TicketIcon, WatchIcon } from "../athletics/icons";
import { StatusTag } from "../athletics/status-tag";
import { Countdown } from "./countdown";
import { FINAL_FORMS } from "./school-sections";
import school from "./school.module.css";
import styles from "./seahawks.module.css";

// ------------------------------------------------------------ match hero

/** "Lights on in Purdy." for a home night game; otherwise the usual headline. */
export function matchHeadline(game: GameView, homeTown: string): string {
  const night = game.startTime !== null && game.startTime >= "17:00:00";
  return game.homeAway === "home" && night ? `Lights on in ${homeTown}.` : heroHeadline(game);
}

export function MatchHero({
  schoolView,
  content,
  marquee,
  now,
  clockOffsetMs,
}: {
  schoolView: SchoolView;
  content: SchoolContent;
  marquee: GameView | null;
  now: Date;
  clockOffsetMs: number;
}) {
  if (!marquee) {
    return (
      <section className={`${styles.hero} ath-on-dark`} id="top" aria-label="Next game">
        <div className={`ath-wrap ${styles.grid}`}>
          <h1 className={`ath-display ${styles.h1}`}>
            {schoolView.shortName} {schoolView.mascot}
          </h1>
        </div>
      </section>
    );
  }
  const start = startInstant(marquee);
  const home = marquee.homeAway === "home";
  const where = home ? "Home" : marquee.homeAway === "away" ? "Away" : "Neutral";
  const league = marquee.isLeague === true ? " · League" : marquee.isLeague === false ? " · Non-league" : "";
  // A home game's tickets are on the school's GoFan page until per-event links exist (DECISIONS 53).
  const tickets = marquee.ticketUrl ?? (home ? content.links.tickets : null);
  const host = home ? `The ${schoolView.mascot} host` : `The ${schoolView.mascot} visit`;
  return (
    <section className={`${styles.hero} ath-on-dark`} id="top" aria-label="Next game">
      <Image className={styles.shot} src={content.heroPhoto} alt="" fill priority sizes="100vw" />
      <div className={styles.tint} aria-hidden="true" />
      <div className={`ath-wrap ${styles.grid}`}>
        <div className={styles.main}>
          <div className={styles.tags}>
            <StatusTag kind="home" className={styles.whiteTag}>
              {where}
              {league}
            </StatusTag>
            <span className={`ath-label ${styles.meta}`}>
              {levelLabel[marquee.level]} {marquee.sport} · {formatShortDate(marquee.startDate)}
            </span>
          </div>
          <h1 className={`ath-display ${styles.h1}`}>{matchHeadline(marquee, content.homeTown)}</h1>
          <p className={styles.lede}>
            {host} {marquee.opponent}
            {marquee.startTime ? ` at ${timeLabel(marquee)}` : ""}.{tickets ? " Get your ticket before you leave the house and skip the line at the gate." : ""}
          </p>
          {start && gameState(marquee, now) !== "final" ? (
            <Countdown startsAt={start.toISOString()} clockOffsetMs={clockOffsetMs} initialNow={now.getTime()} label="Time until kickoff" />
          ) : null}
        </div>
        <div className={styles.match}>
          <div className={styles.vs}>
            <div>
              <div className={styles.crest}>
                <Image src={schoolView.logoPath} alt="" width={84} height={65} />
              </div>
              <div className={`ath-display ${styles.team}`}>{schoolView.mascot}</div>
              <div className={`ath-label ${styles.side}`}>{home ? "Home" : "Away"}</div>
            </div>
            <span className={`ath-display ${styles.vsWord}`}>{home ? "vs" : "at"}</span>
            <div>
              <div className={`ath-display ${styles.crest} ${styles.crestMono}`} aria-hidden="true">
                {initials(marquee.opponent)}
              </div>
              <div className={`ath-display ${styles.team}`}>{marquee.opponent}</div>
              <div className={`ath-label ${styles.side}`}>{home ? "Away" : "Home"}</div>
            </div>
          </div>
          <p className={styles.when}>
            <span>
              {formatShortDate(marquee.startDate)} · {timeLabel(marquee)}
            </span>
            {marquee.venueName ? <span className={styles.whenMuted}>{marquee.venueName}</span> : null}
          </p>
          {tickets ? (
            <a className={`${styles.btn} ${styles.btnBig} ${styles.btnBrand}`} href={tickets}>
              <TicketIcon />
              Buy tickets on GoFan
            </a>
          ) : null}
          <div className={styles.pair}>
            {marquee.streamUrl ? (
              <a className={`${styles.btn} ${styles.btnGhost}`} href={marquee.streamUrl}>
                <WatchIcon />
                Watch on NFHS
              </a>
            ) : marquee.venueAddress ? (
              <a className={`${styles.btn} ${styles.btnGhost}`} href={mapsUrl(marquee.venueAddress)}>
                <PinIcon />
                Directions
              </a>
            ) : null}
            <a className={`${styles.btn} ${styles.btnGhost}`} href={`/api/games/${marquee.id}/ics`}>
              <CalendarAddIcon />
              Add to calendar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ live strip

export function LiveNow({ game }: { game: GameView | null }) {
  if (!game) return null;
  return (
    <div className={styles.live}>
      <div className={`ath-wrap ${styles.liveIn}`}>
        <StatusTag kind="live">Live now</StatusTag>
        <p className={styles.liveTitle}>
          {game.sport} {opponentLine(game)}
        </p>
        <span className={styles.liveMeta}>
          {levelLabel[game.level]} · {game.homeAway === "home" ? "at home" : "away"}
        </span>
        {game.streamUrl ? (
          <a className={`${styles.btn} ${styles.btnGhost} ${styles.liveEnd}`} href={game.streamUrl}>
            <WatchIcon />
            Watch the stream
          </a>
        ) : null}
      </div>
    </div>
  );
}

// ------------------------------------------------------------ Fish Bowl champions

/** Shown on the winning school's page only. */
export function FishBowlChampions({ result, schoolId }: { result: FishBowlResult | null; schoolId: string }) {
  const winner = result?.sides.find((s) => s.winner);
  if (!result || !winner || winner.schoolId !== schoolId) return null;
  const loser = result.sides.find((s) => !s.winner)!;
  return (
    <section className={`${styles.champ} ath-on-dark`} aria-labelledby="champ-title">
      <Image className={styles.champShot} src="/images/phs-team.jpg" alt="" fill sizes="100vw" />
      <div className={`ath-wrap ${styles.champIn}`}>
        <div className={styles.champCopy}>
          <span className={`ath-label ${styles.champKicker}`}>
            {result.date.slice(0, 4)} · {formatShortDate(result.date)} · at {result.hostShortName}
          </span>
          <h2 id="champ-title" className={`ath-display ${styles.champTitle}`}>
            Fish Bowl
            <br />
            champions
          </h2>
          <p className={styles.champText}>
            {result.hostShortName === winner.schoolShortName
              ? `The ${winner.mascot} defended home and kept it.`
              : `The ${winner.mascot} went across the harbor and brought it home.`}
          </p>
        </div>
        <p className={styles.champScore}>
          <span className={styles.champSide}>
            <span className={`ath-display ${styles.champNum}`} style={{ display: "block" }}>
              {winner.score}
            </span>
            <span className={`ath-label ${styles.champName}`}>{winner.mascot}</span>
          </span>
          <span className={`ath-display ${styles.champDash}`} aria-hidden="true">
            –
          </span>
          <span className="ath-visually-hidden"> to </span>
          <span className={`${styles.champSide} ${styles.champLoser}`}>
            <span className={`ath-display ${styles.champNum}`} style={{ display: "block" }}>
              {loser.score}
            </span>
            <span className={`ath-label ${styles.champName}`}>{loser.mascot}</span>
          </span>
        </p>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ pillars

export function Pillars({
  schoolView,
  content,
  honors,
}: {
  schoolView: SchoolView;
  content: SchoolContent;
  honors: { figure: string; title: string; detail: string | null }[];
}) {
  const shown = content.pillarFigures.length
    ? content.pillarFigures.map((f) => honors.find((h) => h.figure === f)).filter((h): h is (typeof honors)[number] => h !== undefined)
    : honors;
  if (shown.length === 0) return null;
  return (
    <section className={school.sec} id="tradition" aria-labelledby="pillars-title">
      <div className="ath-wrap">
        <div className={school.secHead}>
          <div className={school.secTitle}>
            <span className={`ath-label ${school.kicker}`}>{content.traditionKicker(schoolView.founded)}</span>
            <h2 id="pillars-title" className={`ath-display ${school.h2}`}>
              {content.traditionTitle}
            </h2>
          </div>
        </div>
        <ul className={styles.pillars}>
          {shown.map((h) => (
            <li key={h.title} className={styles.pillar}>
              <p className={`ath-display ${styles.pillarFigure}`}>{h.figure}</p>
              <h3 className={styles.pillarTitle}>{h.title}</h3>
              {h.detail ? <p className={styles.pillarText}>{h.detail}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ------------------------------------------------------------ athletics office

export function AthleticsOffice({ schoolView, content }: { schoolView: SchoolView; content: SchoolContent }) {
  return (
    <section className={`${school.sec} ${school.secTight}`} id="fan" aria-labelledby="office-title">
      <div className={`ath-wrap ${styles.officeIn}`}>
        <div className={school.secHead} style={{ margin: 0 }}>
          <h2 id="office-title" className={`ath-display ${school.h2} ${school.h2Small}`}>
            Athletics office
          </h2>
          <div className={styles.officeLinks} id="forms">
            <a className={`${styles.btn} ${styles.btnGhost}`} href={FINAL_FORMS}>
              Final Forms
            </a>
            <a className={`${styles.btn} ${styles.btnGhost}`} href={content.links.tickets}>
              Tickets
            </a>
            <a className={`${styles.btn} ${styles.btnGhost}`} href={content.links.watch}>
              Watch live
            </a>
            <a className={`${styles.btn} ${styles.btnGhost}`} href={content.links.store}>
              Sideline Store
            </a>
            <Link className={`${styles.btn} ${styles.btnGhost}`} href="/#families">
              Forms for families
            </Link>
          </div>
        </div>
        <ul className={styles.contact}>
          {schoolView.contacts.map((c) => (
            <li key={c.name} className={styles.person}>
              <span className={styles.avatar} aria-hidden="true">
                {initials(c.name)}
              </span>
              <span className={styles.personText}>
                <h3 className={styles.personName}>{c.name}</h3>
                <span className={styles.personRole}>{c.role}</span>
                {c.email || c.phone ? (
                  <span className={styles.personReach}>
                    {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : null}
                    {c.email && c.phone ? " · " : null}
                    {c.phone ? <a href={`tel:+1${c.phone.replace(/\D/g, "")}`}>{c.phone}</a> : null}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
