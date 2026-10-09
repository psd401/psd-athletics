import { expect, test } from "@playwright/test";

import { axeViolations } from "./axe";
import { signInAs } from "./studio-helpers";

// Each test runs against the same in-memory server, so they use different teams or check what they add.
test.describe.configure({ mode: "serial" });

test.describe("editing a team page in the Studio", () => {
  test("a head coach posts a note, publishes a roster entry, and undoes the note", async ({ page }, info) => {
    const note = `Bus leaves at 4:15 (${info.project.name}).`;
    await signInAs(page, "[Dev] Girls Soccer Coach", "/studio/teams");
    await page.getByRole("link", { name: /Girls Soccer · Varsity/ }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Girls Soccer · Varsity");
    expect(await axeViolations(page)).toEqual([]);

    await page.getByRole("textbox", { name: "New note" }).fill(note);
    await page.getByRole("button", { name: "Post note" }).click();
    await expect(page.getByRole("status")).toContainText("Note posted to the team page.");

    await page.getByRole("textbox", { name: "Name" }).first().fill("Alex Rivera");
    await page.getByRole("button", { name: "Add to roster" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "first name and last initial" })).toBeVisible();

    const player = `Alex ${info.project.name === "phone" ? "P" : "D"}.`;
    await page.getByRole("textbox", { name: "Name" }).first().fill(player);
    await page.getByRole("textbox", { name: "Jersey" }).fill("9");
    await page.getByRole("button", { name: "Add to roster" }).click();
    await page.getByRole("button", { name: /^Publish \d+ entr/ }).click();
    await expect(page.getByRole("status")).toContainText("Published");

    await page.goto("/ghh/teams/girls-soccer");
    await expect(page.getByRole("complementary", { name: "Team details" })).toContainText(note);
    await page.getByRole("tab", { name: "Roster" }).click();
    await expect(page.getByRole("tabpanel", { name: "Roster" })).toContainText(player);

    await page.goto("/studio/activity");
    const row = page.getByRole("listitem").filter({ hasText: note }).filter({ hasText: "published a coach's note" });
    await row.getByRole("button", { name: "Undo" }).click();
    await expect(page.getByRole("listitem").filter({ hasText: "undid a change to a coach's note" }).first()).toBeVisible();
    await page.goto("/ghh/teams/girls-soccer");
    await expect(page.getByRole("complementary", { name: "Team details" })).not.toContainText(note);
  });

  test("a volunteer photographer can't open a team editor", async ({ page }) => {
    await signInAs(page, "[Dev] Volunteer Photographer");
    await expect(page.getByRole("navigation", { name: "Studio" }).getByRole("link", { name: "Team pages" })).toBeVisible();
    await page.goto("/studio/teams");
    await expect(page.getByText("You don't have a team assignment yet.")).toBeVisible();
  });
});
