import { expect, test } from "@playwright/test";

import { cameraJpeg } from "../lib/photos/test-images";
import { axeViolations } from "./axe";
import { signInAs } from "./studio-helpers";

// Same in-memory server for every project, so post text carries the project name.
test.describe.configure({ mode: "serial" });

test.describe("team feed", () => {
  test("an assistant posts a note and a photo from the sideline; families see them; the post can be removed", async ({ page }, info) => {
    const note = `Bus leaves at 3:15 for Central Kitsap (${info.project.name}).`;
    const alt = `The Tides line warms up before kickoff (${info.project.name}).`;
    await signInAs(page, "[Dev] Football Assistant");
    await page.getByRole("navigation", { name: "Studio" }).getByRole("link", { name: "Post" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Post to Football");
    expect(await axeViolations(page)).toEqual([]);

    await page.getByRole("radio", { name: "Note" }).check();
    await page.getByRole("textbox", { name: "Words" }).fill(note);
    await page.getByRole("button", { name: "Post to the team feed" }).click();
    await expect(page.getByRole("status")).toContainText("Posted to the team feed.");

    await page.getByRole("radio", { name: "Score update" }).check();
    await page.getByRole("textbox", { name: "Words" }).fill("Halftime: 14–7.");
    await page.getByRole("button", { name: "Post to the team feed" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Pick the game this score is from." })).toBeVisible();

    const jpeg = await cameraJpeg({ width: 1200, height: 800 });
    await page.getByRole("radio", { name: "Photos" }).check();
    await page.getByLabel("Photo 1", { exact: true }).setInputFiles({ name: "warmup.jpg", mimeType: "image/jpeg", buffer: jpeg });
    await page.getByRole("button", { name: "Post to the team feed" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Every photo needs an image description." })).toBeVisible();
    await page.getByLabel("Photo 1", { exact: true }).setInputFiles({ name: "warmup.jpg", mimeType: "image/jpeg", buffer: jpeg });
    await page.getByRole("textbox", { name: "Image description for photo 1" }).fill(alt);
    await page.getByRole("button", { name: "Post to the team feed" }).click();
    await expect(page.getByRole("status")).toContainText("Posted to the team feed.");

    await page.context().clearCookies();
    await page.goto("/ghh/feed");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tides feed");
    await page.getByRole("navigation", { name: "Filter posts by team" }).getByRole("link", { name: "Football" }).click();
    const notePost = page.getByRole("article").filter({ hasText: note });
    await expect(notePost).toContainText("Note");
    await expect(notePost.getByRole("link", { name: "Football · Varsity" })).toHaveAttribute("href", "/ghh/teams/football");
    await expect(page.getByRole("article").getByRole("img", { name: alt })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);

    await page.goto("/ghh/teams/football");
    await page.getByRole("tab", { name: "News" }).click();
    await expect(page.getByRole("tabpanel", { name: "News" })).toContainText(note);
    await page.goto("/ghh/photos");
    await expect(page.getByRole("region", { name: "From the sidelines" })).toBeVisible();

    await signInAs(page, "[Dev] Football Assistant", "/studio/post");
    await page.getByRole("button", { name: `Remove the post "${note.slice(0, 40)}"` }).click();
    await expect(page.getByRole("status")).toContainText("Post removed from the feed.");
    await page.goto("/ghh/feed");
    await expect(page.getByRole("article").filter({ hasText: note })).toHaveCount(0);
  });

  test("volunteer photographers don't post to the feed", async ({ page }) => {
    await signInAs(page, "[Dev] Volunteer Photographer");
    await expect(page.getByRole("navigation", { name: "Studio" }).getByRole("link", { name: "Post" })).toHaveCount(0);
    expect((await page.goto("/studio/post"))?.status()).toBe(404);
  });
});
