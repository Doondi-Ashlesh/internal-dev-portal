import path from "node:path";
import { mkdir } from "node:fs/promises";
import { expect, test as setup } from "@playwright/test";

const authFile = path.join(__dirname, "..", "..", "playwright", ".auth", "demo-user.json");

setup("authenticate demo workspace", async ({ page }) => {
  expect(process.env.ENABLE_DEMO_AUTH, "Playwright demo auth setup requires ENABLE_DEMO_AUTH=1 in the test runtime.").toBe("1");
  await mkdir(path.dirname(authFile), { recursive: true });

  await page.goto("/login");

  if (!page.url().endsWith("/dashboard")) {
    await page.getByRole("button", { name: "Enter demo workspace" }).click();
  }

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByText("Foundry Labs")).toBeVisible();

  await page.context().storageState({ path: authFile });
});
