import Image from "next/image";
import Link from "next/link";

import type { FeedItem } from "../../lib/feed/posts";
import { levelLabel } from "../../lib/schedule/games";
import { formatShortDate, formatTime, pacificDate, TIME_ZONE } from "../../lib/schedule/time";
import styles from "./feed.module.css";

const kindLabel = { photo: "Photos", score: "Score update", note: "Note" } as const;

const clock = (d: Date) =>
  formatTime(new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d));

/** Coach posts: no likes, no comments (SPEC §7). `games` maps a game id to its label. */
export function FeedList({ slug, posts, games, empty }: { slug: string; posts: FeedItem[]; games: Record<string, string>; empty: string }) {
  if (!posts.length) return <p className={styles.empty}>{empty}</p>;
  return (
    <ol className={styles.list}>
      {posts.map((p) => (
        <li key={p.id}>
          <article className={styles.post} id={`post-${p.id}`} aria-labelledby={`post-${p.id}-team`}>
            <header className={styles.head}>
              <Link id={`post-${p.id}-team`} className={styles.team} href={`/${slug}/teams/${p.sportSlug}`}>
                {p.sport} · {levelLabel[p.level]}
              </Link>
              <span className={styles.meta}>
                <span className={`ath-label ${styles.kind}`}>{kindLabel[p.kind]}</span>
                <span>
                  {formatShortDate(pacificDate(p.publishedAt))} · {clock(p.publishedAt)}
                </span>
              </span>
            </header>
            {p.photos.length ? (
              <div className={styles.photos} data-count={Math.min(p.photos.length, 4)}>
                {p.photos.map((ph) => (
                  <Image key={ph.id} unoptimized src={`/media/${ph.id}/card`} alt={ph.altText} width={ph.width} height={ph.height} />
                ))}
              </div>
            ) : null}
            {p.gameId && games[p.gameId] ? <p className={styles.game}>{games[p.gameId]}</p> : null}
            {p.body ? <p className={p.kind === "score" ? styles.score : styles.body}>{p.body}</p> : null}
            <p className={styles.by}>Coaching staff</p>
          </article>
        </li>
      ))}
    </ol>
  );
}
