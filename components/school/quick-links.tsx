import Link from "next/link";

import { FINAL_FORMS_URL } from "../../lib/families/steps";
import type { SchoolContent } from "../../lib/schools/content";
import { BagIcon, FormIcon, ShieldIcon, TicketIcon, WatchIcon } from "../athletics/icons";
import styles from "./phone.module.css";

/** Quick links on phones (design/PHS-Mobile.dc.html), without the comp's "Email the AD" (DECISIONS 65). */
export function QuickLinks({ slug, content }: { slug: string; content: SchoolContent }) {
  return (
    <section className={`${styles.phoneOnly} ${styles.section}`} aria-labelledby="quick-title">
      <h2 id="quick-title" className={`ath-display ${styles.h2}`}>
        Quick links
      </h2>
      <ul className={styles.quick}>
        <li>
          <a href={content.links.tickets}>
            <TicketIcon />
            Tickets
          </a>
        </li>
        <li>
          <a href={content.links.watch}>
            <WatchIcon />
            Watch live
          </a>
        </li>
        <li>
          <a href={FINAL_FORMS_URL}>
            <FormIcon />
            Register
          </a>
        </li>
        <li>
          <a href={content.links.store}>
            <BagIcon />
            Store
          </a>
        </li>
        <li>
          <Link href="/families#health">
            <ShieldIcon />
            Health forms
          </Link>
        </li>
        <li>
          <Link href={`/${slug}/staff`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
              <circle cx="9" cy="8" r="3.5" />
              <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
            </svg>
            Coaches &amp; staff
          </Link>
        </li>
      </ul>
    </section>
  );
}
