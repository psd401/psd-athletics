import { createHash, randomBytes } from "node:crypto";

import { expect, test, type APIRequestContext } from "@playwright/test";

import { axeViolations } from "./axe";
import { signInAs } from "./studio-helpers";

// One in-memory server for both projects; client names carry the project name.
test.describe.configure({ mode: "serial" });

const BASE = "http://localhost:3210";
const RESOURCE = `${BASE}/mcp`;
const REDIRECT = "http://127.0.0.1:9/callback";

async function mcp(request: APIRequestContext, token: string | null, method: string, params: Record<string, unknown> = {}) {
  const res = await request.post("/mcp", {
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "mcp-protocol-version": "2025-11-25",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    data: { jsonrpc: "2.0", id: 1, method, params },
  });
  const text = await res.text();
  const body = text.startsWith("event:") ? JSON.parse(text.split("data: ")[1]!.split("\n")[0]!) : text ? JSON.parse(text) : null;
  return { status: res.status(), headers: res.headers(), body };
}

test.describe("AI assistants over MCP", () => {
  test("a coach connects an assistant with OAuth, it drafts a story, and the coach turns it off", async ({ page, request }, info) => {
    const clientName = `Claude e2e (${info.project.name})`;

    // Discovery and the unauthenticated challenge.
    const prm = await request.get("/.well-known/oauth-protected-resource/mcp");
    expect(prm.ok()).toBe(true);
    expect(await prm.json()).toMatchObject({ resource: RESOURCE, authorization_servers: [expect.stringContaining("localhost:3210")] });
    const anonymous = await mcp(request, null, "tools/list");
    expect(anonymous.status).toBe(401);
    expect(anonymous.headers["www-authenticate"]).toContain("resource_metadata=");

    // The assistant registers itself (RFC 7591).
    const reg = await request.post("/api/auth/oauth2/register", {
      data: { client_name: clientName, application_type: "native", redirect_uris: [REDIRECT], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"], response_types: ["code"] },
    });
    expect(reg.ok(), await reg.text()).toBe(true);
    const { client_id } = (await reg.json()) as { client_id: string };

    // The coach signs in and allows it.
    const verifier = randomBytes(32).toString("base64url");
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    let callback = "";
    await page.route(`${REDIRECT}**`, async (route) => {
      callback = route.request().url();
      await route.fulfill({ status: 200, body: "ok" });
    });
    const authorize = new URL(`${BASE}/api/auth/oauth2/authorize`);
    for (const [k, v] of Object.entries({ response_type: "code", client_id, redirect_uri: REDIRECT, scope: "openid offline_access", state: "s1", code_challenge: challenge, code_challenge_method: "S256", resource: RESOURCE })) {
      authorize.searchParams.set(k, v);
    }
    await page.goto(authorize.toString());
    await expect(page).toHaveURL(/\/sign-in\?/);
    await page.getByRole("button", { name: "[Dev] Girls Soccer Coach" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`Connect ${clientName}?`);
    await expect(page.getByRole("main")).toContainText("Draft stories, propose roster changes and draft feed posts for Gig Harbor Girls Soccer · Varsity.");
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("button", { name: "Allow", exact: true }).click();
    await expect.poll(() => callback).toContain("code=");
    const code = new URL(callback).searchParams.get("code")!;
    expect(new URL(callback).searchParams.get("state")).toBe("s1");

    const tokenRes = await request.post("/api/auth/oauth2/token", {
      form: { grant_type: "authorization_code", code, redirect_uri: REDIRECT, client_id, code_verifier: verifier, resource: RESOURCE },
    });
    expect(tokenRes.ok(), await tokenRes.text()).toBe(true);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    // The assistant works as the coach.
    const list = await mcp(request, access_token, "tools/list");
    expect(list.body.result.tools).toHaveLength(7);
    const teams = await mcp(request, access_token, "tools/call", { name: "psd_athletics_teams_list", arguments: {} });
    const soccer = JSON.parse(teams.body.result.content[0].text).teams[0];
    expect(soccer).toMatchObject({ sport: "Girls Soccer", level: "Varsity" });
    const title = `Assistant draft (${info.project.name})`;
    const saved = await mcp(request, access_token, "tools/call", {
      name: "psd_athletics_story_draft",
      arguments: { team_id: soccer.team_id, title, body: "Gig Harbor beat Capital 2–0.", dry_run: false },
    });
    expect(JSON.parse(saved.body.result.content[0].text)).toMatchObject({ status: "draft" });

    // The coach sees the draft and the assistant in the Studio, and turns it off.
    await page.goto("/studio/stories");
    await expect(page.getByRole("link", { name: new RegExp(title.replace(/[()]/g, "\\$&")) })).toBeVisible();
    await page.goto("/studio/activity");
    await expect(page.getByRole("listitem").filter({ hasText: title }).first()).toBeVisible();
    await page.getByRole("navigation", { name: "Studio" }).getByRole("link", { name: "Assistants" }).click();
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("button", { name: `Turn off ${clientName}` }).click();
    await expect(page.getByRole("status")).toContainText("Turned off.");
    const after = await mcp(request, access_token, "tools/list");
    expect(after.status).toBe(403);
    expect(after.body.error.message).toBe("This assistant was turned off in the Studio. Connect it again to use it.");
  });

  test("a forged token is refused", async ({ request }) => {
    const res = await mcp(request, "not.a.jwt", "tools/list");
    expect(res.status).toBe(401);
  });

  test("the consent page needs a signed request", async ({ page }) => {
    await signInAs(page, "[Dev] Girls Soccer Coach");
    expect((await page.goto("/connect?client_id=x&sig=forged&exp=1"))?.status()).toBe(404);
  });
});
