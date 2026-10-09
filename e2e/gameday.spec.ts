import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

// Clock: Thu Oct 8 2026, 7:00 PM Pacific. Gig Harbor girls soccer hosts Mount Tahoma at 7:30.

test.describe("game-day page", () => {
  test("is reached from the tonight card and counts down", async ({ page }) => {
    await page.goto("/ghh");
    await page.getByRole("link", { name: "Game-day info" }).first().click();
    await expect(page).toHaveURL(/\/ghh\/game\/[0-9a-f-]{36}$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Tides vs\s*Mount Tahoma/);
    await expect(page.getByText("Game day · Tonight")).toBeVisible();
    await expect(page.getByRole("timer", { name: "Time until start" })).toContainText("Start in");
    await expect(page.getByRole("definition").first()).toHaveText("5–2");
    await expect(page.getByRole("link", { name: "Tickets on GoFan" })).toHaveAttribute("href", "https://gofan.co/app/school/WA23221");
    await expect(page.getByRole("heading", { name: "Know before you go" })).toBeVisible();
    await expect(page.getByRole("switch", { name: "Text me the final score" })).toBeDisabled();
    await expect(page.getByRole("heading", { name: "Up next" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("an away game has no venue tips, and a final shows the score", async ({ page }) => {
    await page.goto("/ghh/teams/football");
    const lincoln = page.getByRole("row", { name: /@ Lincoln/ });
    await expect(lincoln).toBeVisible();
    // The next game's card links to its game-day page.
    await page.getByRole("complementary", { name: "Team details" }).getByRole("link", { name: "Game-day info" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Tides at\s*Central Kitsap/);
    await expect(page.getByRole("heading", { name: "Know before you go" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Tickets on GoFan" })).toHaveCount(0);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("a game from another school's URL is not found", async ({ page, request }) => {
    await page.goto("/phs");
    const href = await page.getByRole("link", { name: "Game-day info" }).first().getAttribute("href");
    expect(href).toMatch(/^\/phs\/game\//);
    expect((await request.get(href!.replace("/phs/", "/ghh/"))).status()).toBe(404);
    expect((await request.get("/ghh/game/not-a-game")).status()).toBe(404);
  });
});
