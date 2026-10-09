import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { FeedList } from "../../../components/school/feed-list";
import phone from "../../../components/school/phone.module.css";
import { PhoneTabBar } from "../../../components/school/phone-tabbar";
import ph from "../../../components/school/photos.module.css";
import { Masthead, SchoolFooter, UtilityBar } from "../../../components/school/school-sections";
import styles from "../../../components/school/school.module.css";
import { appDb } from "../../../lib/data/db";
import { listGames, listSchools, listTeams } from "../../../lib/data/queries";
import { gameLabels, listFeed } from "../../../lib/feed/posts";
import { schoolContent } from "../../../lib/schools/content";

type Params = Promise<{ school: string }>;
type Search = Promise<{ team?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { school } = await params;
  const db = await appDb();
  const found = (await listSchools(db)).find((s) => s.slug === school);
  return { title: found ? `${found.mascot} feed · ${found.shortName} Athletics` : "Not found" };
}

/** Coach posts from every team (design/PHS-Feed-Mobile.dc.html). No likes or comments. */
export default async function FeedPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { school: slug } = await params;
  await connection();
  const content = schoolContent[slug];
  if (!content) notFound();
  const db = await appDb();
  const schools = await listSchools(db);
  const school = schools.find((s) => s.slug === slug);
  const other = schools.find((s) => s.slug !== slug);
  if (!school || !other) notFound();
  const { team } = await searchParams;

  const [all, games, teams] = await Promise.all([listFeed(db, { schoolId: school.id, limit: 60 }), listGames(db, { schoolId: school.id }), listTeams(db, { schoolId: school.id })]);
  const sports = [...new Map(all.map((p) => [p.sportSlug, p.sport])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const teamIds = team ? teams.filter((t) => t.sportSlug === team).map((t) => t.id) : null;
  const posts = teamIds ? all.filter((p) => teamIds.includes(p.teamId)) : all;

  return (
    <div data-school={slug} className={`${styles.page} ${phone.page}`}>
      <UtilityBar other={other} content={content} />
      <Masthead school={school} seasons={[]} current="feed" traditionNav={content.traditionNav} />
      <main className="ath-wrap">
        <header className={ph.head}>
          <span className={`ath-label ${styles.kicker}`}>From the sidelines</span>
          <h1 className={`ath-display ${ph.title}`}>{school.mascot} feed</h1>
          <p className={ph.small}>Quick posts from coaches: photos, scores and notes. Each one is on its team page too.</p>
        </header>
        {sports.length ? (
          <nav aria-label="Filter posts by team">
            <ul className={ph.chips}>
              {[["", "All teams"] as const, ...sports].map(([sportSlug, name]) => (
                <li key={sportSlug || "all"}>
                  <Link className={ph.chip} href={sportSlug ? `/${slug}/feed?team=${sportSlug}` : `/${slug}/feed`} aria-current={(team ?? "") === sportSlug ? "page" : undefined}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <FeedList slug={slug} posts={posts} games={gameLabels(games)} empty="No posts yet. Coaches post here during the season." />
        <section className={styles.sec} aria-labelledby="why-title">
          <h2 id="why-title" className={ph.formTitle}>
            Why no likes or comments?
          </h2>
          <p className={ph.small}>This feed is the team&apos;s news, posted by coaches. Nothing to moderate, nothing for kids to compare.</p>
        </section>
      </main>
      <SchoolFooter school={school} content={content} />
      <PhoneTabBar slug={slug} />
    </div>
  );
}
