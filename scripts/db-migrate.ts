// Applies committed migrations in drizzle/ to the database in DATABASE_URL
// or the RDS settings (lib/db/postgres.ts). Usage: bun run db:migrate
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import { connectPostgres, migrationsFolder } from "../lib/db/client";
import { postgresTarget } from "../lib/db/postgres";

const target = postgresTarget();
if (!target) {
  console.error("No database configured (DATABASE_URL, or DATABASE_HOST/NAME/SECRET_ARN). Without one the app uses an in-memory database that migrates itself.");
  process.exit(1);
}

const pool = await connectPostgres(target, 1);
await migrate(drizzle(pool), { migrationsFolder });
await pool.end();
console.log(`Migrations applied from ${migrationsFolder}`);
