import { describe, expect, it } from "vitest";

import { authorizePath, oauthQuery, oauthRedirect } from "./oauth-flow";

describe("oauthQuery", () => {
  it("rebuilds the signed request, leaving out our own params", () => {
    expect(oauthQuery({ client_id: "c", resource: "https://x/mcp", scope: ["openid", "offline_access"], sig: "s", exp: "1", next: "/studio" })).toBe(
      "client_id=c&resource=https%3A%2F%2Fx%2Fmcp&scope=openid&scope=offline_access&sig=s&exp=1",
    );
  });

  it("is null for an ordinary sign-in", () => {
    expect(oauthQuery({ next: "/studio" })).toBeNull();
    expect(oauthQuery({ client_id: "c" })).toBeNull();
  });
});

describe("oauthRedirect", () => {
  it("reads the next URL Better Auth returns", () => {
    expect(oauthRedirect({ redirect: true, url: "https://claude.ai/cb?code=1" })).toBe("https://claude.ai/cb?code=1");
    expect(oauthRedirect({ token: "x" })).toBeNull();
    expect(oauthRedirect(null)).toBeNull();
  });
});

describe("authorizePath", () => {
  it("drops the signature and a satisfied login prompt, keeping the authorization request", () => {
    expect(authorizePath("client_id=c&redirect_uri=https%3A%2F%2Fa%2Fcb&prompt=login&state=s&sig=x&exp=1&ba_iat=2&ba_pl=3&ba_param=client_id")).toBe(
      "/api/auth/oauth2/authorize?client_id=c&redirect_uri=https%3A%2F%2Fa%2Fcb&state=s",
    );
    expect(authorizePath("client_id=c&prompt=consent&sig=x")).toBe("/api/auth/oauth2/authorize?client_id=c&prompt=consent");
  });
});
