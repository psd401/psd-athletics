import { expect, test } from "@playwright/test";

import { axeViolations } from "./axe";

// Same in-memory server for every project, so contacts carry the project name.
test.describe.configure({ mode: "serial" });

test.describe("alerts", () => {
  test("a family follows a team from the school home with a code", async ({ page }, info) => {
    const email = `fan-${info.project.name}@example.com`;
    await page.goto("/ghh#alerts");
    const form = page.getByRole("form", { name: /Know the moment a game moves/ });
    await form.getByRole("combobox", { name: "Team" }).selectOption({ label: "Girls Soccer · Varsity" });
    await form.getByRole("textbox", { name: "Email or mobile number" }).fill(email);
    await form.getByRole("checkbox", { name: "Final scores" }).check();
    await form.getByRole("button", { name: "Start alerts" }).click();

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check your messages");
    await expect(page.getByRole("main")).toContainText(`We sent a six-digit code to f••@example.com`);
    await expect(page.getByRole("main")).not.toContainText(email);
    expect(await axeViolations(page)).toEqual([]);
    const code = /code is (\d{6})/.exec((await page.getByText("Local development: nothing was sent.").textContent()) ?? "")![1]!;

    await page.getByRole("textbox", { name: "Code" }).fill(code === "000000" ? "111111" : "000000");
    await page.getByRole("button", { name: "Start alerts" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "That code doesn't match." })).toBeVisible();
    await page.getByRole("textbox", { name: "Code" }).fill(code);
    await page.getByRole("button", { name: "Start alerts" }).click();
    await expect(page.getByRole("status")).toContainText("Gig Harbor Girls Soccer · Varsity. Messages go to f••@example.com.");
    expect(await axeViolations(page)).toEqual([]);
  });

  test("a bad contact comes back with the team still chosen", async ({ page }) => {
    await page.goto("/");
    const form = page.getByRole("form", { name: /You'll know first/ });
    await form.getByRole("combobox", { name: "Team" }).selectOption({ label: "Peninsula · Volleyball · Varsity" });
    await form.getByRole("textbox", { name: "Email or mobile number" }).fill("555-0123");
    await form.getByRole("button", { name: "Start alerts" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Enter a US mobile number or an email address." })).toBeVisible();
    await expect(page.getByRole("combobox", { name: "Team" })).toHaveValue(/[0-9a-f-]{36}/);
    expect(await axeViolations(page)).toEqual([]);
  });

  test("a stop link needs a button press, and a forged one doesn't work", async ({ page }) => {
    await page.goto("/alerts/stop?f=00000000-0000-0000-0000-000000000000&t=forged");
    await expect(page.getByText("This stops every team you follow")).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("button", { name: "Stop all alerts" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "That stop link didn't work." })).toBeVisible();
  });
});
