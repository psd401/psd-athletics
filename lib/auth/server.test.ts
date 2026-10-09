// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";

import { createMemoryDb, type Db } from "../db/client";
import * as schema from "../db/schema";
import { createAuth, type Auth } from "./server";

let db: Db;
let auth: Auth;

beforeAll(async () => {
  process.env.BETTER_AUTH_SECRET = "test-only-secret-not-used-anywhere-else";
  db = await createMemoryDb();
  auth = createAuth(db);
  await db.insert(schema.person).values([
    { id: "district", name: "District Coach", email: "coach@psd401.net", emailVerified: true },
    { id: "outsider", name: "Outside Person", email: "someone@gmail.com", emailVerified: true },
    { id: "unverified", name: "Unverified", email: "new@psd401.net", emailVerified: false },
  ]);
}, 30_000);

describe("sessions", () => {
  it("are created for a verified psd401.net person", async () => {
    const ctx = await auth.$context;
    const session = await ctx.internalAdapter.createSession("district");
    expect(session.userId).toBe("district");
  });

  it.each(["outsider", "unverified"])("are refused for %s", async (id) => {
    const ctx = await auth.$context;
    await expect(ctx.internalAdapter.createSession(id)).rejects.toThrow(/district_account_required/);
  });
});

describe("Google sign-in", () => {
  const validate = () => auth.options.user!.validateUserInfo!;
  const source = (hd?: string) => ({
    method: "oauth" as const,
    action: "create-user" as const,
    oauth: { providerId: "google", profile: hd ? { hd } : {} },
  });

  it("accepts a verified psd401.net Google account", async () => {
    const result = await validate()(
      { user: { email: "coach@psd401.net", emailVerified: true }, source: source("psd401.net") },
    );
    expect(result).toBeUndefined();
  });

  it.each([
    ["a personal Gmail account", "someone@gmail.com", true, undefined],
    ["an unverified district email", "coach@psd401.net", false, "psd401.net"],
    ["another Workspace", "coach@psd401.net", true, "other.org"],
  ])("rejects %s", async (_label, email, emailVerified, hd) => {
    const result = await validate()({ user: { email, emailVerified }, source: source(hd) });
    expect(result).toEqual({
      error: "district_account_required",
      errorDescription: "Sign in with your psd401.net Google account.",
    });
  });
});
