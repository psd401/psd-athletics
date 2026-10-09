// Where the app's Postgres is: DATABASE_URL (local or any host), or the RDS
// instance from infra/ (host, name and the RDS-managed secret's ARN). On RDS
// the password is read from Secrets Manager when a connection opens, so it
// never sits in config and RDS rotation doesn't break new connections
// (DECISIONS 107).

import { readFile as fsReadFile } from "node:fs/promises";

import type { PoolConfig } from "pg";

export type PostgresTarget =
  | { kind: "url"; url: string }
  | { kind: "rds"; host: string; port: number; database: string; secretArn: string; caFile: string };

/** The RDS certificate bundle baked into the image (Dockerfile). */
export const RDS_CA_FILE = "/etc/ssl/rds/global-bundle.pem";

export function postgresTarget(env: Record<string, string | undefined> = process.env): PostgresTarget | null {
  if (env.DATABASE_URL) return { kind: "url", url: env.DATABASE_URL };
  if (env.DATABASE_HOST && env.DATABASE_NAME && env.DATABASE_SECRET_ARN) {
    return {
      kind: "rds",
      host: env.DATABASE_HOST,
      port: Number(env.DATABASE_PORT ?? 5432),
      database: env.DATABASE_NAME,
      secretArn: env.DATABASE_SECRET_ARN,
      caFile: env.DATABASE_CA_FILE ?? RDS_CA_FILE,
    };
  }
  return null;
}

/** Username and password from the RDS secret, cached for `ttlMs`. */
export function rdsCredentials(readSecret: () => Promise<string>, { ttlMs = 60_000, now = () => Date.now() } = {}) {
  let cached: { at: number; value: { username: string; password: string } } | null = null;
  return async () => {
    if (cached && now() - cached.at < ttlMs) return cached.value;
    const parsed = JSON.parse(await readSecret()) as { username?: unknown; password?: unknown };
    if (typeof parsed.username !== "string" || typeof parsed.password !== "string") throw new Error("The database secret has no username and password.");
    cached = { at: now(), value: { username: parsed.username, password: parsed.password } };
    return cached.value;
  };
}

async function readSecretsManager(secretArn: string): Promise<string> {
  const { GetSecretValueCommand, SecretsManagerClient } = await import("@aws-sdk/client-secrets-manager");
  const out = await new SecretsManagerClient({}).send(new GetSecretValueCommand({ SecretId: secretArn }));
  if (!out.SecretString) throw new Error("The database secret is empty.");
  return out.SecretString;
}

export async function poolConfig(
  target: PostgresTarget,
  deps: { secret?: () => Promise<string>; readFile?: (path: string) => Promise<string> },
  max = 10,
): Promise<PoolConfig> {
  if (target.kind === "url") return { connectionString: target.url, max };
  const creds = rdsCredentials(deps.secret ?? (() => readSecretsManager(target.secretArn)));
  const { username } = await creds();
  const ca = await (deps.readFile ?? ((p: string) => fsReadFile(p, "utf8")))(target.caFile);
  return {
    host: target.host,
    port: target.port,
    database: target.database,
    user: username,
    password: async () => (await creds()).password,
    ssl: { ca, rejectUnauthorized: true },
    max,
  };
}
