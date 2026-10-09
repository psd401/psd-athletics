// Loads the fixtures into the database in DATABASE_URL (after db:migrate).
// Does nothing if the database already has schools.
// Usage: bun run db:seed
import { createPostgresDb } from "../lib/db/client";
import { seedFromFixtures } from "../lib/db/seed";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Without it the app seeds its in-memory database by itself.");
  process.exit(1);
}

const result = await seedFromFixtures(createPostgresDb(url));
console.log(result.seeded ? `Seeded ${result.games} games from fixtures/.` : "Database already has schools; nothing seeded.");
process.exit(0);
