import { getDb, type Db } from "../db/client";
import { seedFromFixtures } from "../db/seed";

/**
 * The database for pages and route handlers. Without DATABASE_URL this is
 * the in-memory PGlite, seeded from fixtures/ on first use (PLAN §2).
 */
export function appDb(): Promise<Db> {
  return getDb(async (db) => {
    await seedFromFixtures(db);
  });
}
