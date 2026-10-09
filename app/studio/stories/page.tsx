import Link from "next/link";
import { desc, inArray } from "drizzle-orm";

import { TrustFooter } from "../../../components/studio/trust-footer";
import { Badge, Card, ListRow, PageHead } from "../../../components/studio/ui";
import styles from "../../../components/studio/studio.module.css";
import * as s from "../../../lib/db/schema";
import { levelLabel } from "../../../lib/schedule/games";
import { requireStudio } from "../../../lib/studio/context";

/** Drafts and published stories for the person's teams. */
export default async function StudioStories() {
  const ctx = await requireStudio("/studio/stories");
  const teamIds = ctx.teams.filter((t) => ctx.can("story.draft", { schoolId: t.schoolId, teamId: t.id })).map((t) => t.id);
  const stories = teamIds.length
    ? await ctx.db.select().from(s.story).where(inArray(s.story.teamId, teamIds)).orderBy(desc(s.story.updatedAt)).limit(50)
    : [];
  const teamName = (id: string | null) => {
    const t = ctx.teams.find((x) => x.id === id);
    return t ? `${t.sport} · ${levelLabel[t.level]}` : "";
  };
  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow="Stories"
          title="Stories"
          sub="Recaps and announcements for your teams. Drafts stay in the Studio until someone who can publish puts them live."
          actions={
            teamIds.length ? (
              <Link className="nx-btn nx-btn--primary" href="/studio/stories/new">
                New story
              </Link>
            ) : null
          }
        />
        <Card title="Your stories" subtitle={stories.length ? "Newest first" : undefined}>
          {stories.length ? (
            <ul className={`nx-list ${styles.list}`}>
              {stories.map((st) => (
                <ListRow
                  key={st.id}
                  title={st.title}
                  subtitle={teamName(st.teamId)}
                  href={`/studio/stories/${st.id}`}
                  end={st.status === "published" ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}
                />
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No stories yet.</p>
          )}
        </Card>
      </main>
      <TrustFooter items={["Read only on this screen", "Nothing publishes until you approve it"]} />
    </>
  );
}
