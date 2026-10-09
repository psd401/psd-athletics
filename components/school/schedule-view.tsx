"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

import { subscribeLinks } from "../../lib/schedule/calendar-links";
import { emptyFilters, filterGames, filterName, filtersToQuery, hasFilters, type ScheduleFilters } from "../../lib/schedule/filters";
import { levelLabel, opponentLine, result, timeLabel, type GameState, type GameView, type Level } from "../../lib/schedule/games";
import { monthGrid } from "../../lib/schedule/month";
import { formatMonthDay, formatShortDate, formatWeekday, formatMonthYear } from "../../lib/schedule/time";
import { GameActions } from "../athletics/game-actions";
import { StatusTag } from "../athletics/status-tag";
import styles from "./schedule.module.css";

export interface ScheduleGame {
  game: GameView;
  state: GameState;
}

interface ScheduleViewProps {
  schoolSlug: string;
  mascot: string;
  games: ScheduleGame[];
  today: string;
  months: string[];
  sports: { slug: string; name: string }[];
  levels: Level[];
  initialFilters: ScheduleFilters;
  initialView: "list" | "month";
  siteUrl: string;
  /** Season line, e.g. "Every level · every sport · 2026–27". */
  kicker: string;
  /** "Fall schedule snapshot · Times Pacific" */
  sourceLine: string;
  /** The school's motif, drawn behind the header. */
  motif: ReactNode;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function statusTag({ game, state }: ScheduleGame) {
  if (state === "live") return <StatusTag kind="live" />;
  if (game.updatedFields.length > 0 && state !== "final") return <StatusTag kind="updated" />;
  if (state === "final") {
    const r = result(game);
    const word = r === "W" ? "Win" : r === "L" ? "Loss" : "Tie";
    return (
      <StatusTag kind="final" className={r === "W" ? styles.win : styles.loss}>
        Final · {word} {game.scoreUs}–{game.scoreThem}
      </StatusTag>
    );
  }
  if (state === "unreported") return <StatusTag kind="final" className={styles.unreported}>Result not reported</StatusTag>;
  if (state === "postponed") return <StatusTag kind="updated">Postponed</StatusTag>;
  if (state === "cancelled") return <StatusTag kind="updated">Cancelled</StatusTag>;
  if (state === "tonight" || state === "today") return <StatusTag kind="tonight">{state === "today" ? "Today" : "Tonight"}</StatusTag>;
  return <StatusTag kind="next" className={styles.upcoming}>Upcoming</StatusTag>;
}

/** List and month views with filters kept in the URL, and subscribe links for the filtered view. */
export function ScheduleView(props: ScheduleViewProps) {
  const { schoolSlug, mascot, games, today, months, sports, levels, siteUrl, kicker, sourceLine, motif } = props;
  const [filters, setFilters] = useState<ScheduleFilters>(props.initialFilters);
  const [view, setView] = useState(props.initialView);
  const [copied, setCopied] = useState("");

  const set = (patch: Partial<ScheduleFilters>) => setFilters((f) => ({ ...f, ...patch }));

  // Keep the URL in step so the view can be shared and reloaded.
  useEffect(() => {
    const query = new URLSearchParams(filtersToQuery(filters).replace(/^\?/, ""));
    if (view === "month") query.set("view", "month");
    const qs = query.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [filters, view]);

  const byId = useMemo(() => new Map(games.map((g) => [g.game.id, g])), [games]);
  const shown = filterGames(
    games.map((g) => g.game),
    filters,
  ).map((g) => byId.get(g.id)!);

  const groups: { date: string; rows: ScheduleGame[] }[] = [];
  for (const row of shown) {
    const last = groups.at(-1);
    if (last?.date === row.game.startDate) last.rows.push(row);
    else groups.push({ date: row.game.startDate, rows: [row] });
  }

  const sportName = sports.find((s) => s.slug === filters.sport)?.name ?? null;
  const feedName = filterName(mascot, filters, sportName);
  const links = subscribeLinks(`${siteUrl}/api/calendar/${schoolSlug}.ics${filtersToQuery(filters)}`, feedName);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(links.https);
      setCopied("Calendar link copied.");
    } catch {
      setCopied(`Copy this link: ${links.https}`);
    }
  }

