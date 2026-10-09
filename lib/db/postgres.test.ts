// @vitest-environment node
import { describe, expect, it } from "vitest";

import { poolConfig, postgresTarget, rdsCredentials } from "./postgres";

describe("postgresTarget", () => {
  it("prefers DATABASE_URL, then the RDS settings, else none (in-memory)", () => {
    expect(postgresTarget({ DATABASE_URL: "postgres://u:p@h/db" })).toEqual({ kind: "url", url: "postgres://u:p@h/db" });
    expect(
      postgresTarget({ DATABASE_HOST: "db.internal", DATABASE_PORT: "5432", DATABASE_NAME: "athletics", DATABASE_SECRET_ARN: "arn:aws:secretsmanager:us-west-2:1:secret:x" }),
    ).toEqual({ kind: "rds", host: "db.internal", port: 5432, database: "athletics", secretArn: "arn:aws:secretsmanager:us-west-2:1:secret:x", caFile: "/etc/ssl/rds/global-bundle.pem" });
    expect(postgresTarget({ DATABASE_HOST: "db.internal" })).toBeNull();
    expect(postgresTarget({})).toBeNull();
  });
});

describe("rdsCredentials", () => {
  it("reads the secret once a minute, so a rotated password is picked up for new connections", async () => {
    let calls = 0;
    let password = "first";
    let now = 0;
    const creds = rdsCredentials(async () => {
      calls++;
      return JSON.stringify({ username: "athletics_admin", password });
    }, { ttlMs: 60_000, now: () => now });
    expect(await creds()).toEqual({ username: "athletics_admin", password: "first" });
    password = "rotated";
    now = 59_000;
    expect((await creds()).password).toBe("first");
    now = 61_000;
    expect((await creds()).password).toBe("rotated");
    expect(calls).toBe(2);
  });

  it("refuses a secret without a username and password", async () => {
    await expect(rdsCredentials(async () => JSON.stringify({ password: "x" }))()).rejects.toThrow("The database secret has no username and password.");
  });
});

describe("poolConfig", () => {
  it("connects to RDS over verified TLS with the password read at connect time", async () => {
    const config = await poolConfig(
      { kind: "rds", host: "db.internal", port: 5432, database: "athletics", secretArn: "arn", caFile: "/ca.pem" },
      { secret: async () => JSON.stringify({ username: "athletics_admin", password: "pw" }), readFile: async () => "CA PEM" },
    );
    expect(config).toMatchObject({ host: "db.internal", port: 5432, database: "athletics", user: "athletics_admin", ssl: { ca: "CA PEM", rejectUnauthorized: true } });
    expect(typeof config.password).toBe("function");
    expect(await (config.password as () => Promise<string>)()).toBe("pw");
  });

  it("passes a URL straight through", async () => {
    expect(await poolConfig({ kind: "url", url: "postgres://x" }, {})).toMatchObject({ connectionString: "postgres://x" });
  });
});
