import { devSignInEnabled, seedDevPeople } from "../auth/dev";
import { getDb, type Db } from "../db/client";
import { seedFromFixtures } from "../db/seed";
import { currentTime, pacificDate } from "../schedule/time";

/**
 * The database for pages and route handlers. Without DATABASE_URL this is
 * the in-memory PGlite, seeded from fixtures/ on first use (PLAN §2).
 */
export function appDb(): Promise<Db> {
  return getDb(async (db) => {
    await seedFromFixtures(db);
    // Made-up Studio people for local development and e2e only (lib/auth/dev.ts).
    if (devSignInEnabled()) await seedDevPeople(db, `${pacificDate(currentTime()).slice(0, 4)}-08-01`);
  });
}
