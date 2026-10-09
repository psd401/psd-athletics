import { getAuth } from "../../../lib/auth/server";

/**
 * OAuth discovery at the site root, where MCP clients look for it:
 * /.well-known/oauth-protected-resource[/mcp] (RFC 9728) and
 * /.well-known/oauth-authorization-server (RFC 8414). The Better Auth MCP
 * plugin answers both; anything else is not found.
 */
export async function GET(request: Request) {
  const path = new URL(request.url).pathname;
  if (!/^\/\.well-known\/(oauth-protected-resource|oauth-authorization-server|openid-configuration)(\/|$)/.test(path)) {
    return new Response("Not found", { status: 404 });
  }
  return (await getAuth()).handler(request);
}
