import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

// The server runs with ATHLETICS_NOW = Thu Oct 8 2026, 7:00 PM Pacific.

test.describe("Gig Harbor home", () => {
  test("counts down to Friday's game and passes axe", async ({ page }) => {
    await page.goto("/ghh");
    await expect(page).toHaveTitle("Gig Harbor Tides Athletics");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Friday night at Central Kitsap.");
    await expect(page.getByText("Game 6 · League · Away")).toBeVisible();
    await expect(page.getByRole("timer", { name: "Time until kickoff" })).toContainText("Days");
    await expect(page.getByRole("heading", { name: /Girls Soccer\s*vs Mount Tahoma/ })).toBeVisible();
    await expect(page.getByText("Volleyball has won four straight.")).toBeVisible();
    await expect(page.getByRole("list", { name: "Last five: loss, win, loss, win, win" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Built on titles" })).toBeVisible();

    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("filters this week", async ({ page }) => {
    await page.goto("/ghh");
    const week = page.locator("#week");
    await expect(week.getByRole("article")).toHaveCount(7);
    await week.getByRole("button", { name: "Home" }).click();
    await expect(week.getByRole("article")).toHaveCount(4);
    await week.getByRole("button", { name: "Football" }).click();
    await expect(week.getByRole("article")).toHaveCount(2);
    await expect(week.getByRole("button", { name: "Football" })).toHaveAttribute("aria-pressed", "true");
  });

  test("switches team seasons from the keyboard", async ({ page }) => {
    await page.goto("/ghh");
    await page.getByRole("tab", { name: "Fall" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("tab", { name: "Winter" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tabpanel")).toContainText("Wrestling");
  });
});

test.describe("Gig Harbor home, desktop menu", () => {
  test.skip(({ isMobile }) => isMobile, "The masthead nav is hidden on phones, as in the comp");

  test("opens the Teams menu and closes it with Escape", async ({ page }) => {
    await page.goto("/ghh");
    const teams = page.getByRole("button", { name: "Teams" });
    await teams.click();
    await expect(teams).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("heading", { name: "Winter", level: 2 })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(teams).toHaveAttribute("aria-expanded", "false");
    await expect(teams).toBeFocused();
  });
});

test.describe("Peninsula home", () => {
  test("renders the same template in the Peninsula theme and passes axe", async ({ page }) => {
    await page.goto("/phs");
    await expect(page).toHaveTitle("Peninsula Seahawks Athletics");
    await expect(page.locator("[data-school]")).toHaveAttribute("data-school", "phs");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Friday night at home.");
    await expect(page.getByRole("link", { name: /Directions to Roy Anderson Field/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "More than a scoreboard" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("unknown schools are not found", async ({ page }) => {
    const response = await page.goto("/xyz");
    expect(response?.status()).toBe(404);
  });
});
