import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import { TrustFooter } from "../../../components/studio/trust-footer";
import { Card, PageHead } from "../../../components/studio/ui";
import styles from "../../../components/studio/studio.module.css";
import * as s from "../../../lib/db/schema";
import { listGames } from "../../../lib/data/queries";
import { MAX_POST_PHOTOS } from "../../../lib/feed/posts";
import { byStart, gameState, levelLabel, opponentLine, timeLabel } from "../../../lib/schedule/games";
import { formatShortDate, pacificDate } from "../../../lib/schedule/time";
import { requireStudio } from "../../../lib/studio/context";
import { publishPostAction, removePostAction } from "./actions";

type Search = Promise<{ team?: string; saved?: string; error?: string }>;

/** Post from the sideline: photos, a score update or a note (design/CMS-Sideline-Mobile.dc.html). */
export default async function PostPage({ searchParams }: { searchParams: Search }) {
  const ctx = await requireStudio("/studio/post");
  const teams = ctx.teams.filter((t) => ctx.can("feed.post", { schoolId: t.schoolId, teamId: t.id }));
  if (!teams.length) notFound();
  const { team: teamParam, saved, error } = await searchParams;
  const team = teams.find((t) => t.id === teamParam) ?? teams.find((t) => t.level === "varsity") ?? teams[0]!;
  const school = ctx.schools.find((x) => x.id === team.schoolId)!;
  const games = (await listGames(ctx.db, { schoolId: team.schoolId })).filter((g) => g.teamId === team.id).sort(byStart);
  const today = games.find((g) => ["live", "tonight", "today"].includes(gameState(g, ctx.now))) ?? null;
  const recent = await ctx.db
    .select({ id: s.feedPost.id, kind: s.feedPost.kind, body: s.feedPost.body, publishedAt: s.feedPost.publishedAt })
    .from(s.feedPost)
    .where(and(inArray(s.feedPost.teamId, teams.map((t) => t.id)), eq(s.feedPost.authorId, ctx.person.id), isNotNull(s.feedPost.publishedAt)))
    .orderBy(desc(s.feedPost.publishedAt))
    .limit(5);
  const name = (t: (typeof teams)[number]) => `${t.sport} · ${levelLabel[t.level]}`;
  // Drafts an AI assistant wrote for this person's teams (SPEC §8: agents propose, people publish).
  const drafts = await ctx.db
    .select({ id: s.feedPost.id, kind: s.feedPost.kind, body: s.feedPost.body, teamId: s.feedPost.teamId })
    .from(s.feedPost)
    .where(and(inArray(s.feedPost.teamId, teams.map((t) => t.id)), isNull(s.feedPost.publishedAt)))
    .orderBy(desc(s.feedPost.createdAt))
    .limit(10);

  return (
    <>
      <main className={`${styles.main} ${styles.narrow}`}>
        <PageHead
          eyebrow={today ? `${gameState(today, ctx.now) === "live" ? "Live" : "Today"} · ${opponentLine(today)} · ${timeLabel(today)}` : "Studio"}
          title={`Post to ${team.sport}`}
          sub="Goes straight to the team feed and the team page, as you. No likes or comments."
        />
        {saved ? (
          <div className="nx-banner nx-banner--success" role="status">
            <div className="nx-banner__body">
              {saved} <Link href={`/${school.slug}/feed`}>See the feed</Link> · <Link href="/studio/activity">Undo in Activity</Link>
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="nx-banner nx-banner--danger" role="alert">
            <div className="nx-banner__body">{error}</div>
          </div>
        ) : null}
        {teams.length > 1 ? (
          <nav aria-label="Team" className={styles.row}>
            {teams.map((t) => (
              <Link key={t.id} href={`/studio/post?team=${t.id}`} className={`nx-btn nx-btn--sm ${t.id === team.id ? "nx-btn--primary" : "nx-btn--secondary"}`} aria-current={t.id === team.id ? "page" : undefined}>
                {name(t)}
              </Link>
            ))}
          </nav>
        ) : null}

        <Card title={name(team)}>
          <form action="/studio/post/submit" method="post" encType="multipart/form-data" className={styles.form}>
            <input type="hidden" name="teamId" value={team.id} />
            <fieldset className={styles.fieldset}>
              <legend className="nx-field__label">What are you posting?</legend>
              {(
                [
                  ["photo", "Photos"],
                  ["score", "Score update"],
                  ["note", "Note"],
                ] as const
              ).map(([value, label], i) => (
                <label key={value} className={styles.radio}>
                  <input type="radio" name="kind" value={value} defaultChecked={i === 0} required /> {label}
                </label>
              ))}
            </fieldset>
            <label className="nx-field">
              <span className="nx-field__label">Game</span>
              <select className="nx-select" name="gameId" defaultValue={today?.id ?? ""}>
                <option value="">No game</option>
                {games.map((g) => (
                  <option key={g.id} value={g.id}>
                    {`${opponentLine(g)}, ${formatShortDate(g.startDate)}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="nx-field">
              <span className="nx-field__label">Words</span>
              <textarea className="nx-textarea" name="body" rows={3} maxLength={500} placeholder="Halftime: Tides 1, Capital 0." />
            </label>
            {Array.from({ length: MAX_POST_PHOTOS }, (_, i) => i + 1).map((n) => (
              <div key={n} className={styles.photoPick}>
                <div className="nx-field">
                  <label className="nx-field__label" htmlFor={`photo${n}`}>
                    Photo {n}
                  </label>
                  <input id={`photo${n}`} className="nx-input" type="file" name={`photo${n}`} accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif" />
                </div>
                <label className="nx-field">
                  <span className="nx-field__label">Image description for photo {n}</span>
                  <input className="nx-input" name={`alt${n}`} maxLength={300} placeholder="What's in the photo, for screen readers" />
                </label>
              </div>
            ))}
            <button type="submit" className="nx-btn nx-btn--primary">
              Post to the team feed
            </button>
          </form>
        </Card>

        {drafts.length ? (
          <Card title="Drafts from your assistant" subtitle="Read each one, then publish it to the team feed">
            <ul className={`nx-list ${styles.list}`}>
              {drafts.map((p) => (
                <li key={p.id} className={styles.checkRow}>
                  <span>
                    {p.body ?? p.kind} <span className={styles.muted}>· {name(teams.find((t) => t.id === p.teamId)!)}</span>
                  </span>
                  <form action={publishPostAction.bind(null, p.id)}>
                    <button type="submit" className="nx-btn nx-btn--secondary nx-btn--sm" aria-label={`Publish "${(p.body ?? p.kind).slice(0, 40)}"`}>
                      Publish
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {recent.length ? (
          <Card title="Your recent posts" subtitle="Remove one from the feed; you can undo for 30 minutes">
            <ul className={`nx-list ${styles.list}`}>
              {recent.map((p) => (
                <li key={p.id} className={styles.checkRow}>
                  <span>
                    {p.body ?? (p.kind === "photo" ? "Photos" : p.kind)} <span className={styles.muted}>· {formatShortDate(pacificDate(p.publishedAt!))}</span>
                  </span>
                  <form action={removePostAction.bind(null, p.id)}>
                    <button type="submit" className="nx-btn nx-btn--quiet nx-btn--sm" aria-label={`Remove the post "${(p.body ?? "Photos").slice(0, 40)}"`}>
                      Remove
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </main>
      <TrustFooter items={["Posts as you", `${team.sport} only`, "Undo for 30 minutes"]} />
    </>
  );
}
