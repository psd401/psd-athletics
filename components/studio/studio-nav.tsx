"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./studio.module.css";

export interface NavItem {
  href: string;
  label: string;
}

/** Studio sidebar (Nexus `nx-nav`). The current page is marked for assistive tech. */
export function StudioNav({ brand, tagline, items }: { brand: string; tagline: string; items: NavItem[] }) {
  const path = usePathname();
  return (
    <nav className={`nx-nav ${styles.nav}`} aria-label="Studio">
      <div className="nx-nav__brand">{brand}</div>
      <p className={styles.navTagline}>{tagline}</p>
      {items.map((item) => {
        const current = item.href === "/studio" ? path === "/studio" : path.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className={`nx-nav__item ${styles.navItem}`} aria-current={current ? "page" : undefined}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
