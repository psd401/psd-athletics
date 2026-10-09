import { StatusTag } from "../components/athletics/status-tag";
import styles from "./page.module.css";

// Placeholder until the district hub lands (docs/PLAN.md task 2.1).
export default function Home() {
  return (
    <main data-school="hub" className={styles.page}>
      <div className={styles.inner}>
        <StatusTag kind="updated">Being built</StatusTag>
        <h1 className={styles.title}>Peninsula Athletics</h1>
        <p className={styles.lede}>
          The athletics site for Gig Harbor and Peninsula high schools is being built. The plan is in docs/PLAN.md.
        </p>
      </div>
    </main>
  );
}
