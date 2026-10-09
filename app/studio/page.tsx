import Link from "next/link";
import { and, desc, eq, inArray } from "drizzle-orm";

import { TrustFooter } from "../../components/studio/trust-footer";
import { Badge, Card, ContextChip, Decision, ListRow, PageHead, StatTile, StatusStrip } from "../../components/studio/ui";
import styles from "../../components/studio/studio.module.css";
import * as s from "../../lib/db/schema";
import { getTeamContent, listGames } from "../../lib/data/queries";
import { byStart, gameState, levelLabel, opponentLine, timeLabel } from "../../lib/schedule/games";
import { recordStats } from "../../lib/schedule/team";
import { formatLongDate, formatShortDate } from "../../lib/schedule/time";
import { requireStudio } from "../../lib/studio/context";

/** A coach's or AD's day (design/CMS-Today.dc.html). */
export default async function StudioToday() {
  const ctx = await requireStudio("/studio");
  const { db, now, today, myTeams } = ctx;
  const teamIds = myTeams.map((t) => t.id);
  const coachTeam = myTeams.length > 0 && myTeams.length <= 3 ? myTeams.find((t) => t.level === "varsity") ?? myTeams[0]! : null;

  const games = teamIds.length ? (await listGames(db)).filter((g) => teamIds.includes(g.teamId)) : [];
  const upcoming = games.filter((g) => ["live", "tonight", "today", "upcoming"].includes(gameState(g, now))).sort(byStart);
  const tonight = upcoming.find((g) => ["live", "tonight", "today"].includes(gameState(g, now))) ?? null;

  const drafts = teamIds.length
    ? await db
        .select({ id: s.story.id, title: s.story.title, teamId: s.story.teamId, updatedAt: s.story.updatedAt })
        .from(s.story)
        .where(and(eq(s.story.status, "draft"), inArray(s.story.teamId, teamIds)))
        .orderBy(desc(s.story.updatedAt))
        .limit(3)
    : [];
  const pendingChanges = teamIds.length
    ? await db
        .select({ id: s.scheduleChange.id })
        .from(s.scheduleChange)
        .innerJoin(s.game, eq(s.scheduleChange.gameId, s.game.id))
        .where(and(eq(s.scheduleChange.status, "pending"), inArray(s.game.teamId, teamIds)))
    : [];
  const checklist = coachTeam ? await getTeamContent(db, coachTeam.id) : null;
  const stats = coachTeam ? recordStats(coachTeam.record).slice(0, 2) : [];
  const teamName = coachTeam ? `${coachTeam.sport} · ${levelLabel[coachTeam.level]}` : null;
  const school = coachTeam ? ctx.schools.find((x) => x.id === coachTeam.schoolId) : null;

  const title = tonight
    ? `${gameState(tonight, now) === "live" ? "Now" : "Tonight"} ${opponentLine(tonight)}`
    : myTeams.length
      ? "Today"
      : `Welcome, ${ctx.person.name.split(" ")[0]}`;

  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow={`${formatLongDate(today)}${tonight ? " · game day" : ""}`}
          title={title}
          sub={
            tonight
              ? `${tonight.sport} · ${levelLabel[tonight.level]} · ${timeLabel(tonight)} ${tonight.homeAway === "home" ? "at home" : "away"}. Your team page and the ${tonight.mascot} home page already show it.`
              : myTeams.length
                ? "Here's what's coming up for your teams."
                : "You don't have a team or school assignment yet. An athletic director adds you in People and roles."
          }
          actions={
            coachTeam && school ? (
              <Link className="nx-btn nx-btn--secondary nx-btn--sm" href={`/${school.slug}/teams/${coachTeam.sportSlug}`}>
                View team page
              </Link>
            ) : null
          }
        />

        {coachTeam && teamName ? (
          <div className={styles.row}>
            <ContextChip name="Team" value={teamName} source="from your coaching assignment" />
            <ContextChip name="Publishes to" value={`Team page and ${school?.mascot ?? "school"} home`} source="district default" />
            <ContextChip name="Names" value="First name, last initial" source="district rule" />
          </div>
        ) : null}

        <StatusStrip
          items={[
            "Schedule from the fall snapshot (Arbiter isn't connected yet)",
            `${drafts.length} ${drafts.length === 1 ? "draft" : "drafts"} waiting`,
            "Every change can be undone for 30 minutes",
          ]}
        />

        <div className={styles.grid2}>
          {drafts.length > 0 ? (
            drafts.slice(0, 1).map((d) => (
              <Decision
                key={d.id}
                eyebrow={`Stories · saved ${formatShortDate(d.updatedAt.toISOString().slice(0, 10))}`}
                title={`Publish "${d.title}"`}
                why="This draft is ready for you to read. It won't appear on the site until you publish it."
                label="Your decision"
                reaches={
                  <>
                    Reaches<b>Team page · school home</b>
                  </>
                }
                actions={
                  <Link className="nx-btn nx-btn--secondary" href={`/studio/stories/${d.id}`}>
                    Open the draft
                  </Link>
                }
                undo="Unpublish any time · nothing posted to social"
              />
            ))
          ) : (
            <Decision
              eyebrow="Stories"
              title="No drafts waiting"
              why="Write a recap or announcement for your team. It stays a draft until you publish it."
              label="When you're ready"
              reaches={
                <>
                  Drafts<b>0</b>
                </>
              }
              actions={
                myTeams.length ? (
                  <Link className="nx-btn nx-btn--secondary" href="/studio/stories/new">
                    Start a story
                  </Link>
                ) : null
              }
              undo="Nothing publishes until you approve it"
            />
          )}
          <Decision
            needs={pendingChanges.length > 0}
            eyebrow="Schedule · from Arbiter"
            title={pendingChanges.length ? "Confirm schedule changes" : "No schedule changes to confirm"}
            why={
              pendingChanges.length
                ? "Arbiter changed your games. Families who follow the team get one text when you confirm."
                : "When Arbiter moves one of your games, it shows up here for you to confirm before followers get a text."
            }
            label={pendingChanges.length ? "Needs you" : "All clear"}
            reaches={
              <>
                Games changed<b>{pendingChanges.length}</b>
              </>
            }
            actions={null}
            undo="The Arbiter sync arrives in a later phase"
          />
        </div>

        <div className={styles.grid2}>
          <Card title="Coming up" subtitle={`${teamName ?? "Your teams"} · fall schedule snapshot`}>
            {upcoming.length ? (
              <ul className={`nx-list ${styles.list}`}>
                {upcoming.slice(0, 4).map((g) => (
                  <ListRow
                    key={g.id}
                    title={`${myTeams.length > 1 ? `${g.sport} ` : ""}${opponentLine(g)}`}
                    subtitle={`${formatShortDate(g.startDate)} · ${timeLabel(g)} · ${g.homeAway === "home" ? "Home" : "Away"}`}
                    end={gameState(g, now) === "tonight" ? <Badge tone="attention">Tonight</Badge> : null}
                  />
                ))}
              </ul>
            ) : (
              <p className={styles.muted}>No upcoming games on the schedule.</p>
            )}
          </Card>
          <div className={styles.stack}>
            {stats.length ? (
              <div className={styles.grid2}>
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <StatTile label={stat.label} value={stat.value} context="as published" />
                  </Card>
                ))}
              </div>
            ) : null}
            {checklist && school && coachTeam ? (
              <Card title="Team page checklist" subtitle={`What families see at athletics.psd401.net/${school.slug}`}>
                <div className={styles.stack} style={{ gap: 4 }}>
                  <div className={styles.checkRow}>
                    <span>Schedule and results</span>
                    <Badge tone="info">Snapshot</Badge>
                  </div>
                  <div className={styles.checkRow}>
                    <span>Roster</span>
                    {checklist.roster.length ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Missing</Badge>}
                  </div>
                  <div className={styles.checkRow}>
                    <span>Note from the coach</span>
                    {checklist.coachNote ? <Badge tone="success">Posted</Badge> : <Badge tone="warning">Missing</Badge>}
                  </div>
                  <div className={styles.checkRow}>
                    <span>Documents</span>
                    {checklist.documents.length ? <Badge tone="success">{checklist.documents.length}</Badge> : <Badge tone="info">None yet</Badge>}
                  </div>
                  <div className={styles.checkRow}>
                    <span>Team partners</span>
                    {checklist.sponsors.length ? <Badge tone="success">{checklist.sponsors.length}</Badge> : <Badge tone="info">Add logos</Badge>}
                  </div>
                </div>
                <p style={{ margin: "var(--space-3) 0 0" }}>
                  <Link className="nx-btn nx-btn--quiet" href={`/studio/teams/${coachTeam.id}`}>
                    Edit the team page
                  </Link>
                </p>
              </Card>
            ) : null}
          </div>
        </div>
      </main>
      <TrustFooter items={["Read only on this screen", "Nothing publishes until you approve it", "No student data shown"]} />
    </>
  );
}
