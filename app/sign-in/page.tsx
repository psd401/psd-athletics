import type { Metadata } from "next";
import { redirect } from "next/navigation";

import "../../vendor/nexus/bundle.css";
import styles from "../../components/studio/studio.module.css";
import { TrustFooter } from "../../components/studio/trust-footer";
import { DISTRICT_DOMAIN } from "../../lib/auth/domain";
import { safeNext } from "../../lib/auth/redirect";
import { currentPerson, getAuth, googleConfigured } from "../../lib/auth/server";

export const metadata: Metadata = { title: "Sign in · Athletics Studio" };

const errors: Record<string, string> = {
  district_account_required: `That account isn't a ${DISTRICT_DOMAIN} account. Sign in with your district Google account.`,
};

async function signInWithGoogle(formData: FormData) {
  "use server";
  const auth = await getAuth();
  const result = await auth.api.signInSocial({
    body: { provider: "google", callbackURL: safeNext(String(formData.get("next") ?? "")) },
  });
  if (!result.url) throw new Error("Google sign-in did not return a URL");
  redirect(result.url);
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; error?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await currentPerson()) redirect(next);

  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error;
  const configured = googleConfigured();

  return (
    <div data-theme="nexus" className={styles.shell}>
      <header className="nx-header">
        <span className="nx-header__mark">Athletics Studio</span>
      </header>
      <main className={styles.main}>
        <div className={`nx-card ${styles.narrow}`}>
          <div className={styles.stack}>
            <h1 className={styles.title}>Sign in</h1>
            <p className={styles.lede}>
              For coaches, athletic directors and athletic secretaries. Use your {DISTRICT_DOMAIN} Google account.
            </p>
            {errorCode ? (
              <div className="nx-banner nx-banner--danger" role="alert">
                <div className="nx-banner__body">{errors[errorCode] ?? "Sign-in didn't work. Try again."}</div>
              </div>
            ) : null}
            {!configured ? (
              <div className="nx-banner nx-banner--info" role="status">
                <div className="nx-banner__body">
                  Sign-in isn&apos;t set up on this server yet. It needs a Google OAuth client from Technology Services.
                </div>
              </div>
            ) : null}
            <form action={signInWithGoogle}>
              <input type="hidden" name="next" value={next} />
              <button type="submit" className="nx-btn nx-btn--primary nx-btn--lg nx-btn--block" disabled={!configured}>
                Sign in with Google
              </button>
            </form>
          </div>
        </div>
      </main>
      <TrustFooter items={[`${DISTRICT_DOMAIN} accounts only`, "Sign-in shares your name and email with the Studio"]} />
    </div>
  );
}
