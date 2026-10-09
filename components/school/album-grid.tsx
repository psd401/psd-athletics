import Image from "next/image";
import Link from "next/link";

import type { AlbumCard } from "../../lib/photos/cards";
import { formatShortDate, pacificDate } from "../../lib/schedule/time";
import styles from "./photos.module.css";

export type { AlbumCard };

/** Album cards for the school photo page and a team's Photos tab. */
export function AlbumGrid({ slug, albums, empty, showSport = true }: { slug: string; albums: AlbumCard[]; empty: string; showSport?: boolean }) {
  if (!albums.length) return <p className={styles.empty}>{empty}</p>;
  return (
    <ul className={styles.albums}>
      {albums.map((a) => (
        <li key={a.id}>
          <Link className={styles.album} href={`/${slug}/photos/${a.id}`}>
            {a.cover ? (
              <Image unoptimized className={styles.cover} src={`/media/${a.cover.id}/card`} alt={a.cover.altText} width={a.cover.width} height={a.cover.height} />
            ) : null}
            <span className={styles.tags}>
              {showSport ? <span className={`ath-label ${styles.tag} ${styles.tagStrong}`}>{a.sport}</span> : null}
              {a.result ? <span className={`ath-label ${styles.tag}`}>{a.result}</span> : null}
            </span>
            <span className={styles.albumTitle}>{a.title}</span>
            <span className={styles.albumMeta}>
              {formatShortDate(pacificDate(a.publishedAt))} · {a.photoCount} {a.photoCount === 1 ? "photo" : "photos"}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
