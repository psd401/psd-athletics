import { expect, test, type Page } from "@playwright/test";

import { cameraJpeg } from "../lib/photos/test-images";
import { axeViolations } from "./axe";
import { signInAs } from "./studio-helpers";

// Same in-memory server for every project, so album titles carry the project name.
test.describe.configure({ mode: "serial" });

async function publishAlbum(page: Page, title: string) {
  const jpeg = await cameraJpeg({ width: 1200, height: 800, taken: "2026:10:06 19:10:00" });
  await signInAs(page, "[Dev] Girls Soccer Coach", "/studio/photos/new");
  await page.getByRole("textbox", { name: "Album title" }).fill(title);
  await page.getByRole("button", { name: "Start the album" }).click();
  await expect(page.getByRole("status")).toContainText("Album started.");
  await page.getByLabel("Photos", { exact: true }).setInputFiles([
    { name: "one.jpg", mimeType: "image/jpeg", buffer: jpeg },
    { name: "two.jpg", mimeType: "image/jpeg", buffer: jpeg },
  ]);
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByRole("status")).toContainText("Added 2 photos.");
  for (const [n, text] of [
    [1, "Two Tides players celebrate a goal near the Capital bench."],
    [2, "The Tides keeper punches a corner kick clear."],
  ] as const) {
    await page.getByRole("textbox", { name: `Image description for photo ${n}` }).fill(text);
    await page.getByRole("button", { name: `Save the description for photo ${n}` }).click();
    await expect(page.getByRole("img", { name: text })).toBeVisible();
  }
  await page.getByRole("button", { name: "Publish 2 photos" }).click();
  await expect(page.getByRole("status")).toContainText("Published");
  await page.context().clearCookies();
}

test.describe("public photos", () => {
  test("families browse albums, open a photo, and report it; the AD restores it", async ({ page }, info) => {
    const title = `Shutout at Capital (${info.project.name})`;
    await publishAlbum(page, title);

    await page.goto("/ghh");
    // The masthead link (hidden behind the tab bar on phones).
    await expect(page.getByRole("navigation", { name: "Tides Athletics" }).getByRole("link", { name: "Photos", includeHidden: true })).toHaveAttribute("href", "/ghh/photos");
    await page.goto("/ghh/photos");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Tides photos");
    const filter = page.getByRole("navigation", { name: "Filter albums by team" });
    await filter.getByRole("link", { name: "Girls Soccer" }).click();
    await expect(filter.getByRole("link", { name: "Girls Soccer" })).toHaveAttribute("aria-current", "page");
    const card = page.getByRole("link", { name: new RegExp(title.replace(/[()]/g, "\\$&")) });
    await expect(card).toContainText("2 photos");
    expect(await axeViolations(page)).toEqual([]);

    await card.click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("link", { name: "Photo 1 of 2: Two Tides players celebrate a goal near the Capital bench." }).click();
    await expect(page.getByRole("img", { name: "Two Tides players celebrate a goal near the Capital bench." })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "About this photo" })).toContainText("Image description: Two Tides players celebrate");
    await expect(page.getByRole("link", { name: "Download full size" })).toHaveAttribute("href", /^\/media\/[0-9a-f-]{36}\/full$/);
    expect(await axeViolations(page)).toEqual([]);
    await page.getByRole("link", { name: "Next photo (2 of 2)" }).click();
    await expect(page.getByText("Photo 2 of 2")).toBeVisible();
    const photoUrl = page.url();
    const fullSrc = await page.getByRole("img", { name: "The Tides keeper punches a corner kick clear." }).getAttribute("src");

    await page.getByRole("textbox", { name: "Your email or phone" }).fill("parent@example.com");
    await page.getByRole("textbox", { name: "What's wrong with it?" }).fill("Please take this one down.");
    await page.getByRole("button", { name: "Report and hide this photo" }).click();
    await expect(page.getByRole("status")).toContainText("The photo is hidden while the athletics office takes a look.");
    expect((await page.request.get(fullSrc!)).status()).toBe(404);
    expect((await page.goto(photoUrl))?.status()).toBe(404);

    await page.goto("/ghh/teams/girls-soccer");
    await page.getByRole("tab", { name: "Photos" }).click();
    await expect(page.getByRole("tabpanel", { name: "Photos" }).getByRole("link", { name: new RegExp(title.replace(/[()]/g, "\\$&")) })).toContainText("1 photo");

    await signInAs(page, "[Dev] Gig Harbor AD", "/studio/photos");
    const decision = page.getByRole("region").filter({ hasText: `"${title}"` }).filter({ hasText: "Please take this one down." });
    await decision.getByRole("button", { name: "Restore it" }).click();
    await expect(page.getByRole("status")).toContainText("Photo restored to the site.");
    expect((await page.request.get(fullSrc!)).status()).toBe(200);
  });

  test("albums aren't found under the other school's address", async ({ page }) => {
    await page.goto("/ghh/photos");
    const href = await page.getByRole("link", { name: /Shutout at Capital/ }).first().getAttribute("href");
    expect((await page.request.get(href!.replace("/ghh/", "/phs/"))).status()).toBe(404);
    expect((await page.request.get("/ghh/photos/not-an-album")).status()).toBe(404);
  });
});
