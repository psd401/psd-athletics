import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

test.describe("school schedule", () => {
  test("lists the season, filters it, and keeps the filters in the URL", async ({ page }) => {
    await page.goto("/phs/schedule");
    await expect(page).toHaveTitle("Schedule · Seahawks Athletics");
    // The masthead nav is hidden on phones, so check the markup rather than visibility.
    await expect(page.locator('a[aria-current="page"]')).toHaveText("Schedule");
    await expect(page.getByText("27 of 27 games")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);

    const sport = page.getByRole("group", { name: "Sport" });
    await sport.getByRole("button", { name: "Football" }).click();
    await page.getByRole("group", { name: "Where" }).getByRole("button", { name: "Home" }).click();
    await expect(page.getByText("6 of 27 games")).toBeVisible();
    await expect(page).toHaveURL(/\/phs\/schedule\?sport=football&where=home$/);

    // The subscribe links follow the filters.
    await expect(page.getByRole("link", { name: "Google Calendar" })).toHaveAttribute("href", /phs\.ics%3Fsport%3Dfootball%26where%3Dhome/);
    await expect(page.getByText("Subscribe to what you filter: Seahawks · Football · Home")).toBeVisible();

    await page.reload();
    await expect(page.getByText("6 of 27 games")).toBeVisible();
    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByText("27 of 27 games")).toBeVisible();
  });

  test("searches opponents", async ({ page }) => {
    await page.goto("/phs/schedule");
    await page.getByRole("searchbox", { name: "Search" }).fill("capital");
    await expect(page.getByText("4 of 27 games")).toBeVisible();
    await page.getByRole("searchbox", { name: "Search" }).fill("nobody");
    await expect(page.getByText("No games match those filters.")).toBeVisible();
  });

  test("month view is a table per month and passes axe", async ({ page }) => {
    await page.goto("/ghh/schedule?view=month");
    await expect(page.getByRole("heading", { name: "October 2026" })).toBeVisible();
    const october = page.getByRole("table", { name: "October 2026 games" });
    await expect(october.getByRole("columnheader")).toHaveCount(7);
    await expect(october.locator('td[aria-current="date"]')).toContainText("8");
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("serves the filtered view as a calendar feed", async ({ request }) => {
    const response = await request.get("/api/calendar/phs.ics?sport=football&level=varsity");
    expect(response.headers()["content-type"]).toBe("text/calendar; charset=utf-8");
    const body = await response.text();
    expect(body).toContain("X-WR-CALNAME:Seahawks · Football · Varsity");
    expect(body.match(/BEGIN:VEVENT/g)).toHaveLength(8);
    expect((await request.get("/api/calendar/elsewhere.ics")).status()).toBe(404);

    // A filter that matches nothing still names the sport.
    const empty = await (await request.get("/api/calendar/phs.ics?sport=football&level=c_team")).text();
    expect(empty).toContain("X-WR-CALNAME:Seahawks · Football · C-team");
    expect(empty).not.toContain("BEGIN:VEVENT");
  });
});
