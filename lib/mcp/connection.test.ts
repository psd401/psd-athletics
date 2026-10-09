// @vitest-environment node
import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import * as s from "../db/schema";
import { listConnections, resolveConnection, revokeConnection } from "./connection";

let db: Db;
const t = (iso: string) => new Date(iso);

beforeAll(async () => {
  db = await createMemoryDb();
  await db.insert(s.person).values([
    { id: "coach", name: "Coach", email: "coach@psd401.net", emailVerified: true },
    { id: "other", name: "Other", email: "other@psd401.net", emailVerified: true },
  ]);
  await db.insert(s.oauthClient).values({ id: "c1", clientId: "client-1", name: "Claude", redirectUris: ["https://claude.ai/api/mcp/auth_callback"] });
}, 30_000);

describe("resolveConnection", () => {
  it("creates one connection per person and client, then reuses it and records use", async () => {
    const claims = { sub: "coach", azp: "client-1", iat: Math.floor(t("2026-10-09T15:00:00Z").getTime() / 1000), exp: Math.floor(t("2026-10-09T16:00:00Z").getTime() / 1000) };
    const first = await resolveConnection(db, claims, t("2026-10-09T15:00:01Z"));
    expect(first).toMatchObject({ ok: true });
    const again = await resolveConnection(db, claims, t("2026-10-09T15:05:00Z"));
    expect(again.ok && first.ok && again.connectionId === first.connectionId).toBe(true);
    const [row] = await db.select().from(s.agentConnection).where(eq(s.agentConnection.personId, "coach"));
    expect(row).toMatchObject({ clientName: "Claude", oauthClientId: "client-1", lastUsedAt: t("2026-10-09T15:05:00Z") });
  });

  it("refuses tokens issued before the person turned the assistant off, and revokes its tokens", async () => {
    const [conn] = await db.select().from(s.agentConnection).where(eq(s.agentConnection.personId, "coach"));
    await db.insert(s.oauthRefreshToken).values({ id: "r1", token: "rt", clientId: "client-1", userId: "coach", scopes: ["openid"] });
    expect(await revokeConnection(db, { connectionId: conn!.id, personId: "other" }, t("2026-10-09T15:10:00Z"))).toBe(false);
    expect(await revokeConnection(db, { connectionId: conn!.id, personId: "coach" }, t("2026-10-09T15:10:00Z"))).toBe(true);
    expect(await db.select().from(s.oauthRefreshToken)).toEqual([]);

    const old = { sub: "coach", azp: "client-1", iat: Math.floor(t("2026-10-09T15:00:00Z").getTime() / 1000), exp: Math.floor(t("2026-10-09T16:00:00Z").getTime() / 1000) };
    expect(await resolveConnection(db, old, t("2026-10-09T15:11:00Z"))).toEqual({ ok: false, reason: "This assistant was turned off in the Studio. Connect it again to use it." });

    // Connecting again (new consent, new token) starts a new connection.
    const fresh = { ...old, iat: Math.floor(t("2026-10-09T15:20:00Z").getTime() / 1000) };
    const back = await resolveConnection(db, fresh, t("2026-10-09T15:20:01Z"));
    expect(back.ok && back.connectionId !== conn!.id).toBe(true);
  });

  it("needs a person and a client in the token", async () => {
    expect(await resolveConnection(db, { sub: "coach" }, t("2026-10-09T15:00:00Z"))).toEqual({ ok: false, reason: "The access token doesn't name a person and a client." });
  });
});

describe("listConnections", () => {
  it("shows a person their own assistants, newest use first", async () => {
    const rows = await listConnections(db, "coach");
    expect(rows.map((r) => [r.clientName, r.revokedAt === null])).toEqual([
      ["Claude", true],
      ["Claude", false],
    ]);
    expect(await listConnections(db, "other")).toEqual([]);
  });
});
