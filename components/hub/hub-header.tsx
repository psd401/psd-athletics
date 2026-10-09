import Image from "next/image";
import Link from "next/link";

import { BellIcon } from "../athletics/icons";
import styles from "./hub.module.css";

// Search and EN · ES wait until they work (DECISIONS 15).
export function HubHeader() {
  return (
    <header className={`${styles.header} ath-on-dark`}>
      <div className={`ath-wrap ${styles.topnav}`}>
        <Link href="/" className={styles.brand}>
          <Image src="/logos/psd-emblem-white.png" alt="Peninsula School District" width={44} height={44} priority />
          <span className={styles.brandText}>
            <span className={`ath-display ${styles.brandName}`}>Peninsula Athletics</span>
            <span className={`ath-label ${styles.brandSub}`}>Peninsula School District</span>
          </span>
        </Link>
        <nav aria-label="Main" className={styles.nav}>
          <Link href="/ghh">Gig Harbor</Link>
          <Link href="/phs">Peninsula</Link>
          <a href="#week">Schedule</a>
          <a href="#scores">Scores</a>
          <a href="#families">Registration &amp; forms</a>
          <a href="#fishbowl">Fish Bowl</a>
        </nav>
        <div className={styles.headerEnd}>
          <a className={`${styles.pill} ${styles.pillLight}`} href="#alerts" aria-label="Follow a team">
            <BellIcon />
            <span className={styles.pillLabel}>Follow a team</span>
          </a>
        </div>
      </div>
    </header>
  );
}
