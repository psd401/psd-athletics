import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import phone from "../../../../components/school/phone.module.css";
import { PhoneTabBar } from "../../../../components/school/phone-tabbar";
import { Masthead, SchoolFooter, UtilityBar } from "../../../../components/school/school-sections";
import styles from "../../../../components/school/school.module.css";
import st from "../../../../components/school/stories.module.css";
import { paragraphs } from "../../../../components/school/stories-section";
import { appDb } from "../../../../lib/data/db";
import { listSchools } from "../../../../lib/data/queries";
import { schoolContent } from "../../../../lib/schools/content";
import { formatShortDate, pacificDate } from "../../../../lib/schedule/time";
import { getPublishedStory } from "../../../../lib/studio/stories";

type Params = Promise<{ school: string; slug: string }>;

async function load(slug: string, storySlug: string) {
  if (!schoolContent[slug]) return null;
  const db = await appDb();
  const schools = await listSchools(db);
  const school = schools.find((s) => s.slug === slug);
  const other = schools.find((s) => s.slug !== slug);
  if (!school || !other) return null;
  const story = await getPublishedStory(db, school.id, storySlug);
  return story ? { school, other, story } : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { school, slug } = await params;
  const loaded = await load(school, slug);
  return { title: loaded ? `${loaded.story.title} · ${loaded.school.mascot} Athletics` : "Story not found", description: loaded?.story.summary ?? undefined };
}

/** A published story. Drafts and unpublished stories are not found. */
export default async function StoryPage({ params }: { params: Params }) {
  const { school: slug, slug: storySlug } = await params;
  await connection();
  const loaded = await load(slug, storySlug);
  if (!loaded) notFound();
  const { school, other, story } = loaded;
  const content = schoolContent[slug]!;
  return (
    <div data-school={slug} className={`${styles.page} ${phone.page}`}>
      <UtilityBar other={other} content={content} />
      <Masthead school={school} seasons={[]} current="team" traditionNav={content.traditionNav} />
      <main className="ath-wrap">
        <article className={st.article}>
          {story.sportSlug ? (
            <Link className={st.crumb} href={`/${slug}/teams/${story.sportSlug}`}>
              ← {story.sport}
            </Link>
          ) : null}
          <span className={`ath-label ${st.kicker}`}>
            {[story.sport, formatShortDate(pacificDate(story.publishedAt))].filter(Boolean).join(" · ")}
          </span>
          <h1 className={`ath-display ${st.h1}`}>{story.title}</h1>
          {story.summary ? <p className={st.summary}>{story.summary}</p> : null}
          <div className={st.body}>
            {paragraphs(story.body).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </article>
      </main>
      <SchoolFooter school={school} content={content} />
      <PhoneTabBar slug={slug} />
    </div>
  );
}
