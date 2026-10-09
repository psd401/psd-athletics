import { expect, type Page } from "@playwright/test";

/** Sign in as one of the made-up dev people (lib/auth/dev.ts). */
export async function signInAs(page: Page, name: string, next = "/studio") {
  await page.goto(`/sign-in?next=${encodeURIComponent(next)}`);
  await page.getByRole("button", { name }).click();
  await expect(page).toHaveURL(new RegExp(`${next.replace(/\//g, "\\/")}$`));
}
