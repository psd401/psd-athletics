import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { mapsUrl } from "../../../../components/athletics/game-actions";
import { CalendarAddIcon, PinIcon, TicketIcon, WatchIcon } from "../../../../components/athletics/icons";
import { StatusTag } from "../../../../components/athletics/status-tag";
import { CompactCountdown } from "../../../../components/school/countdown";
import g from "../../../../components/school/gameday.module.css";
import { appDb } from "../../../../lib/data/db";
import { getGame, listGames, listSchools } from "../../../../lib/data/queries";
import { schoolContent } from "../../../../lib/schools/content";
import { gameDayStats, startWord, upNext } from "../../../../lib/schedule/gameday";
import { gameState, latestFinals, levelLabel, opponentLine, result, startInstant, timeLabel } from "../../../../lib/schedule/games";
import { clockOffsetMs, currentTime, formatMonthDay, formatShortDate, formatWeekday } from "../../../../lib/schedule/time";

type Params = Promise<{ school: string; id: string }>;

async function load(slug: string, id: string) {
  if (!schoolContent[slug]) return null;
  const db = await appDb();
  const game = await getGame(db, id);
  if (!game || game.schoolSlug !== slug) return null;
  const school = (await listSchools(db)).find((s) => s.slug === slug);
  if (!school) return null;
  return { db, game, school };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { school, id } = await params;
  const loaded = await load(school, id);
  if (!loaded) return { title: "Game not found" };
  const { game } = loaded;
  return { title: `${game.sport} ${opponentLine(game)}, ${formatShortDate(game.startDate)} · ${loaded.school.mascot} Athletics` };
}

// Home-venue details aren't in the data yet; the comp's bracketed placeholders stay until the athletics office supplies them.
const knowBeforeYouGo = (mascot: string) => [
  { title: "Gates and parking", body: "Gates open [time]. Park in [lot]; overflow at [lot]. The student lot fills first on game nights." },
  { title: "Tickets and passes", body: "Digital tickets on GoFan. ASB cards and district passes scan at the gate. [Cash policy]." },
  { title: "Bag and conduct policy", body: "[Clear-bag rule]. Sportsmanship expectations follow WIAA and Puget Sound League rules." },
  { title: "Accessible seating", body: `[Accessible entrance and seating area]. Ask any staff member in a ${mascot} lanyard for help.` },
];

