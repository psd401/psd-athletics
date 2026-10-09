import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

// Phone-only additions (design/PHS-Mobile.dc.html). Clock: Thu Oct 8 2026, 7:00 PM Pacific.

test.describe("school home on a phone", () => {
  test.skip(({ isMobile }) => !isMobile, "phone layout");

  test("has My teams, quick links and the tab bar, and passes axe", async ({ page }) => {
    await page.goto("/phs");
    const tabs = page.getByRole("navigation", { name: "Sections" });
    await expect(tabs).toBeVisible();
    await expect(tabs.getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "My teams" })).toBeVisible();
    await expect(page.getByText("Pick your teams to see their next games here.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Quick links" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Tickets" }).last()).toHaveAttribute("href", "https://gofan.co/app/school/WA23302");
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("remembers picked teams on this phone", async ({ page }) => {
    await page.goto("/phs");
    await page.getByRole("button", { name: "Pick teams" }).click();
    await page.getByRole("checkbox", { name: "Volleyball · Varsity" }).check();
    await page.getByRole("button", { name: "Done" }).click();
    const mine = page.getByRole("region", { name: "My teams" });
    await expect(mine.getByRole("link").first()).toContainText("vs Timberline");
    await page.reload();
    await expect(page.getByRole("region", { name: "My teams" }).getByRole("link").first()).toContainText("vs Timberline");
    await page.getByRole("button", { name: "This week" }).click();
    await expect(page.getByRole("region", { name: "My teams" }).getByRole("link")).toHaveCount(2);
  });
});

test.describe("phone gutters", () => {
  test.skip(({ isMobile }) => !isMobile, "phone layout");

  for (const path of ["/ghh", "/phs", "/ghh/schedule", "/phs/teams/football"]) {
    test(`${path} keeps a 16px side gutter around the main heading`, async ({ page }) => {
      await page.goto(path);
      const box = await page.getByRole("heading", { level: 1 }).boundingBox();
      expect(box?.x).toBeGreaterThanOrEqual(16);
    });
  }
});

test.describe("school home on a desktop", () => {
  test.skip(({ isMobile }) => isMobile, "desktop layout");

  test("hides the phone-only sections", async ({ page }) => {
    await page.goto("/ghh");
    await expect(page.getByRole("heading", { name: "My teams" })).toBeHidden();
    await expect(page.getByRole("navigation", { name: "Sections" })).toBeHidden();
  });
});
