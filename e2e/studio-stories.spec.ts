import { expect, test } from "@playwright/test";

import { axeViolations } from "./axe";
import { signInAs } from "./studio-helpers";

// Same in-memory server for every project, so titles carry the project name.
test.describe.configure({ mode: "serial" });

test.describe("stories in the Studio", () => {
  test("a head coach starts a recap from a final, publishes it, and unpublishes it", async ({ page }, info) => {
    const title = `Tides take the road win (${info.project.name})`;
    // One team, so the Studio skips the team picker.
    await signInAs(page, "[Dev] Girls Soccer Coach", "/studio/stories/new");
    await expect(page.getByRole("heading", { level: 2, name: "Girls Soccer · Varsity" })).toBeVisible();
    await page.getByRole("link", { name: /^@ Capital, 2–0/ }).first().click();
    await expect(page.getByRole("textbox", { name: "Story" })).toHaveValue(/^Gig Harbor (beat|fell to|tied) /);
    expect(await axeViolations(page)).toEqual([]);

    await page.getByRole("textbox", { name: "Title" }).fill(title);
    await page.getByRole("textbox", { name: /^Summary/ }).fill("A clean sheet on the road.");
    await page.getByRole("button", { name: /Save draft/ }).click();
    await expect(page.getByRole("status")).toContainText("Draft saved.");

    // A draft isn't on the site.
    await page.goto("/ghh");
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);

    await page.goBack();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByRole("status")).toContainText("Published to the team page and school home.");
    expect(await axeViolations(page)).toEqual([]);

    await page.goto("/ghh");
    await page.getByRole("region", { name: "Stories" }).getByRole("link", { name: title }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page).toHaveTitle(`${title} · Tides Athletics`);
    await expect(page.getByRole("main")).toContainText("A clean sheet on the road.");
    expect(await axeViolations(page)).toEqual([]);

    await page.goto("/ghh/teams/girls-soccer");
    await page.getByRole("tab", { name: "News" }).click();
    await expect(page.getByRole("tabpanel", { name: "News" }).getByRole("link", { name: title })).toBeVisible();

    await page.goto("/studio/stories");
    await page.getByRole("link", { name: title }).click();
    await page.getByRole("button", { name: "Unpublish" }).click();
    await expect(page.getByRole("status")).toContainText("It's a draft again.");
    const response = await page.goto(`/ghh`);
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole("link", { name: title })).toHaveCount(0);
  });

  test("an assistant coach can draft but not publish", async ({ page }, info) => {
    const title = `Practice moves to the stadium (${info.project.name})`;
    await signInAs(page, "[Dev] Football Assistant", "/studio/stories/new");
    await expect(page.getByRole("heading", { level: 2, name: "Football · Varsity" })).toBeVisible();
    await page.getByRole("textbox", { name: "Title" }).fill(title);
    await page.getByRole("textbox", { name: "Story" }).fill("Thursday practice is at the stadium this week.");
    await page.getByRole("button", { name: /Save draft/ }).click();
    await expect(page.getByRole("status")).toContainText("Draft saved.");
    await expect(page.getByRole("button", { name: "Publish" })).toHaveCount(0);
    await expect(page.getByText("The head coach or an athletic director publishes this story.")).toBeVisible();
  });
});
