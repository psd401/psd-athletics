import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import phone from "../../../../../components/school/phone.module.css";
import { PhoneTabBar } from "../../../../../components/school/phone-tabbar";
import ph from "../../../../../components/school/photos.module.css";
import { Masthead, SchoolFooter, UtilityBar } from "../../../../../components/school/school-sections";
import styles from "../../../../../components/school/school.module.css";
import { loadPublicAlbum, resultLabel } from "../../../../../lib/photos/cards";
import { opponentLine } from "../../../../../lib/schedule/games";
import { formatShortDate } from "../../../../../lib/schedule/time";
import { schoolContent } from "../../../../../lib/schools/content";
import { reportPhotoAction } from "./actions";

type Params = Promise<{ school: string; album: string; photo: string }>;
type Search = Promise<{ error?: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { school, album } = await params;
  const loaded = await loadPublicAlbum(school, album);
  return { title: loaded ? `${loaded.album.title} · ${loaded.school.mascot} photos` : "Photo not found" };
}

/** One photo, full size, with its description, download and report (the design's lightbox, as a page). */
export default async function PhotoPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { school: slug, album: albumId, photo: photoId } = await params;
  await connection();
  const loaded = await loadPublicAlbum(slug, albumId);
  const index = loaded?.photos.findIndex((p) => p.id === photoId) ?? -1;
  if (!loaded || index < 0) notFound();
  const { school, other, album, photos, game, sport } = loaded;
  const photo = photos[index]!;
  const prev = photos[index - 1];
  const next = photos[index + 1];
  const content = schoolContent[slug]!;
  const { error } = await searchParams;
  const base = `/${slug}/photos/${album.id}`;

  return (
    <div data-school={slug} className={`${styles.page} ${phone.page}`}>
      <UtilityBar other={other} content={content} />
      <Masthead school={school} seasons={[]} current="photos" traditionNav={content.traditionNav} />
      <main className="ath-wrap">
        <header className={ph.head}>
          <Link className={ph.crumb} href={base}>
            ← {album.title}
          </Link>
          <span className={`ath-label ${styles.kicker}`}>
            {sport} · Photo {index + 1} of {photos.length}
          </span>
          <h1 className={`ath-display ${ph.title}`}>{album.title}</h1>
        </header>
        <div className={ph.viewer}>
          <div>
            <Image unoptimized className={ph.full} src={`/media/${photo.id}/full`} alt={photo.altText} width={photo.width} height={photo.height} priority />
            <nav className={ph.pager} aria-label="Photos in this album">
              {prev ? (
                <Link className={`${styles.btn} ${styles.btnGhost}`} href={`${base}/${prev.id}`} aria-label={`Previous photo (${index} of ${photos.length})`}>
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              {next ? (
                <Link className={`${styles.btn} ${styles.btnGhost}`} href={`${base}/${next.id}`} aria-label={`Next photo (${index + 2} of ${photos.length})`}>
                  Next →
                </Link>
              ) : null}
            </nav>
          </div>
          <aside className={ph.side} aria-label="About this photo">
            {game ? (
              <p className={ph.small}>{[`${opponentLine(game)}, ${formatShortDate(game.startDate)}`, resultLabel(game)].filter(Boolean).join(" · ")}</p>
            ) : null}
            <p className={ph.desc}>
              <span className="ath-label">Image description: </span>
              {photo.altText}
            </p>
            <p className={ph.small}>
              Posted by the {sport} coaching staff{photo.credit ? ` · Photo by ${photo.credit}` : ""}
            </p>
            <a className={`${styles.btn} ${styles.btnAccent}`} href={`/media/${photo.id}/full`} download={`${album.title} ${index + 1}.webp`}>
              Download full size
            </a>
            <form className={ph.form} action={reportPhotoAction.bind(null, slug, album.id, photo.id)}>
              <h2>Report this photo</h2>
              <p className={ph.small}>It&apos;s hidden right away while the athletics office takes a look. We&apos;ll follow up with you.</p>
              {error ? (
                <p className={ph.notice} role="alert">
                  {error}
                </p>
              ) : null}
              <label>
                Your email or phone
                <input name="contact" required maxLength={120} autoComplete="email" />
              </label>
              <label>
                What&apos;s wrong with it?
                <textarea name="reason" required maxLength={500} rows={3} />
              </label>
              <button type="submit" className={`${styles.btn} ${styles.btnGhost}`}>
                Report and hide this photo
              </button>
            </form>
          </aside>
        </div>
      </main>
      <SchoolFooter school={school} content={content} />
      <PhoneTabBar slug={slug} />
    </div>
  );
}
