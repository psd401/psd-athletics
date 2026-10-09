import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

// The server runs with ATHLETICS_NOW = Thu Oct 8 2026, 7:00 PM Pacific.

test.describe("district hub", () => {
  test("shows both schools, scores and the week, and passes axe", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Tides" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Seahawks" })).toBeVisible();
    await expect(page.getByText("Football @ Central Kitsap · Fri 7:00 PM")).toBeVisible();
    await expect(page.getByText("Football vs North Thurston · Fri 7:00 PM")).toBeVisible();

    const scores = page.getByRole("region", { name: "Live scores and tonight's games" });
    await expect(scores.getByRole("listitem").first()).toHaveText("LivePeninsulaGirls Soccer vs Silas");

    await expect(page.getByText("19 games · From the fall schedule snapshot · Times Pacific")).toBeVisible();
    await expect(page.getByText("The Fish Bowl", { exact: true })).toBeVisible();
    await expect(page.getByRole("contentinfo")).not.toContainText("253-530");

    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("filters the week by school and home games", async ({ page }) => {
    await page.goto("/");
    const week = page.locator("#week");
    await week.getByRole("button", { name: "Tides" }).click();
    await expect(week.getByRole("button", { name: "Tides" })).toHaveAttribute("aria-pressed", "true");
    await expect(week.getByText(/^6 games/)).toBeVisible();
    await expect(week.getByRole("listitem")).toHaveCount(6);
    await expect(week.getByRole("listitem").filter({ hasText: "Seahawks" })).toHaveCount(0);

    await week.getByRole("button", { name: "Both schools" }).click();
    await week.getByRole("button", { name: "Home games only" }).click();
    await expect(week.getByText(/^15 games/)).toBeVisible();
    await expect(week.getByRole("listitem")).toHaveCount(15);
    await expect(week.getByRole("listitem").filter({ hasText: /Away/ })).toHaveCount(0);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("adds a game to a calendar", async ({ page, request }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "Add to calendar: Football @ Central Kitsap, Fri, Oct 9" });
    const href = await link.getAttribute("href");
    const response = await request.get(href!);
    expect(response.headers()["content-type"]).toBe("text/calendar; charset=utf-8");
    const body = await response.text();
    expect(body).toContain("SUMMARY:Gig Harbor Football @ Central Kitsap");
    expect(body).toContain("DTSTART:20261010T020000Z");
  });

  test("the ticker can be paused, and stands still for reduced motion", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Pause scores" }).click();
    await expect(page.getByRole("button", { name: "Play scores" })).toHaveAttribute("aria-pressed", "true");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    const track = page.getByRole("region", { name: "Live scores and tonight's games" }).getByRole("list");
    expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
    await expect(page.getByRole("button", { name: "Pause scores" })).toBeHidden();
  });
});
