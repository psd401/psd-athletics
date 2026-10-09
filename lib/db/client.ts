import { join } from "node:path";

import { PGlite } from "@electric-sql/pglite";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { drizzle as drizzleNodePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { Pool } from "pg";

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

type Prepare = (db: Db) => Promise<void>;

const globalForDb = globalThis as typeof globalThis & { __athleticsDb?: Promise<Db> };

/**
 * The app's database. With DATABASE_URL, Postgres (migrations are applied by
 * `bun run db:migrate` at deploy). Without it, an in-memory PGlite that is
 * migrated and then handed to `prepare` (the fixture seed) once per process,
 * so dev and tests need no database server. docs/PLAN.md §2.
 */
export function getDb(prepare?: Prepare): Promise<Db> {
  globalForDb.__athleticsDb ??= (async () => {
    const url = process.env.DATABASE_URL;
    if (url) return createPostgresDb(url);
    const db = await createMemoryDb();
    if (prepare) await prepare(db);
    return db;
  })();
  return globalForDb.__athleticsDb;
}
