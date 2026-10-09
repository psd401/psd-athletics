import Image from "next/image";

import { formatWeekday } from "../../lib/schedule/time";
import { gameState, opponentLine, timeLabel, type GameView } from "../../lib/schedule/games";
import { ArrowIcon } from "../athletics/icons";
import { StatusTag } from "../athletics/status-tag";
import styles from "./hub.module.css";

interface Side {
  slug: string;
  name: string;
  shortName: string;
  mascot: string;
  founded: number | null;
  marquee: GameView | null;
}

function NextLine({ game, now }: { game: GameView | null; now: Date }) {
  if (!game) return <p className={styles.nextline}>No games on the schedule yet.</p>;
  const state = gameState(game, now);
  const tag =
    state === "live" ? (
      <StatusTag kind="live" />
    ) : state === "tonight" || state === "today" ? (
      <StatusTag kind="tonight">{state === "today" ? "Today" : "Tonight"}</StatusTag>
    ) : (
      <StatusTag kind="next" className={styles.nextTag}>
        {game.homeAway === "home" ? "Home" : "Next up"}
      </StatusTag>
    );
  return (
    <p className={styles.nextline}>
      {tag}
      {game.sport} {opponentLine(game)} · {formatWeekday(game.startDate)} {timeLabel(game)}
    </p>
  );
}

function Waves() {
  return (
    <svg className={styles.motif} viewBox="0 0 720 680" preserveAspectRatio="none" aria-hidden="true">
      {[470, 500, 530, 560, 590, 620, 650].map((y) => (
        <path key={y} d={`M0 ${y} C 120 ${y - 40}, 240 ${y + 40}, 360 ${y} S 600 ${y - 40}, 720 ${y}`} />
      ))}
    </svg>
  );
}

function Chevrons() {
  return (
    <svg className={styles.motif} viewBox="0 0 720 680" preserveAspectRatio="none" aria-hidden="true">
      {[380, 420, 460, 500, 540, 580].map((x) => (
        <path key={x} d={`M${x} 420 L${x + 160} 500 L${x} 580`} />
      ))}
    </svg>
  );
}

/** Split hero: one half per school with its next marquee game (design/Main.dc.html). */
export function HubHero({ tides, hawks, now }: { tides: Side; hawks: Side; now: Date }) {
  return (
    <section className={`${styles.hero} ath-on-dark`} id="top" aria-label="Choose a school">
      <div className={`${styles.half} ${styles.tides}`}>
        <Image className={styles.shot} src="/images/ghhs-friday-night.jpg" alt="" fill priority sizes="50vw" />
        <Waves />
        <span className={`ath-display ${styles.ghost}`} aria-hidden="true">
          {tides.mascot}
        </span>
        <div className={styles.halfIn}>
          <Image className={styles.mark} src="/logos/ghhs-gh-logo.png" alt="Gig Harbor High School GH logo" width={84} height={71} />
          <span className={`ath-label ${styles.eyebrow}`}>
            {tides.name}
            {tides.founded ? ` · Since ${tides.founded}` : ""}
          </span>
          <h1 className={`ath-display ${styles.schoolName}`}>{tides.mascot}</h1>
          <NextLine game={tides.marquee} now={now} />
          <div className={styles.heroButtons}>
            <a className={`${styles.pill} ${styles.pillLight}`} href={`/${tides.slug}`}>
              Enter {tides.mascot} Athletics
              <ArrowIcon />
            </a>
            <a className={`${styles.pill} ${styles.pillGhost}`} href={`/${tides.slug}#week`}>
              This week<span className="ath-visually-hidden"> at {tides.shortName}</span>
            </a>
          </div>
        </div>
      </div>
      <div className={`${styles.half} ${styles.hawks}`}>
        <Image className={styles.shot} src="/images/phs-osprey.jpg" alt="" fill sizes="50vw" />
        <Chevrons />
        <span className={`ath-display ${styles.ghost}`} aria-hidden="true">
          Hawks
        </span>
        <div className={styles.halfIn}>
          <span className={styles.markTile}>
            <Image src="/logos/phs-p-logo.png" alt="Peninsula High School P logo" width={72} height={56} />
          </span>
          <span className={`ath-label ${styles.eyebrow}`}>
            {hawks.name}
            {hawks.founded ? ` · Since ${hawks.founded}` : ""}
          </span>
          <h2 className={`ath-display ${styles.schoolName}`}>{hawks.mascot}</h2>
          <NextLine game={hawks.marquee} now={now} />
          <div className={styles.heroButtons}>
            <a className={`${styles.pill} ${styles.pillLight}`} href={`/${hawks.slug}`}>
              Enter {hawks.mascot} Athletics
              <ArrowIcon />
            </a>
            <a className={`${styles.pill} ${styles.pillGhost}`} href={`/${hawks.slug}#week`}>
              This week<span className="ath-visually-hidden"> at {hawks.shortName}</span>
            </a>
          </div>
        </div>
      </div>
      <span className={styles.slash} aria-hidden="true" />
      <div className={styles.seal} aria-hidden="true">
        <span className={`ath-label ${styles.sealLabel}`}>Two schools</span>
        <span className={`ath-display ${styles.sealText}`}>
          One
          <br />
          Peninsula
        </span>
      </div>
    </section>
  );
}
