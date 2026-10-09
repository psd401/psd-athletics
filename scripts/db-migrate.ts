// Applies committed migrations in drizzle/ to the database in DATABASE_URL.
// Usage: bun run db:migrate
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import { migrationsFolder } from "../lib/db/client";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Without it the app uses an in-memory database that migrates itself.");
  process.exit(1);
}

const pool = new Pool({ connectionString: url, max: 1 });
await migrate(drizzle(pool), { migrationsFolder });
await pool.end();
console.log(`Migrations applied from ${migrationsFolder}`);