/** Game-day page for one game (design/GHHS-GameDay-Mobile.dc.html). */
export default async function GameDayPage({ params }: { params: Params }) {
  const { school: slug, id } = await params;
  await connection();
  const loaded = await load(slug, id);
  if (!loaded) notFound();
  const { db, game, school } = loaded;
  const content = schoolContent[slug]!;
  const now = currentTime();
  const state = gameState(game, now);
  const start = startInstant(game);
  const home = game.homeAway === "home";
  const schoolGames = await listGames(db, { schoolId: school.id });
  const next = upNext(schoolGames, game, now, 4);
  const latest = latestFinals(schoolGames.filter((x) => x.id !== game.id), 1)[0] ?? null;
  const stats = gameDayStats(game.record, school.mascot);
  const tickets = game.ticketUrl ?? (home ? content.links.tickets : null);
  const r = result(game);

  const tag =
    state === "live" ? (
      <StatusTag kind="live">Live now</StatusTag>
    ) : state === "tonight" || state === "today" ? (
      <StatusTag kind="tonight">Game day · {state === "today" ? "Today" : "Tonight"}</StatusTag>
    ) : state === "final" ? (
      <StatusTag kind="final">Final</StatusTag>
    ) : state === "unreported" ? (
      <StatusTag kind="away">Result not reported</StatusTag>
    ) : (
      <StatusTag kind="next">{formatShortDate(game.startDate)}</StatusTag>
    );

  return (
    <div data-school={slug} className={g.page}>
      <header className={`${g.top} ath-on-dark`}>
        <div className={`${g.column} ${g.topIn}`}>
          <Link href={`/${slug}`} className={g.brand}>
            {school.id === "phs" ? (
              <span className={g.tile}>
                <Image src={school.logoPath} alt="" width={36} height={28} />
              </span>
            ) : (
              <Image src={school.logoPath} alt="" width={46} height={39} />
            )}
            <span className={`ath-display ${g.brandMascot}`}>{school.mascot}</span>
          </Link>
        </div>
      </header>
      <main className={g.column}>
        <section className={`${g.hero} ath-on-dark`} aria-labelledby="game-title">
          <div className={g.heroIn}>
            <div className={g.tags}>
              {tag}
              <span className={`ath-label ${g.sport}`}>
                {game.sport} · {levelLabel[game.level]}
              </span>
            </div>
            <h1 id="game-title" className={`ath-display ${g.h1}`}>
              {school.mascot} {home ? "vs" : "at"}
              <br />
              {game.opponent}
            </h1>
            <div className={g.row}>
              {r ? (
                <p className={`ath-display ${g.finalScore}`}>
                  <span className="ath-visually-hidden">{r === "W" ? "Win" : r === "L" ? "Loss" : "Tie"}, </span>
                  {game.scoreUs}–{game.scoreThem}
                </p>
              ) : start && (state === "tonight" || state === "today" || state === "upcoming" || state === "live") ? (
                <CompactCountdown
                  className={g.count}
                  startsAt={start.toISOString()}
                  clockOffsetMs={clockOffsetMs(now)}
                  initialNow={now.getTime()}
                  unit={startWord(game.sportSlug)}
                  startLabel={timeLabel(game)}
                />
              ) : (
                <span />
              )}
              <p className={g.where}>
                {formatWeekday(game.startDate)} {formatMonthDay(game.startDate)} · {timeLabel(game)}
                <br />
                {home ? "Home" : game.homeAway === "away" ? "Away" : "Neutral"}
                {game.venueName ? ` · ${game.venueName}` : ""}
              </p>
            </div>
            {stats.length > 0 ? (
              <dl className={g.stats}>
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </section>

        <div className={g.actions}>
          {tickets && state !== "final" ? (
            <a className={`${g.big} ${g.bigBrand}`} href={tickets}>
              <TicketIcon />
              Tickets on GoFan
            </a>
          ) : null}
          <div className={g.pair}>
            {game.streamUrl ? (
              <a className={`${g.big} ${g.bigGhost}`} href={game.streamUrl}>
                <WatchIcon />
                Watch
              </a>
            ) : (
              <a className={`${g.big} ${g.bigGhost}`} href={`/api/games/${game.id}/ics`}>
                <CalendarAddIcon />
                Calendar
              </a>
            )}
            {game.venueAddress ? (
              <a className={`${g.big} ${g.bigGhost}`} href={mapsUrl(game.venueAddress)}>
                <PinIcon />
                Directions
              </a>
            ) : null}
          </div>
        </div>

        {home ? (
          <section className={g.card} aria-labelledby="know-title">
            <h2 id="know-title" className={`ath-display ${g.h2}`}>
              Know before you go
            </h2>
            {knowBeforeYouGo(school.mascot).map((item, i) => (
              <details key={item.title} className={g.acc} open={i === 0}>
                <summary>{item.title}</summary>
                <p>{item.body}</p>
              </details>
            ))}
          </section>
        ) : null}

        <section className={g.card} aria-labelledby="text-title">
          <h2 id="text-title" className="ath-visually-hidden">
            Text alerts
          </h2>
          <div className={g.switchRow}>
            <span className={g.switchText}>
              <b id="sw-final">Text me the final score</b>
              <span className={g.small}>
                {game.sport} · {levelLabel[game.level]}
              </span>
            </span>
            <button type="button" className={g.sw} role="switch" aria-checked="false" aria-labelledby="sw-final" disabled />
          </div>
          <div className={g.switchRow}>
            <span className={g.switchText}>
              <b id="sw-change">Text me schedule changes</b>
              <span className={g.small}>Time, field or date moves from Arbiter</span>
            </span>
            <button type="button" className={g.sw} role="switch" aria-checked="false" aria-labelledby="sw-change" disabled />
          </div>
          <p className={g.small}>Text alerts start later this season.</p>
        </section>

        {next.length > 0 ? (
          <section className={g.section} aria-labelledby="next-title">
            <h2 id="next-title" className={`ath-display ${g.h2}`}>
              Up next
            </h2>
            <ul className={g.nextList}>
              {next.map((n) => (
                <li key={n.id}>
                  <Link className={g.nextItem} href={`/${slug}/game/${n.id}`}>
                    <span className={g.stamp} aria-hidden="true">
                      <span className="ath-label">{formatWeekday(n.startDate)}</span>
                      <span className="ath-display">{Number(n.startDate.slice(8))}</span>
                    </span>
                    <span className={g.nextText}>
                      <span className={`ath-label ${g.small}`}>
                        {n.sport} · {levelLabel[n.level]}
                      </span>
                      <b>{opponentLine(n)}</b>
                      <span className={g.small}>
                        <span className="ath-visually-hidden">{formatShortDate(n.startDate)}, </span>
                        {timeLabel(n)}
                        {n.homeAway === "home" ? " · Home" : ""}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {latest ? (
          <section className={`${g.latest} ath-on-dark`} aria-labelledby="latest-title">
            <h2 id="latest-title" className={`ath-label ${g.small}`} style={{ margin: 0, color: "var(--ath-accent)" }}>
              Latest final
            </h2>
            <p className={`ath-display ${g.latestScore}`}>
              <span>
                {latest.sport} {latest.scoreUs}
              </span>
              <span className="ath-visually-hidden"> to </span>
              <span className={g.latestThem}>{latest.scoreThem}</span>
            </p>
            <span>
              {opponentLine(latest)} · {formatWeekday(latest.startDate)}
            </span>
          </section>
        ) : null}
      </main>
      <nav className={g.tabbar} aria-label="Sections">
        <Link href={`/${slug}`}>Home</Link>
        <Link href={`/${slug}/schedule`}>Schedule</Link>
        <Link href={`/${slug}#results`}>Scores</Link>
        <Link href={`/${slug}#teams`}>Teams</Link>
      </nav>
    </div>
  );
}
