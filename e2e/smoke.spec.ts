import { expect, test } from "@playwright/test";

import { axeViolations, hasHorizontalScroll } from "./axe";

test.describe("public site", () => {
  test("home page renders and passes axe", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });
});

test.describe("Athletics Studio", () => {
  test("sends signed-out visitors to sign-in", async ({ page }) => {
    await page.goto("/studio");
    await expect(page).toHaveURL(/\/sign-in\?next=%2Fstudio|\/sign-in\?next=\/studio/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("sign-in page explains a missing Google client and passes axe", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeDisabled();
    await expect(page.getByRole("status")).toContainText("Sign-in isn't set up on this server yet");
    expect(await axeViolations(page)).toEqual([]);
    expect(await hasHorizontalScroll(page)).toBe(false);
  });

  test("sign-in errors are announced", async ({ page }) => {
    await page.goto("/sign-in?error=district_account_required");
    // Next.js adds its own empty route-announcer alert, so match ours by text.
    await expect(page.getByRole("alert").filter({ hasText: "isn't a psd401.net account" })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
  });
});
