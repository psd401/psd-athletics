import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

test.describe("coaches and staff", () => {
  test("shows the office and every sport's coach card, and passes axe", async ({ page }) => {
    await page.goto("/phs/staff");
    await expect(page).toHaveTitle("Coaches & staff · Seahawks Athletics");
    await expect(page.locator('a[aria-current="page"]')).toHaveText("Coaches");
    await expect(page.getByRole("heading", { name: "Ross Filkins" })).toBeVisible();
    // No office or coach email addresses or phone numbers on the page (DECISIONS 65).
    await expect(page.locator('a[href^="mailto:"], a[href^="tel:"]')).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Football team page" })).toHaveAttribute("href", "/phs/teams/football");
    await expect(page.getByText("Head coach not listed yet").first()).toBeVisible();
    // No coach email addresses anywhere in the directory.
    await expect(page.getByRole("region", { name: "Head coaches" }).locator('a[href^="mailto:"]')).toHaveCount(0);
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("searches and filters by season", async ({ page }) => {
    await page.goto("/ghh/staff");
    await page.getByRole("button", { name: "Winter" }).click();
    await expect(page.getByRole("link", { name: "Wrestling team page" })).toBeVisible();
    // Exact: winter has Girls Flag Football.
    await expect(page.getByRole("link", { name: "Football team page", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "All seasons" }).click();
    await page.getByRole("searchbox", { name: "Search coaches and sports" }).fill("soccer");
    await expect(page.getByRole("link", { name: /Soccer team page/ })).toHaveCount(2);
  });

  test("keeps the Gig Harbor AD as a placeholder until it's known", async ({ page }) => {
    await page.goto("/ghh/staff");
    await expect(page.getByRole("heading", { name: "[Athletic director]" })).toBeVisible();
  });
});
