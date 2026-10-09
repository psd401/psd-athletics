import styles from "../../components/studio/studio.module.css";
import { TrustFooter } from "../../components/studio/trust-footer";
import { currentPerson } from "../../lib/auth/server";
import { redirect } from "next/navigation";

// The Studio's front door until Today (CMS-Today.dc.html) is built in Phase 4.
export default async function StudioHome() {
  // Pages check too: a layout doesn't rerun on every navigation.
  const person = await currentPerson();
  if (!person) redirect("/sign-in?next=/studio");

  return (
    <>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome, {person.name.split(" ")[0]}</h1>
        <div className="nx-card">
          <div className={styles.stack}>
            <p className={styles.lede}>
              You&apos;re signed in as {person.email}. Team pages, stories, photos and schedule review arrive here as the
              Studio is built. Nothing here changes the public sites yet.
            </p>
          </div>
        </div>
      </main>
      <TrustFooter items={["Read only", "No student data shown", "Nothing published"]} />
    </>
  );
}
