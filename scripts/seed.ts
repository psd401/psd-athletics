// Loads the fixtures into the configured database (after db:migrate).
// Does nothing if the database already has schools.
// Usage: bun run db:seed
import { drizzle } from "drizzle-orm/node-postgres";

import { connectPostgres, type Db } from "../lib/db/client";
import { postgresTarget } from "../lib/db/postgres";
import * as schema from "../lib/db/schema";
import { seedFromFixtures } from "../lib/db/seed";

const target = postgresTarget();
if (!target) {
  console.error("No database configured. Without one the app seeds its in-memory database by itself.");
  process.exit(1);
}

const result = await seedFromFixtures(drizzle(await connectPostgres(target, 2), { schema }) as unknown as Db);
console.log(result.seeded ? `Seeded ${result.games} games from fixtures/.` : "Database already has schools; nothing seeded.");
process.exit(0);
