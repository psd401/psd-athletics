import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import type { Db } from "../db/client";
import * as schema from "../db/schema";
import { appDb } from "../data/db";
import { DISTRICT_DOMAIN, isDistrictAccount } from "./domain";

/** Google sign-in works only when the OAuth client is configured (QUESTIONS 17). */
export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function createAuth(db: Db) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    // Send sign-in errors (like a non-district account) back to our page.
    onAPIError: { errorURL: "/sign-in" },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.person,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    socialProviders:
      clientId && clientSecret
        ? {
            google: {
              clientId,
              clientSecret,
              // Google shows only psd401.net accounts, and Better Auth rejects an
              // id token whose hd claim isn't psd401.net.
              hd: DISTRICT_DOMAIN,
              prompt: "select_account",
            },
          }
        : {},
    user: {
      // Second check, on every Google sign-in: verified psd401.net email only.
      validateUserInfo: ({ user, source }) => {
        const hd = source.oauth?.profile?.hd;
        const ok = isDistrictAccount({
          email: typeof user.email === "string" ? user.email : null,
          emailVerified: user.emailVerified === true,
          hostedDomain: typeof hd === "string" ? hd : null,
        });
        if (!ok) {
          return {
            error: "district_account_required",
            errorDescription: `Sign in with your ${DISTRICT_DOMAIN} Google account.`,
          };
        }
      },
    },
    databaseHooks: {
      session: {
        create: {
          // Third check: no session for a person row that isn't a district account.
          before: async (session) => {
            const [person] = await db
              .select({ email: schema.person.email, emailVerified: schema.person.emailVerified })
              .from(schema.person)
              .where(eq(schema.person.id, session.userId));
            if (!person || !isDistrictAccount(person)) {
              throw new APIError("FORBIDDEN", { message: "district_account_required" });
            }
          },
        },
      },
    },
    plugins: [nextCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;

const globalForAuth = globalThis as typeof globalThis & { __athleticsAuth?: Promise<Auth> };

export function getAuth(): Promise<Auth> {
  globalForAuth.__athleticsAuth ??= appDb().then(createAuth);
  return globalForAuth.__athleticsAuth;
}

/** The signed-in person, or null. Server Components and actions only. */
export async function currentPerson() {
  // Read the request first: it marks the route dynamic before the auth
  // instance (which needs runtime secrets) is created, so builds don't touch it.
  const requestHeaders = await headers();
  const auth = await getAuth();
  const result = await auth.api.getSession({ headers: requestHeaders });
  return result?.user ?? null;
}
