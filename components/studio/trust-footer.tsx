import styles from "./studio.module.css";

/** Nexus trust footer: what this screen reads, and what it changes. Every Studio screen has one. */
export function TrustFooter({ items }: { items: string[] }) {
  return (
    <footer className={styles.footer}>
      <p className="nx-trust" style={{ margin: 0 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z" />
        </svg>
        {items.join(" · ")}
      </p>
    </footer>
  );
}
