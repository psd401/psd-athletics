import { expect, test } from "@playwright/test";

import { axeViolations } from "./axe";
import { signInAs } from "./studio-helpers";

// Same in-memory server for every project, so emails carry the project name.
test.describe.configure({ mode: "serial" });

test.describe("people and roles", () => {
  test("a school AD adds a coach, exports the access list, and removes them", async ({ page }, info) => {
    const email = `winter.coach.${info.project.name}@psd401.net`;
    const name = `Winter Coach ${info.project.name}`;
    await signInAs(page, "[Dev] Gig Harbor AD");
    await page.getByRole("navigation", { name: "Studio" }).getByRole("link", { name: "People and roles" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("People and roles");
    await expect(page.getByRole("table", { name: "What each role can do" })).toContainText("Volunteer photographer");
    expect(await axeViolations(page)).toEqual([]);

    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("textbox", { name: "District email" }).fill("winter@gmail.com");
    await page.getByRole("combobox", { name: "Role" }).selectOption({ label: "Head coach" });
    await page.getByRole("combobox", { name: /^Team/ }).selectOption({ label: "Gig Harbor · Girls Soccer · Varsity" });
    await page.getByRole("button", { name: "Add person" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Use their psd401.net Google account." })).toBeVisible();

    await page.getByRole("textbox", { name: "Name" }).fill(name);
    await page.getByRole("textbox", { name: "District email" }).fill(email);
    await page.getByRole("combobox", { name: "Role" }).selectOption({ label: "Head coach" });
    await page.getByRole("combobox", { name: /^Team/ }).selectOption({ label: "Gig Harbor · Girls Soccer · Varsity" });
    await page.getByRole("button", { name: "Add person" }).click();
    await expect(page.getByRole("status")).toContainText(`Added ${name} as head coach.`);
    const row = page.getByRole("row").filter({ hasText: email });
    await expect(row).toContainText("Gig Harbor · Girls Soccer · Varsity");
    await expect(row).toContainText("Invited");

    const csv = await (await page.request.get("/studio/people/export")).text();
    expect(csv.split("\r\n")[0]).toBe("Name,Email,Role,School and team,Starts,Ends,Status");
    expect(csv).toContain(`${name},${email},Head coach,Gig Harbor · Girls Soccer · Varsity`);

    await row.getByRole("button", { name: `End ${name}'s head coach role` }).click();
    await expect(page.getByRole("status")).toContainText("Removed before it started.");
    await expect(page.getByRole("row").filter({ hasText: email })).toHaveCount(0);

    await page.goto("/studio/activity");
    await expect(page.getByRole("listitem").filter({ hasText: `${name} · Head coach` }).filter({ hasText: "removed a role" })).toBeVisible();
  });

  test("a secretary invites coaches and photographers but not other staff", async ({ page }) => {
    await signInAs(page, "[Dev] Gig Harbor Secretary", "/studio/people");
    const roles = await page.getByRole("combobox", { name: "Role" }).locator("option").allTextContents();
    expect(roles).toEqual(["Pick a role", "Head coach", "Assistant coach", "Volunteer photographer"]);
    await expect(page.getByRole("navigation", { name: "School" })).toHaveCount(0);
  });

  test("coaches don't see people and roles", async ({ page }) => {
    await signInAs(page, "[Dev] Girls Soccer Coach");
    await expect(page.getByRole("navigation", { name: "Studio" }).getByRole("link", { name: "People and roles" })).toHaveCount(0);
    const response = await page.goto("/studio/people");
    expect(response?.status()).toBe(404);
    expect((await page.request.get("/studio/people/export")).status()).toBe(404);
  });
});