  const option = <K extends keyof ScheduleFilters>(key: K, value: ScheduleFilters[K], label: string) => (
    <button key={`${key}-${value}`} type="button" aria-pressed={filters[key] === value} onClick={() => set({ [key]: value } as Partial<ScheduleFilters>)}>
      {label}
    </button>
  );

  return (
    <>
      <section className={`${styles.head} ath-on-dark`} aria-labelledby="schedule-title">
        {motif}
        <div className={`ath-wrap ${styles.headIn}`}>
          <div className={styles.headTitle}>
            <span className={`ath-label ${styles.kicker}`}>{kicker}</span>
            <h1 id="schedule-title" className={`ath-display ${styles.h1}`}>
              Schedule
            </h1>
            <span className={styles.synced}>{sourceLine}</span>
          </div>
      <div className={styles.subscribe}>
        <p className={`ath-label ${styles.subscribeLabel}`} id="subscribe-label">
          Subscribe to what you filter{hasFilters(filters) ? `: ${feedName}` : ""}
        </p>
        <ul className={styles.subscribeLinks} aria-labelledby="subscribe-label">
          <li>
            <a className={`${styles.btn} ${styles.btnAccent}`} href={links.google}>
              Google Calendar
            </a>
          </li>
          <li>
            <a className={`${styles.btn} ${styles.btnDark}`} href={links.webcal}>
              Apple
            </a>
          </li>
          <li>
            <a className={`${styles.btn} ${styles.btnDark}`} href={links.outlook}>
              Outlook
            </a>
          </li>
          <li>
            <button type="button" className={`${styles.btn} ${styles.btnDark}`} onClick={copyLink}>
              Copy link
            </button>
          </li>
        </ul>
        <p className={styles.copied} role="status">
          {copied}
        </p>
      </div>
        </div>
      </section>
      <div className={`ath-wrap ${styles.body}`}>
        <div className={styles.toolbar} role="search" aria-label="Filter the schedule">
          <label className={styles.grp} htmlFor="schedule-q">
            <span className={styles.grpLabel}>Search</span>
            <span className={styles.search}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input id="schedule-q" type="search" placeholder="Opponent, like Capital" value={filters.q} onChange={(e) => set({ q: e.target.value.slice(0, 60) })} />
            </span>
          </label>
          <fieldset className={styles.grp}>
            <legend className={styles.grpLabel}>Sport</legend>
            <div className={styles.seg}>
              {option("sport", "", "All")}
              {sports.map((s) => option("sport", s.slug, s.name))}
            </div>
          </fieldset>
          <fieldset className={styles.grp}>
            <legend className={styles.grpLabel}>Level</legend>
            <div className={styles.seg}>
              {option("level", "", "All")}
              {levels.map((l) => option("level", l, levelLabel[l]))}
            </div>
          </fieldset>
          <fieldset className={styles.grp}>
            <legend className={styles.grpLabel}>Where</legend>
            <div className={styles.seg}>
              {option("where", "", "Both")}
              {option("where", "home", "Home")}
              {option("where", "away", "Away")}
            </div>
          </fieldset>
          <fieldset className={`${styles.grp} ${styles.grpEnd}`}>
            <legend className={styles.grpLabel}>View</legend>
            <div className={styles.seg}>
              <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}>
                List
              </button>
              <button type="button" aria-pressed={view === "month"} onClick={() => setView("month")}>
                Month
              </button>
            </div>
          </fieldset>
        </div>

