import Link from "next/link";

import { TrustFooter } from "../../../../components/studio/trust-footer";
import { Card, ListRow, PageHead } from "../../../../components/studio/ui";
import styles from "../../../../components/studio/studio.module.css";
import { listGames } from "../../../../lib/data/queries";
import { latestFinals, levelLabel, opponentLine } from "../../../../lib/schedule/games";
import { formatShortDate } from "../../../../lib/schedule/time";
import { requireStudio } from "../../../../lib/studio/context";
import { factsFromGame } from "../../../../lib/studio/stories";
import { createStoryAction } from "../actions";

type Search = Promise<{ team?: string; game?: string; error?: string }>;

/** Start a story: blank, or from a final score (facts only; the coach adds the rest). */
export default async function NewStory({ searchParams }: { searchParams: Search }) {
  const ctx = await requireStudio("/studio/stories/new");
  const teams = ctx.teams.filter((t) => ctx.can("story.draft", { schoolId: t.schoolId, teamId: t.id }));
  const { team: teamParam, game: gameParam, error } = await searchParams;
  const team = teams.find((t) => t.id === teamParam) ?? (teams.length === 1 ? teams[0] : undefined);
  const games = team ? (await listGames(ctx.db, { schoolId: team.schoolId })).filter((g) => g.teamId === team.id) : [];
  const finals = latestFinals(games, 5);
  const game = games.find((g) => g.id === gameParam);
  const facts = game ? factsFromGame(game) : null;

  return (
    <>
      <main className={styles.main}>
        <PageHead eyebrow="Stories" title="New story" sub="It stays a draft until it's published. Names follow the district rule: first name, last initial." />
        {error ? (
          <div className="nx-banner nx-banner--danger" role="alert">
            <div className="nx-banner__body">{error}</div>
          </div>
        ) : null}
        {!team ? (
          <Card title="Which team?">
            <ul className={`nx-list ${styles.list}`}>
              {teams.map((t) => (
                <ListRow key={t.id} title={`${t.sport} · ${levelLabel[t.level]}`} href={`/studio/stories/new?team=${t.id}`} />
              ))}
            </ul>
          </Card>
        ) : (
          <div className={styles.grid2}>
            <Card title={`${team.sport} · ${levelLabel[team.level]}`} subtitle={facts ? "Started from the final score. Add what happened." : "Write it, then save the draft."}>
              <form action={createStoryAction} className={styles.form}>
                <input type="hidden" name="teamId" value={team.id} />
                <input type="hidden" name="gameId" value={game?.id ?? ""} />
                <label className="nx-field">
                  <span className="nx-field__label">Title</span>
                  <input className="nx-input" name="title" required maxLength={120} defaultValue={facts?.title ?? ""} />
                </label>
                <label className="nx-field">
                  <span className="nx-field__label">Summary (one sentence for cards)</span>
                  <input className="nx-input" name="summary" maxLength={240} />
                </label>
                <label className="nx-field">
                  <span className="nx-field__label">Story</span>
                  <textarea className="nx-textarea" name="body" rows={10} required maxLength={8000} defaultValue={facts ? `${facts.body}\n\n` : ""} />
                  <span className="nx-field__help">Leave a blank line between paragraphs.</span>
                </label>
                <button type="submit" className="nx-btn nx-btn--primary">
                  Save draft
                </button>
              </form>
            </Card>
            <Card title="Start from a final" subtitle="Fills in the score, opponent, place and date. No athlete names.">
              {finals.length ? (
                <ul className={`nx-list ${styles.list}`}>
                  {finals.map((g) => (
                    <ListRow
                      key={g.id}
                      title={`${opponentLine(g)}, ${g.scoreUs}–${g.scoreThem}`}
                      subtitle={formatShortDate(g.startDate)}
                      href={`/studio/stories/new?team=${team.id}&game=${g.id}`}
                    />
                  ))}
                </ul>
              ) : (
                <p className={styles.muted}>No finals yet this season.</p>
              )}
              <p style={{ margin: "var(--space-3) 0 0" }}>
                <Link className="nx-btn nx-btn--quiet" href="/studio/stories/new">
                  Pick another team
                </Link>
              </p>
            </Card>
          </div>
        )}
      </main>
      <TrustFooter items={["Drafts are private", "Nothing publishes until you approve it", "No student data shown"]} />
    </>
  );
}
