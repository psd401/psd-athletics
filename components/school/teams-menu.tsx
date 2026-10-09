"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { ChevronDownIcon } from "../athletics/icons";
import styles from "./school.module.css";

export interface MenuSeason {
  term: string;
  label: string;
  sports: { name: string; href: string }[];
}

/** Teams mega-menu: a disclosure that closes on Escape or a click outside. */
export function TeamsMenu({ seasons }: { seasons: MenuSeason[] }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !button.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <>
      <button ref={button} type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        Teams
        <ChevronDownIcon />
      </button>
      <div ref={panel} id={id} className={styles.mega} hidden={!open}>
        <div className={`ath-wrap ${styles.megaGrid}`}>
          {seasons.map((season) => (
            <div key={season.term}>
              <h2 className={`ath-label ${styles.megaTitle}`}>{season.label}</h2>
              <ul className={styles.megaList}>
                {season.sports.map((sport) => (
                  <li key={sport.href}>
                    <Link href={sport.href} onClick={() => setOpen(false)}>
                      {sport.name} <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
