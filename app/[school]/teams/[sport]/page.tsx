import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { GameActions, mapsUrl } from "../../../../components/athletics/game-actions";
import { BellIcon, CalendarAddIcon, PinIcon, WatchIcon } from "../../../../components/athletics/icons";
import { StatusTag } from "../../../../components/athletics/status-tag";
import { Tabs } from "../../../../components/athletics/tabs";
import { Motif } from "../../../../components/school/school-hero";
import { Masthead, SchoolFooter, UtilityBar } from "../../../../components/school/school-sections";
import styles from "../../../../components/school/school.module.css";
import t from "../../../../components/school/team.module.css";
import { appDb } from "../../../../lib/data/db";
import { getTeamContent, listGames, listSchools, listTeams, type TeamView } from "../../../../lib/data/queries";
import { LEAGUE_URL, schoolContent } from "../../../../lib/schools/content";
import { levelLabel, opponentLine, timeLabel, type Level } from "../../../../lib/schedule/games";
import { formatRecord, ordinal } from "../../../../lib/schedule/school";
import { recordStats, teamRows, type ResultCell } from "../../../../lib/schedule/team";
import { currentTime, formatShortDate } from "../../../../lib/schedule/time";

const termLabel = { fall: "Fall", winter: "Winter", spring: "Spring" } as const;
const levelOrder = Object.keys(levelLabel) as Level[];

type Params = Promise<{ school: string; sport: string }>;
type Search = Promise<Record<string, string | string[] | undefined>>;

async function load(slug: string, sportSlug: string) {
  const db = await appDb();
  const schools = await listSchools(db);
  const school = schools.find((s) => s.slug === slug);
  const other = schools.find((s) => s.slug !== slug);
  if (!school || !other) return null;
  const teams = (await listTeams(db, { schoolId: school.id })).filter((x) => x.sportSlug === sportSlug);
  if (teams.length === 0) return null;
  return { db, school, other, teams };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { school, sport } = await params;
  const loaded = schoolContent[school] ? await load(school, sport) : null;
  if (!loaded) return { title: "Team not found" };
  return { title: `${loaded.teams[0]!.sport} · ${loaded.school.mascot} Athletics` };
}

function ResultText({ cell }: { cell: ResultCell }) {
  switch (cell.kind) {
    case "final": {
      const word = cell.outcome === "W" ? "Win" : cell.outcome === "L" ? "Loss" : "Tie";
      return (
        <span className={t.res}>
          <span className={`${t.wl} ${t[cell.outcome.toLowerCase() as "w" | "l" | "t"]}`} aria-hidden="true">
            {cell.outcome}
          </span>
          <span className="ath-visually-hidden">{word}, </span>
          {cell.score}
        </span>
      );
    }
    case "next":
      return <StatusTag kind="home">Next up</StatusTag>;
    case "live":
      return <StatusTag kind="live" />;
    case "unreported":
      return <span className={t.small}>Result not reported</span>;
    case "postponed":
      return <StatusTag kind="updated">Postponed</StatusTag>;
    case "cancelled":
      return <StatusTag kind="updated">Cancelled</StatusTag>;
    default:
      return <span className={t.small}>Upcoming</span>;
  }
}

function Empty({ children }: { children: string }) {
  return <p className={t.empty}>{children}</p>;
}

