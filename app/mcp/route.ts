import { requireMcpAuth } from "@better-auth/mcp";

import { getAuth, mcpResource } from "../../lib/auth/server";
import { appDb } from "../../lib/data/db";
import { serveMcp } from "../../lib/mcp/server";
import { currentTime } from "../../lib/schedule/time";

/**
 * The MCP endpoint (SPEC §8). requireMcpAuth checks the bearer token's
 * signature, issuer, audience (this resource) and expiry, and answers
 * unauthenticated requests with the RFC 9728 challenge so clients can sign in.
 */
export async function POST(request: Request) {
  const auth = await getAuth();
  const protectedHandler = requireMcpAuth(auth, async (req, claims) => serveMcp(req, claims, { db: await appDb(), now: currentTime() }), { resource: mcpResource() });
  return protectedHandler(request);
}

/** Stateless server: no streams to open or sessions to end. */
export function GET() {
  return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
}

export const DELETE = GET;
