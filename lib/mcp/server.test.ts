// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { seedFromFixtures } from "../db/seed";
import { listTeams } from "../data/queries";
import { revokeConnection } from "./connection";
import { serveMcp } from "./server";

let db: Db;
let soccer: string;
const now = new Date("2026-10-09T15:00:00Z");
const claims = { sub: "coach", azp: "client-1", iat: Math.floor(now.getTime() / 1000) - 60, exp: Math.floor(now.getTime() / 1000) + 3600 };

beforeAll(async () => {
  db = await createMemoryDb();
  await seedFromFixtures(db);
  soccer = (await listTeams(db, { schoolId: "ghhs" })).find((t) => t.sportSlug === "girls-soccer" && t.level === "varsity")!.id;
  await db.insert(s.person).values({ id: "coach", name: "Coach", email: "coach@psd401.net", emailVerified: true });
  await db.insert(s.roleAssignment).values({ personId: "coach", role: "head_coach", teamId: soccer, startsOn: "2026-08-01", source: "test" });
  await db.insert(s.oauthClient).values({ id: "c1", clientId: "client-1", name: "Claude", redirectUris: ["https://claude.ai/cb"] });
}, 30_000);

async function call(method: string, params: Record<string, unknown> = {}, c: Record<string, unknown> = claims) {
  const request = new Request("http://localhost/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json, text/event-stream", "mcp-protocol-version": "2025-11-25" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const res = await serveMcp(request, c, { db, now, clock: now });
  const text = await res.text();
  const data = text.startsWith("event:") ? JSON.parse(text.split("data: ")[1]!.split("\n")[0]!) : JSON.parse(text);
  return { status: res.status, data };
}

describe("the MCP endpoint", () => {
  it("lists seven tools with PSD names and read-only / destructive hints on each", async () => {
    const { data } = await call("tools/list");
    const tools = data.result.tools as { name: string; annotations: Record<string, boolean> }[];
    expect(tools.map((t) => t.name).sort()).toEqual([
      "psd_athletics_content_publish",
      "psd_athletics_drafts_list",
      "psd_athletics_feed_post",
      "psd_athletics_roster_update",
      "psd_athletics_schedule_get",
      "psd_athletics_story_draft",
      "psd_athletics_teams_list",
    ]);
    for (const t of tools) {
      expect(typeof t.annotations.readOnlyHint, t.name).toBe("boolean");
      expect(typeof t.annotations.destructiveHint, t.name).toBe("boolean");
    }
    // Only the roster tool removes things.
    expect(tools.filter((t) => t.annotations.destructiveHint).map((t) => t.name)).toEqual(["psd_athletics_roster_update"]);
    expect(tools.find((t) => t.name === "psd_athletics_story_draft")!.annotations.readOnlyHint).toBe(false);
    expect(tools.find((t) => t.name === "psd_athletics_schedule_get")!.annotations.readOnlyHint).toBe(true);
  });

  it("runs tools as the signed-in person", async () => {
    const { data } = await call("tools/call", { name: "psd_athletics_teams_list", arguments: {} });
    expect(JSON.parse(data.result.content[0].text).teams.map((t: { sport: string }) => t.sport)).toEqual(["Girls Soccer"]);
  });

  it("returns errors that say what to do next", async () => {
    const { data } = await call("tools/call", { name: "psd_athletics_schedule_get", arguments: { team_id: "00000000-0000-0000-0000-000000000000" } });
    expect(data.result).toMatchObject({ isError: true, content: [{ type: "text", text: "No team with that id. Call psd_athletics_teams_list for ids." }] });
  });

  it("refuses an assistant the person turned off", async () => {
    await call("tools/list");
    const [conn] = await db.select().from(s.agentConnection);
    await revokeConnection(db, { connectionId: conn!.id, personId: "coach" }, new Date(now.getTime() + 1000));
    const later = new Date(now.getTime() + 2000);
    const res = await serveMcp(new Request("http://localhost/mcp", { method: "POST", body: "{}" }), claims, { db, now: later, clock: later });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: { message: "This assistant was turned off in the Studio. Connect it again to use it." } });
  });
});
