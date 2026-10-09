import { getAuth } from "../../../../lib/auth/server";

// Better Auth's endpoints (/api/auth/*): OAuth callback, session, sign-out.
async function handle(request: Request) {
  const auth = await getAuth();
  return auth.handler(request);
}

export { handle as GET, handle as POST };
