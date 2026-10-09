import { expect, test } from "@playwright/test";

import { cameraJpeg } from "../lib/photos/test-images";
import { axeViolations } from "./axe";
import { signInAs } from "./studio-helpers";

// Same in-memory server for every project, so album titles carry the project name.
test.describe.configure({ mode: "serial" });

test.describe("photos in the Studio", () => {
  test("a volunteer photographer's upload is held; the AD matches the game, describes, releases and publishes", async ({ page }, info) => {
    const title = `Lincoln road win (${info.project.name})`;
    const jpeg = await cameraJpeg({ width: 1200, height: 800, taken: "2026:10:02 19:45:00" });

    await signInAs(page, "[Dev] Volunteer Photographer");
    await page.getByRole("navigation", { name: "Studio" }).getByRole("link", { name: "Photos" }).click();
    await page.getByRole("link", { name: "New album" }).click();
    await page.getByRole("textbox", { name: "Album title" }).fill(title);
    await page.getByRole("button", { name: "Start the album" }).click();
    await expect(page.getByRole("status")).toContainText("Album started.");

    await page.getByLabel("Photos", { exact: true }).setInputFiles([
      { name: "one.jpg", mimeType: "image/jpeg", buffer: jpeg },
      { name: "two.jpg", mimeType: "image/jpeg", buffer: jpeg },
    ]);
    await page.getByRole("button", { name: "Upload" }).click();
    await expect(page.getByRole("status")).toContainText("Added 2 photos. Location data removed. They're held for the coach to review.");
    await expect(page.getByText("The head coach or an athletic director publishes this album.")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Publish/ })).toHaveCount(0);
    // Held photos are visible to the uploader in the Studio, through the media route.
    const thumb = page.getByRole("img", { name: "Photo 1, no description yet" });
    await expect(thumb).toBeVisible();
    const src = await thumb.getAttribute("src");
    expect((await page.request.get(src!)).headers()["content-type"]).toBe("image/webp");
    await thumb.scrollIntoViewIfNeeded();
    await expect.poll(() => thumb.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(480);
    expect(await axeViolations(page)).toEqual([]);
    const albumUrl = page.url().replace(/\?.*$/, "");

    // Signed out, a held photo isn't served.
    const anonymous = await page.context().browser()!.newContext();
    expect((await anonymous.request.get(new URL(src!, albumUrl).toString())).status()).toBe(404);
    await anonymous.close();

    await page.context().clearCookies();
    await signInAs(page, "[Dev] Gig Harbor AD");
    await page.goto(albumUrl);
    await expect(page.getByText("These photos were taken during")).toContainText("@ Lincoln, Fri, Oct 2");
    await page.getByRole("button", { name: "Use this game" }).click();
    await expect(page.getByRole("status")).toContainText("Game saved.");

    // Each action reloads the page; wait for it before the next one.
    await page.getByRole("button", { name: "Release photo 1" }).click();
    await expect(page.getByRole("button", { name: "Release photo 1" })).toHaveCount(0);
    await page.getByRole("button", { name: "Release photo 2" }).click();
    await expect(page.getByRole("button", { name: "Release photo 2" })).toHaveCount(0);
    await page.getByRole("button", { name: "Publish 2 photos" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Add an image description to every photo before publishing. 2 photos still need one." })).toBeVisible();

    await page.getByRole("textbox", { name: "Image description for photo 1" }).fill("A Tides receiver turns upfield after a catch at Lincoln.");
    await page.getByRole("button", { name: "Save the description for photo 1" }).click();
    await expect(page.getByRole("img", { name: "A Tides receiver turns upfield after a catch at Lincoln." })).toBeVisible();
    await page.getByRole("textbox", { name: "Image description for photo 2" }).fill("The Tides sideline cheers a late touchdown.");
    await page.getByRole("button", { name: "Save the description for photo 2" }).click();
    await expect(page.getByRole("img", { name: "The Tides sideline cheers a late touchdown." })).toBeVisible();
    await page.getByRole("button", { name: "Publish 2 photos" }).click();
    await expect(page.getByRole("status")).toContainText("Published to the team page and the school photo page.");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(`${title} · published`);
    await expect(page.getByRole("img", { name: "A Tides receiver turns upfield after a catch at Lincoln." })).toBeVisible();
    expect(await axeViolations(page)).toEqual([]);

    await page.goto("/studio/photos");
    await expect(page.getByRole("link", { name: new RegExp(title.replace(/[()]/g, "\\$&")) })).toContainText("Published");
    expect(await axeViolations(page)).toEqual([]);
  });

  test("coaches of other teams don't see other teams' albums", async ({ page }) => {
    await signInAs(page, "[Dev] Volleyball Coach", "/studio/photos");
    await expect(page.getByText("No albums yet.")).toBeVisible();
  });
});
