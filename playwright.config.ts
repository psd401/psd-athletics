import { defineConfig } from "@playwright/test";

// Smoke + accessibility suite (standards/05: 3–5 core journeys). Runs against
// a production build (`bun run test:e2e` builds first) with the in-memory
// database seeded from fixtures/ and the clock pinned to the snapshot time.
const port = 3210;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { browserName: "chromium", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: `bun run start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      ATHLETICS_NOW: "2026-10-08T19:00:00-07:00",
      // Not a real secret: production mode refuses Better Auth's default.
      BETTER_AUTH_SECRET: "e2e-only-not-a-secret-0000000000000000",
      BETTER_AUTH_URL: `http://localhost:${port}`,
    },
  },
});
