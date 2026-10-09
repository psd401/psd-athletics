import { defineConfig } from "drizzle-kit";

// Only `drizzle-kit generate` uses this; it needs no database connection.
// Migrations are applied by scripts/db-migrate.ts (or on first use in dev).
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
});
