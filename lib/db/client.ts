import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { Pool } from "pg";

import { poolConfig, postgresTarget, type PostgresTarget } from "./postgres";
import * as schema from "./schema";

export type Schema = typeof schema;
/** Either driver; both are Postgres, so queries are written once. */
export type Db = PgDatabase<PgQueryResultHKT, Schema>;

export const migrationsFolder = join(process.cwd(), "drizzle");

/** A fresh in-memory Postgres (PGlite) with every migration applied. */
export async function createMemoryDb(): Promise<Db> {
  const client = new PGlite();
  const db = drizzlePglite(client, { schema });
  await migratePglite(db, { migrationsFolder });
  return db as unknown as Db;
}

export function createPostgresDb(connectionString: string): Db {
  const pool = new Pool({ connectionString, max: 10 });
  return drizzleNodePg(pool, { schema }) as unknown as Db;
}

/** A pool for a DATABASE_URL or the RDS instance (lib/db/postgres.ts). */
export async function connectPostgres(target: PostgresTarget, max = 10): Promise<Pool> {
  return new Pool(await poolConfig(target, {}, max));
}

type Prepare = (db: Db) => Promise<void>;

const globalForDb = globalThis as typeof globalThis & { __athleticsDb?: Promise<Db> };

/**
 * The app's database. With DATABASE_URL or the RDS settings, Postgres
 * (migrations are applied by `bun run db:migrate` at deploy). Without them, an in-memory PGlite that is
 * migrated and then handed to `prepare` (the fixture seed) once per process,
 * so dev and tests need no database server. docs/PLAN.md §2.
 */
export function getDb(prepare?: Prepare): Promise<Db> {
  globalForDb.__athleticsDb ??= (async () => {
    const target = postgresTarget();
    if (target) return drizzleNodePg(await connectPostgres(target), { schema }) as unknown as Db;
    const db = await createMemoryDb();
    if (prepare) await prepare(db);
    return db;
  })();
  return globalForDb.__athleticsDb;
}
