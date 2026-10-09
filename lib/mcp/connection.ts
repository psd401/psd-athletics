// An AI assistant's connection: one person, one OAuth client. Every MCP call
// runs as the person with this connection's id on the actor, so the audit log
// shows which assistant did what, and the person can turn it off (SPEC §2, §8).

import { and, desc, eq, isNull } from "drizzle-orm";

import type { Db } from "../db/client";
import * as s from "../db/schema";

export type ConnectionResult = { ok: true; connectionId: string; personId: string } | { ok: false; reason: string };

interface Claims {
  sub?: unknown;
  azp?: unknown;
  client_id?: unknown;
  iat?: unknown;
  exp?: unknown;
}

export async function resolveConnection(db: Db, claims: Claims, now: Date): Promise<ConnectionResult> {
  const personId = typeof claims.sub === "string" ? claims.sub : null;
  const clientId = typeof claims.azp === "string" ? claims.azp : typeof claims.client_id === "string" ? claims.client_id : null;
  if (!personId || !clientId) return { ok: false, reason: "The access token doesn't name a person and a client." };
  const issuedAt = typeof claims.iat === "number" ? new Date(claims.iat * 1000) : now;
  const expiresAt = typeof claims.exp === "number" ? new Date(claims.exp * 1000) : new Date(now.getTime() + 3600_000);

  const [latest] = await db
    .select()
    .from(s.agentConnection)
    .where(and(eq(s.agentConnection.personId, personId), eq(s.agentConnection.oauthClientId, clientId)))
    .orderBy(desc(s.agentConnection.createdAt))
    .limit(1);
  if (latest && !latest.revokedAt) {
    await db.update(s.agentConnection).set({ lastUsedAt: now, expiresAt }).where(eq(s.agentConnection.id, latest.id));
    return { ok: true, connectionId: latest.id, personId };
  }
  if (latest?.revokedAt && issuedAt.getTime() <= latest.revokedAt.getTime()) {
    return { ok: false, reason: "This assistant was turned off in the Studio. Connect it again to use it." };
  }
  const [client] = await db.select({ name: s.oauthClient.name }).from(s.oauthClient).where(eq(s.oauthClient.clientId, clientId));
  const [created] = await db
    .insert(s.agentConnection)
    .values({ personId, oauthClientId: clientId, clientName: client?.name?.slice(0, 80) || "AI assistant", expiresAt, lastUsedAt: now, createdAt: now })
    .returning({ id: s.agentConnection.id });
  return { ok: true, connectionId: created!.id, personId };
}

/** Turn an assistant off: the connection is revoked and its OAuth tokens and consent are deleted. Only the person's own. */
export async function revokeConnection(db: Db, { connectionId, personId }: { connectionId: string; personId: string }, now: Date): Promise<boolean> {
  const [conn] = await db
    .select()
    .from(s.agentConnection)
    .where(and(eq(s.agentConnection.id, connectionId), eq(s.agentConnection.personId, personId), isNull(s.agentConnection.revokedAt)));
  if (!conn) return false;
  await db.transaction(async (tx) => {
    await tx.update(s.agentConnection).set({ revokedAt: now }).where(eq(s.agentConnection.id, conn.id));
    if (conn.oauthClientId) {
      const mine = (table: typeof s.oauthAccessToken | typeof s.oauthRefreshToken | typeof s.oauthConsent) =>
        and(eq(table.clientId, conn.oauthClientId!), eq(table.userId, personId));
      await tx.delete(s.oauthAccessToken).where(mine(s.oauthAccessToken));
      await tx.delete(s.oauthRefreshToken).where(mine(s.oauthRefreshToken));
      await tx.delete(s.oauthConsent).where(mine(s.oauthConsent));
    }
  });
  return true;
}

export async function listConnections(db: Db, personId: string) {
  return db
    .select({
      id: s.agentConnection.id,
      clientName: s.agentConnection.clientName,
      createdAt: s.agentConnection.createdAt,
      lastUsedAt: s.agentConnection.lastUsedAt,
      revokedAt: s.agentConnection.revokedAt,
    })
    .from(s.agentConnection)
    .where(eq(s.agentConnection.personId, personId))
    .orderBy(desc(s.agentConnection.createdAt));
}
