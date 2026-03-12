import { expect, test } from "@playwright/test";

test.describe("authenticated smoke flows", () => {
  test("renders the seeded dashboard workspace", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByText("Foundry Labs")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Operational hotspots" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fresh updates" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Billing API", exact: true })).toBeVisible();
  });

  test("global search navigates to a seeded service detail page", async ({ page }) => {
    await page.goto("/dashboard");

    const searchTrigger = page.getByRole("button", { name: /Search services, docs, runbooks, owners/i });
    await expect(searchTrigger).toHaveAttribute("data-ready", "true");
    await searchTrigger.click();

    const input = page.getByLabel("Global search input");
    await expect(input).toBeVisible();
    await input.fill("Billing API");

    const result = page.locator(".search-result").filter({ hasText: "Billing API" }).first();
    await expect(result).toBeVisible();
    await result.click();

    await expect(page).toHaveURL(/\/services\/billing-api$/);
    await expect(page.getByRole("heading", { name: "Billing API" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open primary repository" })).toBeVisible();
  });

  test("catalog supports creating and deleting a temporary service", async ({ page }) => {
    const suffix = Date.now();
    const serviceName = `Smoke Service ${suffix}`;
    const serviceSlug = `smoke-service-${suffix}`;

    await page.goto("/catalog");

    const createCard = page.locator("article").filter({ hasText: "Create service" }).first();
    await createCard.getByPlaceholder("Service name").fill(serviceName);
    await createCard.getByPlaceholder("service-slug").fill(serviceSlug);
    await createCard.getByPlaceholder("Short description").fill("Temporary service created by the Playwright smoke suite.");
    await createCard.getByRole("button", { name: "Create service" }).click();

    const adminCard = page
      .locator("article")
      .filter({ hasText: serviceName })
      .filter({ has: page.getByRole("button", { name: "Delete service" }) })
      .first();

    await expect(adminCard).toBeVisible({ timeout: 15_000 });
    await adminCard.getByRole("button", { name: "Delete service" }).click();

    await expect(page.locator("article").filter({ hasText: serviceName })).toHaveCount(0, { timeout: 15_000 });
  });

  test("docs page renders seeded documents and management tools", async ({ page }) => {
    await page.goto("/docs");

    await expect(page.getByRole("heading", { name: "Docs, runbooks, and announcements" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Edge Gateway Runbook", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Q2 Incident Review Template", exact: true })).toBeVisible();
    await expect(page.locator("article").filter({ hasText: "Create document" }).first()).toBeVisible();
  });
});