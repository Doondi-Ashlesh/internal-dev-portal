import path from "node:path";
import { mkdir } from "node:fs/promises";
import { expect, test as setup } from "@playwright/test";

const authFile = path.join(__dirname, "..", "..", "playwright", ".auth", "demo-user.json");

setup("authenticate demo workspace", async ({ page }) => {
  await mkdir(path.dirname(authFile), { recursive: true });

  await page.goto("/login");

  if (!page.url().endsWith("/dashboard")) {
    await page.getByRole("button", { name: "Enter demo workspace" }).click();
  }

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Foundry Labs")).toBeVisible();

  await page.context().storageState({ path: authFile });
});