/** One team page for every sport and level (design/GHHS-Football.dc.html). */
export default async function TeamPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { school: slug, sport: sportSlug } = await params;
  const content = schoolContent[slug];
  if (!content) notFound();
  await connection();
  const loaded = await load(slug, sportSlug);
  if (!loaded) notFound();
  const { db, school, other, teams } = loaded;

  const query = await searchParams;
  const levels = levelOrder.filter((l) => teams.some((x) => x.level === l));
  const wanted = (Array.isArray(query.level) ? query.level[0] : query.level) as Level | undefined;
  const team: TeamView = teams.find((x) => x.level === wanted) ?? teams.find((x) => x.level === "varsity") ?? teams[0]!;
  const now = currentTime();
  const [games, teamContent] = await Promise.all([listGames(db, { schoolId: school.id }), getTeamContent(db, team.id)]);
  const rows = teamRows(
    games.filter((g) => g.teamId === team.id),
    now,
  );
  const next = rows.find((r) => r.cell.kind === "next" || r.cell.kind === "live")?.game ?? null;
  const stats = recordStats(team.record);
  const levelName = levelLabel[team.level];
  const year = rows[0]?.game.startDate.slice(0, 4);
  const teamQuery = `sport=${team.sportSlug}&level=${team.level}`;
  const anyLeague = rows.some((r) => r.game.isLeague);

  const schedulePanel = (
    <div className={t.card}>
      <div className={t.cardHead}>
        <h2 className={`ath-display ${t.h2}`}>Schedule &amp; results</h2>
        <span className={t.meta}>
          {anyLeague ? "League games marked ★ · " : ""}
          {rows.every((r) => r.game.source === "arbiter") && rows.length ? "Synced from Arbiter" : "Fall schedule snapshot"}
        </span>
      </div>
      {rows.length === 0 ? (
        <Empty>{`No ${levelName} games are on the schedule yet. They appear here when Arbiter lists them.`}</Empty>
      ) : (
        <div className={t.scroll} tabIndex={0} role="region" aria-label={`${team.sport} ${levelName} schedule, scrolls sideways on small screens`}>
          <table className={t.sched}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Opponent</th>
                <th scope="col">Result</th>
                <th scope="col">
                  <span className="ath-visually-hidden">Links</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.game.id} className={row.cell.kind === "next" ? t.nextRow : undefined}>
                  <td>
                    <span className={t.cellStack}>
                      <b className={t.cellDate}>{formatShortDate(row.game.startDate)}</b>
                      <span className={t.small}>{timeLabel(row.game)}</span>
                    </span>
                  </td>
                  <td>
                    <span className={t.cellStack}>
                      <b>
                        {opponentLine(row.game)}
                        {row.game.isLeague ? (
                          <>
                            {" "}
                            <span aria-hidden="true">★</span>
                          </>
                        ) : null}
                      </b>
                      {row.note ? <span className={t.small}>{row.note}</span> : null}
                    </span>
                  </td>
                  <td>
                    <ResultText cell={row.cell} />
                  </td>
                  <td className={t.actionsCell}>
                    <GameActions game={row.game} directionsLabel="Map" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const rosterPanel = (
    <div className={t.card}>
      <div className={t.cardHead}>
        <h2 className={`ath-display ${t.h2}`}>{year ?? ""} roster</h2>
        <span className={t.meta}>Names follow the district&apos;s directory-information rules</span>
      </div>
      {teamContent.roster.length === 0 ? (
        <Empty>The roster appears here once the coaching staff posts it in Athletics Studio.</Empty>
      ) : (
        <ul className={t.roster}>
          {teamContent.roster.map((p) => (
            <li key={p.id} className={t.player}>
              <span className={`ath-display ${t.num}`}>{p.jerseyNumber ?? ""}</span>
              <span className={t.cellStack}>
                <b>{p.displayName}</b>
                <span className={t.small}>{[p.position, p.grade ? `Grade ${p.grade}` : null].filter(Boolean).join(" · ")}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const items = [
    { id: "schedule", label: "Schedule", panel: schedulePanel },
    { id: "roster", label: "Roster", panel: rosterPanel },
    {
      id: "coaches",
      label: "Coaches",
      panel: (
        <div className={t.card}>
          <Empty>Coach profiles are added in Athletics Studio. To reach a coach, contact the athletics office.</Empty>
        </div>
      ),
    },
    {
      id: "news",
      label: "News",
      panel:
        teamContent.stories.length === 0 ? (
          <Empty>{`No ${team.sport.toLowerCase()} stories yet. Recaps appear here when the coaching staff publishes them.`}</Empty>
        ) : (
          <ul className={t.list}>
            {teamContent.stories.map((s) => (
              <li key={s.id} className={t.card}>
                <span className={`ath-label ${t.small}`}>{formatShortDate(s.publishedAt.toISOString().slice(0, 10))}</span>
                <h3>{s.title}</h3>
                {s.summary ? <p className={t.meta}>{s.summary}</p> : null}
              </li>
            ))}
          </ul>
        ),
    },
    {
      id: "photos",
      label: "Photos",
      panel:
        teamContent.albums.length === 0 ? (
          <Empty>Game albums appear here when the coaching staff posts them.</Empty>
        ) : (
          <ul className={t.list}>
            {teamContent.albums.map((a) => (
              <li key={a.id} className={t.card}>
                {a.title}
              </li>
            ))}
          </ul>
        ),
    },
    {
      id: "documents",
      label: "Documents",
      panel:
        teamContent.documents.length === 0 ? (
          <Empty>Practice schedules and team documents appear here when the coaching staff posts them.</Empty>
        ) : (
          <ul className={t.list}>
            {teamContent.documents.map((d) => (
              <li key={d.id} className={t.card}>
                {d.url ? <a href={d.url}>{d.title}</a> : d.title} <span className={t.small}>{d.kind}</span>
              </li>
            ))}
          </ul>
        ),
    },
  ];

  return (
    <div data-school={slug} className={styles.page}>
      <UtilityBar other={other} content={content} />
      <Masthead school={school} seasons={[]} current="team" />
      <main>
        <section className={`${t.head} ath-on-dark`} aria-labelledby="team-title">
          <Motif kind={content.motif} />
          <div className={`ath-wrap ${t.headIn}`}>
            <nav aria-label="Breadcrumb">
              <ol className={t.crumbs}>
                <li>
                  <Link href={`/${slug}`}>{school.mascot}</Link>
                </li>
                <li>
                  <Link href={`/${slug}#teams-${team.term}`}>{termLabel[team.term]}</Link>
                </li>
                <li aria-current="page">{team.sport}</li>
              </ol>
            </nav>
            <div className={t.titleBlock}>
              <span className={`ath-label ${t.kicker}`}>
                {school.shortName} {school.mascot}
                {year ? ` · ${year} season` : ""}
              </span>
              <h1 id="team-title" className={`ath-display ${t.h1}`}>
                {team.sport}
              </h1>
            </div>
            <div className={t.controls}>
              {levels.length > 1 ? (
                <nav aria-label="Team level">
                  <ul className={t.levels}>
                    {levels.map((l) => (
                      <li key={l}>
                        <Link
                          href={l === "varsity" ? `/${slug}/teams/${sportSlug}` : `/${slug}/teams/${sportSlug}?level=${l}`}
                          aria-current={l === team.level ? "page" : undefined}
                        >
                          {levelLabel[l]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
              <Link className={`${t.btn} ${t.btnAccent}`} href={`/${slug}#alerts`}>
                <BellIcon />
                Follow {levelName}
              </Link>
              <Link className={`${t.btn} ${t.btnLine}`} href={`/${slug}/schedule?${teamQuery}`}>
                <CalendarAddIcon />
                Subscribe to schedule
              </Link>
            </div>
            {stats.length > 0 ? (
              <dl className={t.stats} aria-label={`${levelName} record`}>
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt>{s.label}</dt>
                    <dd>{s.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className={t.notice}>
                {levelName} records appear here as soon as they&apos;re published. Results for each game are in the schedule below.
              </p>
            )}
          </div>
        </section>
        <div className={`ath-wrap ${t.layout}`}>
          <div className={t.panel}>
            <Tabs
              items={items}
              label="Team page sections"
              classNames={{ listWrap: t.tabsWrap, list: t.tabList, tab: t.tab, panel: t.panelBody }}
            />
          </div>
          <aside className={t.side} aria-label="Team details">
            {next ? (
              <div className={`${t.card} ${t.nextCard} ath-on-dark`}>
                <h2 className={`ath-label ${t.asideLabel}`}>Next game</h2>
                <p className={`ath-display ${t.nextOpp}`}>{opponentLine(next)}</p>
                <p className={t.nextWhen}>
                  {formatShortDate(next.startDate)} · {timeLabel(next)}
                  {next.isLeague ? " · League" : ""}
                </p>
                <div className={t.nextButtons}>
                  {next.venueAddress ? (
                    <a className={`${t.btn} ${t.btnAccent}`} href={mapsUrl(next.venueAddress)}>
                      <PinIcon />
                      Directions
                    </a>
                  ) : null}
                  {next.streamUrl ? (
                    <a className={`${t.btn} ${t.btnLine}`} href={next.streamUrl}>
                      <WatchIcon />
                      Watch
                    </a>
                  ) : null}
                  <a className={`${t.btn} ${t.btnLine}`} href={`/api/games/${next.id}/ics`}>
                    <CalendarAddIcon />
                    Add to calendar
                  </a>
                </div>
              </div>
            ) : null}
            {teamContent.coachNote ? (
              <div className={`${t.card} ${t.asideCard}`}>
                <h2 className={`ath-label ${t.asideLabel}`}>From the coach</h2>
                <p className={t.asideText}>{teamContent.coachNote.body}</p>
                <span className={t.small}>Posted {formatShortDate(teamContent.coachNote.publishedAt.toISOString().slice(0, 10))}</span>
              </div>
            ) : null}
            <div className={`${t.card} ${t.asideCard}`}>
              <h2 className={`ath-label ${t.asideLabel}`}>League standings</h2>
              <a className={t.standings} href={LEAGUE_URL}>
                Puget Sound League
                {team.record.league
                  ? ` · ${team.record.leagueRank ? `${ordinal(team.record.leagueRank)}, ` : ""}${formatRecord(team.record.league)}`
                  : ""}{" "}
                <span aria-hidden="true">→</span>
              </a>
              <span className={t.small}>Standings come straight from the league site, so they&apos;re never out of date.</span>
            </div>
            <div className={`${t.card} ${t.asideCard}`}>
              <h2 className={`ath-label ${t.asideLabel}`}>Team partners</h2>
              <ul className={t.sponsors}>
                {teamContent.sponsors.length > 0
                  ? teamContent.sponsors.map((s) => <li key={s.id}>{s.url ? <a href={s.url}>{s.name}</a> : s.name}</li>)
                  : ["[Sponsor]", "[Sponsor]"].map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </aside>
        </div>
      </main>
      <SchoolFooter school={school} content={content} />
    </div>
  );
}
