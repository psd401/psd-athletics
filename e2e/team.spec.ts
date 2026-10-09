import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

test.describe("team page", () => {
  test("shows the record, schedule and next game, and passes axe", async ({ page }) => {
    await page.goto("/ghh/teams/football");
    await expect(page).toHaveTitle("Football · Tides Athletics");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Football");
    const record = page.getByRole("definition");
    await expect(record.first()).toHaveText("3–2");
    await expect(page.getByRole("row", { name: /@ Lincoln/ })).toContainText("Win, 31–28");
    await expect(page.getByRole("row", { name: /@ Central Kitsap/ })).toContainText("Next up");
    await expect(page.getByRole("complementary", { name: "Team details" })).toContainText("Puget Sound League · 2nd, 2–0");
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("switches levels by link and says when there's no record yet", async ({ page }) => {
    await page.goto("/phs/teams/football");
    await page.getByRole("navigation", { name: "Team level" }).getByRole("link", { name: "JV" }).click();
    await expect(page).toHaveURL(/\/phs\/teams\/football\?level=jv$/);
    await expect(page.getByRole("navigation", { name: "Team level" }).getByRole("link", { name: "JV" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await expect(page.getByText("JV records appear here as soon as they're published.")).toBeVisible();
    await expect(page.getByRole("row", { name: /North Thurston/ })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("has empty states for content coaches haven't posted", async ({ page }) => {
    await page.goto("/ghh/teams/volleyball");
    await page.getByRole("tab", { name: "Roster" }).click();
    await expect(page.getByRole("tabpanel", { name: "Roster" })).toContainText("once the coaching staff posts it");
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Coaches" })).toHaveAttribute("aria-selected", "true");
    expect(await axeViolations(page)).toEqual([]);
  });

  test("is reached from the school's Teams section", async ({ page }) => {
    await page.goto("/ghh");
    await page.locator("#teams").getByRole("link", { name: /Girls Soccer/ }).click();
    await expect(page).toHaveURL(/\/ghh\/teams\/girls-soccer$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Girls Soccer");
  });

  test("unknown sports are not found", async ({ page }) => {
    expect((await page.goto("/ghh/teams/quidditch"))?.status()).toBe(404);
  });
});
