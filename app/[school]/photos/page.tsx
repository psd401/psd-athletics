import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { AlbumGrid } from "../../../components/school/album-grid";
import phone from "../../../components/school/phone.module.css";
import { PhoneTabBar } from "../../../components/school/phone-tabbar";
import ph from "../../../components/school/photos.module.css";
import { Masthead, SchoolFooter, UtilityBar } from "../../../components/school/school-sections";
import styles from "../../../components/school/school.module.css";
import { appDb } from "../../../lib/data/db";
import { listSchools } from "../../../lib/data/queries";
import { FINAL_FORMS_URL } from "../../../lib/families/steps";
import { albumCards } from "../../../lib/photos/cards";
import { schoolContent } from "../../../lib/schools/content";

type Params = Promise<{ school: string }>;
type Search = Promise<{ team?: string; reported?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { school } = await params;
  const db = await appDb();
  const found = (await listSchools(db)).find((s) => s.slug === school);
  return { title: found ? `${found.mascot} photos · ${found.shortName} Athletics` : "Not found" };
}

/** Every team's albums in one place (design/GHHS-Photos.dc.html). */
export default async function PhotosPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { school: slug } = await params;
  await connection();
  const content = schoolContent[slug];
  if (!content) notFound();
  const db = await appDb();
  const schools = await listSchools(db);
  const school = schools.find((s) => s.slug === slug);
  const other = schools.find((s) => s.slug !== slug);
  if (!school || !other) notFound();
  const { team, reported } = await searchParams;

  const all = await albumCards(db, { schoolId: school.id, limit: 60 });
  const sports = [...new Map(all.map((a) => [a.sportSlug, a.sport])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  const shown = team ? all.filter((a) => a.sportSlug === team) : all;

  return (
    <div data-school={slug} className={`${styles.page} ${phone.page}`}>
      <UtilityBar other={other} content={content} />
      <Masthead school={school} seasons={[]} current="photos" traditionNav={content.traditionNav} />
      <main>
        <div className="ath-wrap">
          <header className={ph.head}>
            <span className={`ath-label ${styles.kicker}`}>Every team. Every game. One place.</span>
            <h1 className={`ath-display ${ph.title}`}>{school.mascot} photos</h1>
            <p className={ph.small}>Photos come straight from {school.mascot} coaches, filed by team and game. Nothing to follow and nothing to sign in to.</p>
          </header>
          {reported ? (
            <p className={ph.notice} role="status">
              Thanks for telling us. The photo is hidden while the athletics office takes a look.
            </p>
          ) : null}
          <section aria-labelledby="albums-title" id="albums">
            <h2 id="albums-title" className="ath-visually-hidden">
              Game albums
            </h2>
            {sports.length ? (
              <nav aria-label="Filter albums by team">
                <ul className={ph.chips}>
                  {[["", "All teams"] as const, ...sports].map(([sportSlug, name]) => (
                    <li key={sportSlug || "all"}>
                      <Link
                        className={ph.chip}
                        href={sportSlug ? `/${slug}/photos?team=${sportSlug}` : `/${slug}/photos`}
                        aria-current={(team ?? "") === sportSlug ? "page" : undefined}
                      >
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
            <AlbumGrid slug={slug} albums={shown} empty="No albums yet. Coaches post them after games." />
          </section>
          <section className={styles.sec} aria-labelledby="release-title">
            <div className={`${ph.explain} ath-on-dark`}>
              <div>
                <h2 id="release-title" className="ath-display">
                  Families stay in charge of their kids&apos; photos
                </h2>
                <p>
                  Only coaching staff publish albums, and volunteer photographers&apos; shots wait for the coach. Location data is removed from every file. Want a photo
                  down? Open it and choose Report: it&apos;s hidden right away while the athletics office takes a look.
                </p>
              </div>
              <p>
                <a className={`${styles.btn} ${styles.btnAccent}`} href={FINAL_FORMS_URL}>
                  Photo release choices in Final Forms
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>
      <SchoolFooter school={school} content={content} />
      <PhoneTabBar slug={slug} />
    </div>
  );
}
