import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { TrustFooter } from "../../../../components/studio/trust-footer";
import { Badge, Card, PageHead } from "../../../../components/studio/ui";
import styles from "../../../../components/studio/studio.module.css";
import * as s from "../../../../lib/db/schema";
import { levelLabel } from "../../../../lib/schedule/games";
import { requireStudio } from "../../../../lib/studio/context";
import { publishStoryAction, saveStoryAction, unpublishStoryAction } from "../actions";

type Search = Promise<{ saved?: string; error?: string }>;

/** Edit a story; publish or unpublish it (design/CMS-Story-Editor.dc.html, without the agent). */
export default async function EditStory({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  const { id } = await params;
  const ctx = await requireStudio(`/studio/stories/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [story] = await ctx.db.select().from(s.story).where(eq(s.story.id, id));
  const team = ctx.teams.find((t) => t.id === story?.teamId);
  if (!story || !team) notFound();
  const scope = { schoolId: team.schoolId, teamId: team.id };
  if (!ctx.can("story.draft", scope) && !ctx.can("content.takedown", scope)) notFound();
  const canPublish = ctx.can("story.publish", scope);
  const school = ctx.schools.find((x) => x.id === team.schoolId)!;
  const published = story.status === "published";
  const { saved, error } = await searchParams;

  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow={`Stories · ${team.sport} · ${levelLabel[team.level]}`}
          title={story.title}
          sub={published ? "Published. It shows on the team page and the school home." : "Draft. Only people in the Studio can see it."}
          actions={
            <>
              {published ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
              {published ? (
                <Link className="nx-btn nx-btn--secondary nx-btn--sm" href={`/${school.slug}/stories/${story.slug}`}>
                  View on the site
                </Link>
              ) : null}
            </>
          }
        />
        {saved ? (
          <div className="nx-banner nx-banner--success" role="status">
            <div className="nx-banner__body">
              {saved} <Link href="/studio/activity">Undo in Activity</Link>
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="nx-banner nx-banner--danger" role="alert">
            <div className="nx-banner__body">{error}</div>
          </div>
        ) : null}
        <div className={styles.grid2}>
          <Card title="Story">
            <form action={saveStoryAction.bind(null, story.id)} className={styles.form}>
              <label className="nx-field">
                <span className="nx-field__label">Title</span>
                <input className="nx-input" name="title" required maxLength={120} defaultValue={story.title} />
              </label>
              <label className="nx-field">
                <span className="nx-field__label">Summary (one sentence for cards)</span>
                <input className="nx-input" name="summary" maxLength={240} defaultValue={story.summary ?? ""} />
              </label>
              <label className="nx-field">
                <span className="nx-field__label">Story</span>
                <textarea className="nx-textarea" name="body" rows={12} required maxLength={8000} defaultValue={story.body} />
                <span className="nx-field__help">Leave a blank line between paragraphs. Names: first name, last initial.</span>
              </label>
              <button type="submit" className="nx-btn nx-btn--secondary" disabled={published && !canPublish}>
                Save
              </button>
            </form>
          </Card>
          <Card title="Where it appears" subtitle="Fixed by template; coaches edit words, not layout">
            <ul className={styles.list}>
              <li className={styles.checkRow}>
                <span>{team.sport} team page, News tab</span>
                <Badge tone={published ? "success" : "plain"}>{published ? "Showing" : "After publishing"}</Badge>
              </li>
              <li className={styles.checkRow}>
                <span>{school.shortName} {school.mascot} home, Stories</span>
                <Badge tone={published ? "success" : "plain"}>{published ? "Showing" : "After publishing"}</Badge>
              </li>
              <li className={styles.checkRow}>
                <span>Official school social accounts</span>
                <Badge tone="plain">Never from here</Badge>
              </li>
            </ul>
            <div className={styles.row} style={{ marginTop: "var(--space-4)" }}>
              {published ? (
                <form action={unpublishStoryAction.bind(null, story.id)}>
                  <button type="submit" className="nx-btn nx-btn--secondary">
                    Unpublish
                  </button>
                </form>
              ) : canPublish ? (
                <form action={publishStoryAction.bind(null, story.id)}>
                  <button type="submit" className="nx-btn nx-btn--primary">
                    Publish
                  </button>
                </form>
              ) : (
                <p className={styles.muted}>The head coach or an athletic director publishes this story.</p>
              )}
            </div>
          </Card>
        </div>
      </main>
      <TrustFooter items={[published ? "Live on the site" : "Draft only", "Unpublish any time", "Nothing posted to social"]} />
    </>
  );
}
