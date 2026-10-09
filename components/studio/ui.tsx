// Small server components over Nexus's CSS classes (vendor/nexus/bundle.css).
// The Nexus React bundle targets React 18 (QUESTIONS 15), so the Studio
// renders the same markup with these.

import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./studio.module.css";

export function PageHead({ eyebrow, title, sub, actions }: { eyebrow?: string; title: string; sub?: ReactNode; actions?: ReactNode }) {
  return (
    <div className={styles.pageHead}>
      <div className={styles.stack}>
        {eyebrow ? <span className="nx-eyebrow">{eyebrow}</span> : null}
        <h1 className={styles.title}>{title}</h1>
        {sub ? <p className={styles.lede}>{sub}</p> : null}
      </div>
      {actions ? <div className={styles.row}>{actions}</div> : null}
    </div>
  );
}

export function ContextChip({ name, value, source }: { name: string; value: string; source: string }) {
  return (
    <div className="nx-chip">
      <span className={styles.stack} style={{ gap: 2 }}>
        <span className="nx-eyebrow">{name}</span>
        <b>{value}</b>
        <span className={styles.muted}>{source}</span>
      </span>
    </div>
  );
}

export function StatusStrip({ items }: { items: string[] }) {
  return (
    <p className="nx-strip" style={{ margin: 0 }}>
      {items.map((item, i) => (
        <span key={item}>
          {i > 0 ? (
            <span className="nx-strip__dot" aria-hidden="true">
              ·{" "}
            </span>
          ) : null}
          {item}
        </span>
      ))}
    </p>
  );
}

export function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="nx-card">
      {title ? (
        <div className="nx-card__head">
          <div>
            <h2 className="nx-card__title">{title}</h2>
            {subtitle ? <p className="nx-card__sub">{subtitle}</p> : null}
          </div>
        </div>
      ) : null}
      <div className={title ? "nx-card__body" : undefined}>{children}</div>
    </section>
  );
}

export function ListRow({ title, subtitle, end, href }: { title: string; subtitle?: string; end?: ReactNode; href?: string }) {
  const body = (
    <>
      <span className="nx-row__body">
        <span className="nx-row__title">{title}</span>
        {subtitle ? <span className="nx-row__sub">{subtitle}</span> : null}
      </span>
      {end ? <span className="nx-row__end">{end}</span> : null}
    </>
  );
  return (
    <li>
      {href ? (
        <Link className="nx-row" href={href}>
          {body}
        </Link>
      ) : (
        <div className="nx-row">{body}</div>
      )}
    </li>
  );
}

export function StatTile({ label, value, context }: { label: string; value: string; context?: string }) {
  return (
    <div className="nx-stat">
      <span className="nx-stat__label">{label}</span>
      <span className="nx-stat__value">{value}</span>
      {context ? <span className="nx-stat__context">{context}</span> : null}
    </div>
  );
}

export function Badge({ tone, children }: { tone: "success" | "warning" | "info" | "attention" | "danger" | "plain"; children: ReactNode }) {
  return <span className={`nx-badge nx-badge--${tone}`}>{children}</span>;
}

export function Decision({
  eyebrow,
  title,
  why,
  label,
  reaches,
  actions,
  undo,
  needs,
}: {
  eyebrow: string;
  title: string;
  why: string;
  label: string;
  reaches: ReactNode;
  actions: ReactNode;
  undo: string;
  needs?: boolean;
}) {
  return (
    <section className={`nx-decision ${needs ? "nx-decision--needs" : ""}`}>
      <span className="nx-eyebrow">{eyebrow}</span>
      <h2 className="nx-decision__title">{title}</h2>
      <p className="nx-decision__why">{why}</p>
      <div className="nx-decision__rec">
        <span className="nx-decision__rec-label">{label}</span>
        <span className="nx-decision__conf">{reaches}</span>
      </div>
      <div className="nx-decision__actions">{actions}</div>
      <span className="nx-decision__undo">{undo}</span>
    </section>
  );
}
