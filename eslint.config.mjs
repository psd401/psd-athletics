import vitest from "@vitest/eslint-plugin";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([".next/**", "out/**", "node_modules/**", "next-env.d.ts", "coverage/**", "design/**", "vendor/**"]),
  ...nextVitals,
  ...nextTs,
  {
    // Test-quality rules required by the PSD testing standard (05-testing.md):
    // no assertion-free tests, no committed .only, no committed .skip.
    // Applied to the Playwright specs too.
    files: ["**/*.test.{ts,tsx}", "e2e/**/*.spec.ts"],
    plugins: { vitest },
    rules: {
      "vitest/expect-expect": "error",
      "vitest/no-focused-tests": "error",
      "vitest/no-disabled-tests": "error",
    },
  },
]);