        <p className={styles.legend}>
          <b aria-live="polite">
            {shown.length} of {games.length} games
          </b>
          <span className={styles.legendItem}>
            <StatusTag kind="live" /> in progress
          </span>
          <span className={styles.legendItem}>
            <StatusTag kind="updated" /> Arbiter changed the time, place or date
          </span>
          <span className={styles.legendEnd}>
            {view === "list" && groups.some((g) => g.date >= today) ? (
              <a className={`${styles.btn} ${styles.btnGhost}`} href={`#day-${groups.find((g) => g.date >= today)!.date}`}>
                Jump to today
              </a>
            ) : null}
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setFilters(emptyFilters)} disabled={!hasFilters(filters)}>
              Clear filters
            </button>
          </span>
        </p>

        {view === "list" ? (
          <div>
            {groups.map((group) => (
              <section className={styles.daygrp} key={group.date} id={`day-${group.date}`} aria-labelledby={`day-label-${group.date}`}>
                <h2 className={styles.dayLabel} id={`day-label-${group.date}`}>
                  <span className={`ath-display ${styles.dow}`}>{group.date === today ? "Today" : formatWeekday(group.date)}</span>{" "}
                  <span className={`ath-label ${styles.date}`}>{formatMonthDay(group.date)}</span>
                </h2>
                <ul className={styles.rows}>
                  {group.rows.map((row) => (
                    <li key={row.game.id} className={`${styles.row} ${group.date === today ? styles.today : ""}`}>
                      <span className={styles.rowTime}>{timeLabel(row.game)}</span>
                      <span className={styles.rowWhat}>
                        <span className={`ath-label ${styles.rowSport}`}>
                          {row.game.sport} · {levelLabel[row.game.level]}
                        </span>
                        <span className={styles.rowOpp}>{opponentLine(row.game)}</span>
                      </span>
                      <span className={styles.rowWhere}>
                        <StatusTag kind={row.game.homeAway === "away" ? "away" : "home"}>
                          {row.game.homeAway === "home" ? "Home" : row.game.homeAway === "away" ? "Away" : "Neutral"}
                        </StatusTag>
                        {statusTag(row)}
                      </span>
                      <GameActions game={row.game} directionsLabel="Map" className={styles.rowActions} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {shown.length === 0 ? <div className={styles.empty}>No games match those filters. Clear filters to see the whole schedule.</div> : null}
          </div>
        ) : (
          <div className={styles.months}>
            {months.map((month) => (
              <MonthTable key={month} month={month} rows={shown} today={today} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function MonthTable({ month, rows, today }: { month: string; rows: ScheduleGame[]; today: string }) {
  const weeks = monthGrid(month);
  const title = formatMonthYear(`${month}-01`);
  return (
    <section aria-labelledby={`month-${month}`}>
      <div className={styles.monthHead}>
        <h2 id={`month-${month}`} className={`ath-display ${styles.monthTitle}`}>
          {title}
        </h2>
      </div>
      {/* Scrolls sideways on phones, so it takes focus for keyboard scrolling. */}
      <div className={styles.scroll} tabIndex={0} role="region" aria-label={`${title} calendar, scrolls sideways`}>
        <table className={styles.cal}>
          <caption className="ath-visually-hidden">{title} games</caption>
          <thead>
            <tr>
              {DAYS.map((d) => (
                <th key={d} scope="col">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0]!.date}>
                {week.map((cell) => {
                  const items = rows.filter((r) => r.game.startDate === cell.date);
                  return (
                    <td
                      key={cell.date}
                      className={cell.inMonth ? undefined : styles.out}
                      aria-current={cell.date === today ? "date" : undefined}
                    >
                      <span className={styles.dayNum}>
                        <span className="ath-visually-hidden">{formatShortDate(cell.date)}</span>
                        <span aria-hidden="true">{Number(cell.date.slice(8))}</span>
                      </span>
                      {cell.inMonth && items.length > 0 ? (
                        <ul className={styles.minis}>
                          {items.slice(0, 3).map(({ game }) => (
                            <li
                              key={game.id}
                              className={`${styles.mini} ${game.homeAway === "away" ? styles.miniAway : ""}`}
                              title={`${timeLabel(game)} ${game.sport} ${levelLabel[game.level]} ${opponentLine(game)}`}
                            >
                              {timeLabel(game)} {game.homeAway === "away" ? "@" : "vs"} · {game.sport}
                              {game.level === "varsity" ? "" : ` ${levelLabel[game.level]}`}
                              <span className="ath-visually-hidden"> {opponentLine(game)}</span>
                            </li>
                          ))}
                          {items.length > 3 ? <li className={styles.more}>+{items.length - 3} more</li> : null}
                        </ul>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
