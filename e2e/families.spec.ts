import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

test.describe("families hub", () => {
  test("lists every step in order with the links we have, and passes axe", async ({ page }) => {
    await page.goto("/families");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Get your athlete on the field");
    const steps = page.getByRole("list").first().locator(":scope > li");
    await expect(steps).toHaveCount(6);
    await expect(page.getByRole("heading", { level: 2, name: "Register on Final Forms" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open Final Forms" })).toHaveAttribute("href", "https://peninsula-wa.finalforms.com");
    await expect(page.getByRole("link", { name: "WIAA Student Eligibility Center" })).toHaveAttribute("href", "https://www.wiaa.com/eligibility/");
    await expect(page.getByText("Link coming soon. Your athletics office can help now.")).toHaveCount(4);
    await expect(page.getByRole("complementary", { name: "Athletics offices" })).toContainText("Ross Filkins");
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("the hub's family cards lead to the right step", async ({ page }) => {
    await page.goto("/");
    await page.locator("#families").getByRole("link", { name: /Sports physical/ }).click();
    await expect(page).toHaveURL(/\/families#physical$/);
    await expect(page.locator("#physical")).toBeInViewport();
  });
});
