// Helpers for the OAuth pages (sign-in and /connect) when an AI assistant asks
// to connect (DECISIONS 109). The authorize endpoint sends people to those
// pages with a signed copy of the request (sig, exp); we pass it back to
// Better Auth as `oauth_query`, which checks the signature.

/** The signed OAuth request from a page's search params, or null when there isn't one. */
export function oauthQuery(params: Record<string, string | string[] | undefined>): string | null {
  if (typeof params.sig !== "string" || typeof params.client_id !== "string") return null;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "next" || key === "error") continue;
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) query.append(key, v);
  }
  return query.toString();
}

/** Where Better Auth says to go next after sign-in or consent during an OAuth flow, if anywhere. */
export function oauthRedirect(result: unknown): string | null {
  if (result && typeof result === "object" && "url" in result && typeof (result as { url: unknown }).url === "string") {
    return (result as { url: string }).url;
  }
  return null;
}

/**
 * A Request for a server-side Better Auth call during an OAuth flow. The
 * authorize step needs one (it reads the request), and server actions don't
 * have it, so we build it from the incoming headers.
 */
export function authRequest(baseUrl: string, path: string, incoming: Headers): Request {
  return new Request(`${baseUrl}/api/auth${path}`, { method: "POST", headers: incoming });
}

const SIGNATURE_PARAMS = new Set(["sig", "exp", "ba_iat", "ba_pl", "ba_param"]);

/**
 * After sign-in, the authorize URL to continue an assistant's request: the
 * original query without the signature fields, and without prompt=login now
 * that the person has just signed in. The authorize endpoint checks the
 * client, redirect URI and PKCE again, so this is no open redirect.
 */
export function authorizePath(signedQuery: string): string {
  const query = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(signedQuery)) {
    if (SIGNATURE_PARAMS.has(key)) continue;
    if (key === "prompt" && value.split(" ").includes("login")) continue;
    query.append(key, value);
  }
  return `/api/auth/oauth2/authorize?${query.toString()}`;
}
