import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import "../../vendor/nexus/bundle.css";
import styles from "../../components/studio/studio.module.css";
import { currentPerson, getAuth } from "../../lib/auth/server";
import { headers } from "next/headers";

export const metadata: Metadata = { title: "Athletics Studio" };

async function signOut() {
  "use server";
  const auth = await getAuth();
  await auth.api.signOut({ headers: await headers() });
  redirect("/sign-in");
}

export default async function StudioLayout({ children }: { children: ReactNode }) {
  const person = await currentPerson();
  if (!person) redirect("/sign-in?next=/studio");

  return (
    <div data-theme="nexus" className={styles.shell}>
      <header className="nx-header">
        <span className="nx-header__mark">Athletics Studio</span>
        <div className={styles.user}>
          <span className={styles.userName}>{person.name}</span>
          <form action={signOut}>
            <button type="submit" className={`nx-btn nx-btn--sm nx-btn--secondary ${styles.headerButton}`}>
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
