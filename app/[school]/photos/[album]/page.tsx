import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import phone from "../../../../components/school/phone.module.css";
import { PhoneTabBar } from "../../../../components/school/phone-tabbar";
import ph from "../../../../components/school/photos.module.css";
import { Masthead, SchoolFooter, UtilityBar } from "../../../../components/school/school-sections";
import styles from "../../../../components/school/school.module.css";
import { loadPublicAlbum, resultLabel } from "../../../../lib/photos/cards";
import { opponentLine } from "../../../../lib/schedule/games";
import { formatShortDate, pacificDate } from "../../../../lib/schedule/time";
import { schoolContent } from "../../../../lib/schools/content";

type Params = Promise<{ school: string; album: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { school, album } = await params;
  const loaded = await loadPublicAlbum(school, album);
  return { title: loaded ? `${loaded.album.title} · ${loaded.school.mascot} photos` : "Album not found" };
}

/** One album's photos. Each opens its own page, the accessible stand-in for a lightbox (DECISIONS 95). */
export default async function AlbumPage({ params }: { params: Params }) {
  const { school: slug, album: albumId } = await params;
  await connection();
  const loaded = await loadPublicAlbum(slug, albumId);
  if (!loaded) notFound();
  const { school, other, album, photos, game, sport, sportSlug } = loaded;
  const content = schoolContent[slug]!;
  const meta = [sport, game ? `${opponentLine(game)}, ${formatShortDate(game.startDate)}` : formatShortDate(pacificDate(album.publishedAt!)), resultLabel(game)]
    .filter(Boolean)
    .join(" · ");

  return (
    <div data-school={slug} className={`${styles.page} ${phone.page}`}>
      <UtilityBar other={other} content={content} />
      <Masthead school={school} seasons={[]} current="photos" traditionNav={content.traditionNav} />
      <main className="ath-wrap">
        <header className={ph.head}>
          <Link className={ph.crumb} href={`/${slug}/photos`}>
            ← All {school.mascot} photos
          </Link>
          <span className={`ath-label ${styles.kicker}`}>{meta}</span>
          <h1 className={`ath-display ${ph.title}`}>{album.title}</h1>
          <p className={ph.small}>
            {photos.length} {photos.length === 1 ? "photo" : "photos"} · posted by the {sport} coaching staff
            {sportSlug ? (
              <>
                {" · "}
                <Link href={`/${slug}/teams/${sportSlug}`}>{sport} team page</Link>
              </>
            ) : null}
          </p>
        </header>
        <ul className={ph.photos}>
          {photos.map((p, i) => (
            <li key={p.id}>
              <Link href={`/${slug}/photos/${album.id}/${p.id}`} aria-label={`Photo ${i + 1} of ${photos.length}: ${p.altText}`}>
                <Image unoptimized src={`/media/${p.id}/card`} alt="" width={p.width} height={p.height} />
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SchoolFooter school={school} content={content} />
      <PhoneTabBar slug={slug} />
    </div>
  );
}
