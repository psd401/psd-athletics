import Link from "next/link";

import styles from "./phone.module.css";

type Current = "home" | "schedule" | "scores" | "teams" | null;

/** Bottom tab bar on phones (design/PHS-Mobile.dc.html). Hidden above 640px. */
export function PhoneTabBar({ slug, current = null }: { slug: string; current?: Current }) {
  const tab = (key: Current, href: string, label: string, icon: React.ReactNode) => (
    <li>
      <Link href={href} aria-current={current === key ? "page" : undefined}>
        {icon}
        {label}
      </Link>
    </li>
  );
  const svg = (d: string) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
  return (
    <nav aria-label="Sections" className={styles.tabbar}>
      <ul className={styles.tabs}>
        {tab("home", `/${slug}`, "Today", svg("M3 11 12 4l9 7v9H3zM9 20v-6h6v6"))}
        {tab("schedule", `/${slug}/schedule`, "Schedule", svg("M3.5 5h17v15h-17zM3.5 10h17M8 3v4M16 3v4"))}
        {tab("scores", `/${slug}#results`, "Scores", svg("M4 20V10M10 20V4M16 20v-7M22 20H2"))}
        {tab("teams", `/${slug}#teams`, "Teams", svg("M9 4.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"))}
      </ul>
    </nav>
  );
}
