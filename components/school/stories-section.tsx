import Link from "next/link";

import type { PublishedStory } from "../../lib/studio/stories";
import { formatShortDate, pacificDate } from "../../lib/schedule/time";
import school from "./school.module.css";
import styles from "./stories.module.css";

const kicker = (s: PublishedStory) => [s.sport, formatShortDate(pacificDate(s.publishedAt))].filter(Boolean).join(" · ");

/** The school home's Stories section. Hidden until there's a published story (DECISIONS 15). */
export function StoriesSection({ slug, stories }: { slug: string; stories: PublishedStory[] }) {
  if (stories.length === 0) return null;
  const [feature, ...rest] = stories;
  return (
    <section className={school.sec} id="stories" aria-labelledby="stories-title">
      <div className="ath-wrap">
        <div className={school.secHead}>
          <h2 id="stories-title" className={`ath-display ${school.h2}`}>
            Stories
          </h2>
        </div>
        <div className={styles.grid}>
          <Link className={`${styles.feature} ath-on-dark`} href={`/${slug}/stories/${feature!.slug}`}>
            <span className={`ath-label ${styles.featureKicker}`}>{kicker(feature!)}</span>
            <h3 className={`ath-display ${styles.featureTitle}`}>{feature!.title}</h3>
            {feature!.summary ? <p className={styles.featureSummary}>{feature!.summary}</p> : null}
          </Link>
          {rest.length ? (
            <ul className={styles.list}>
              {rest.slice(0, 3).map((st) => (
                <li key={st.id}>
                  <Link className={styles.item} href={`/${slug}/stories/${st.slug}`}>
                    <span className={`ath-label ${styles.itemKicker}`}>{kicker(st)}</span>
                    <h3 className={styles.itemTitle}>{st.title}</h3>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Paragraphs from plain text: a blank line separates them. Rendered as text, never HTML. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, " "))
    .filter(Boolean);
}
