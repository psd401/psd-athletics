import { mcp } from "@better-auth/mcp";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

import type { Db } from "../db/client";
import * as schema from "../db/schema";
import { appDb } from "../data/db";
import { devSignInEnabled } from "./dev";
import { DISTRICT_DOMAIN, isDistrictAccount } from "./domain";

/** Google sign-in works only when the OAuth client is configured (QUESTIONS 17). */
export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** The site's base URL; the MCP endpoint is `${baseUrl()}/mcp`. */
export function baseUrl(): string {
  return (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/** The protected resource MCP clients ask for; access tokens are audience-bound to it (DECISIONS 109). */
export const mcpResource = () => `${baseUrl()}/mcp`;

export function createAuth(db: Db) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  return betterAuth({
    baseURL: baseUrl(),
    secret: process.env.BETTER_AUTH_SECRET,
    // Password sign-in exists only for the made-up dev people (lib/auth/dev.ts).
    emailAndPassword: { enabled: devSignInEnabled(), disableSignUp: true },
    // People added in People and roles have a person row before their first
    // Google sign-in, not yet verified. Link Google to that row on first
    // sign-in (Google verifies the address; validateUserInfo checks the
    // domain). Safe because nobody can create a person row themselves: sign-up
    // is off and rows come only from an athletic director or a Google sign-in.
    account: { accountLinking: { enabled: true, requireLocalEmailVerified: false } },
    // Send sign-in errors (like a non-district account) back to our page.
    onAPIError: { errorURL: "/sign-in" },
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.person,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        jwks: schema.jwks,
        oauthClient: schema.oauthClient,
        oauthResource: schema.oauthResource,
        oauthClientResource: schema.oauthClientResource,
        oauthRefreshToken: schema.oauthRefreshToken,
        oauthAccessToken: schema.oauthAccessToken,
        oauthConsent: schema.oauthConsent,
        oauthClientAssertion: schema.oauthClientAssertion,
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
    plugins: [
      // Coaches' AI assistants sign in as the coach through OAuth 2.1 (SPEC §8).
      // Tokens are JWTs bound to the /mcp resource; consent is always asked.
      jwt(),
      mcp({
        loginPage: "/sign-in",
        consentPage: "/connect",
        resource: mcpResource(),
        // Assistants like Claude register themselves (RFC 7591). Registering
        // grants nothing: a psd401.net person still signs in and consents.
        allowDynamicClientRegistration: true,
        allowUnauthenticatedClientRegistration: true,
      }),
      nextCookies(),
    ],
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

/** The signed OAuth request if its signature checks out (an assistant connecting), else null. */
export async function verifiedOAuthQuery(query: string | null | undefined): Promise<string | null> {
  if (!query) return null;
  const { verifyOAuthQueryParams } = await import("@better-auth/oauth-provider");
  const { secret } = await (await getAuth()).$context;
  return (await verifyOAuthQueryParams(query, secret)) ? query : null;
}
