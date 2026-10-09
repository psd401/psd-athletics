import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";
import { signInAs } from "./studio-helpers";

// Clock: Thu Oct 8 2026, 7:00 PM Pacific. Gig Harbor girls soccer hosts Mount Tahoma at 7:30.

test.describe("Athletics Studio", () => {
  test("a head coach's Today shows tonight's game and their team, and passes axe", async ({ page }) => {
    await signInAs(page, "[Dev] Girls Soccer Coach");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tonight vs Mount Tahoma");
    await expect(page.getByText("Girls Soccer · Varsity").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Coming up" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Team page checklist" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Studio" }).getByRole("link", { name: "Today" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("contentinfo")).toContainText("Nothing publishes until you approve it");
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("the activity log starts empty and passes axe", async ({ page }) => {
    await signInAs(page, "[Dev] Gig Harbor AD", "/studio/activity");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Activity");
    expect(await axeViolations(page)).toEqual([]);
  });

  test("signing out ends the session", async ({ page }) => {
    await signInAs(page, "[Dev] Volleyball Coach");
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL(/\/sign-in/);
    await page.goto("/studio");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fstudio/);
  });
});
