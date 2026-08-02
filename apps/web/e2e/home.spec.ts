import { test, expect } from "@playwright/test";

test("home page shows MeSpace heading and ok health status", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "MeSpace" })).toBeVisible();
  await expect(page.getByTestId("health-status-badge")).toHaveText("API status: ok");
});
