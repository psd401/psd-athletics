import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

// Peninsula's own layout (design/PHS-Home.dc.html). Clock: Thu Oct 8 2026, 7:00 PM Pacific.

test.describe("Peninsula home", () => {
  test("has the match-card hero, live strip, week board and champions band, and passes axe", async ({ page }) => {
    await page.goto("/phs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Lights on in Purdy.");
    await expect(page.getByText("The Seahawks host North Thurston at 7:00 PM.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Buy tickets on GoFan" })).toHaveAttribute("href", "https://gofan.co/app/school/WA23302");
    await expect(page.getByText("Live now", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "The week ahead" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fish Bowl champions" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "More than a scoreboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "filkinsr@psd401.net" })).toHaveAttribute("href", "mailto:filkinsr@psd401.net");
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("filters the week board by level", async ({ page }) => {
    await page.goto("/phs");
    const week = page.locator("#week");
    await week.getByRole("button", { name: "JV & Freshman" }).click();
    await expect(week.getByRole("link", { name: /JV · Freshman\s*Volleyball/ })).toBeVisible();
    await expect(week.getByRole("link", { name: /^Varsity/ })).toHaveCount(0);
  });

  test("Gig Harbor doesn't get a champions band it didn't win", async ({ page }) => {
    await page.goto("/ghh");
    await expect(page.getByRole("heading", { name: "Fish Bowl champions" })).toHaveCount(0);
  });
});
