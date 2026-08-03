import { test, expect } from "@playwright/test";

test("home page shows the terminal hero", async ({ page }) => {
  await page.goto("/");

  // The visible identity line lives inside the typed terminal window; the
  // sr-only h1 carries the accessible name for SEO/screen readers.
  await expect(page.getByRole("heading", { name: "Abishek Kumar — Software Engineer", level: 1 })).toBeAttached();
  await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();
  await expect(page.getByTestId("health-status-badge")).toContainText("API status: ok");
});

test("projects page lists published projects", async ({ page }) => {
  await page.goto("/projects");

  await expect(page.getByRole("heading", { name: "$ ls ~/projects", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "MeSpace", level: 3 })).toBeVisible();
});

test("resume page shows work history", async ({ page }) => {
  await page.goto("/resume");

  await expect(page.getByRole("heading", { name: "# experience", level: 2 })).toBeVisible();
  await expect(page.getByText("Northwind Systems")).toBeVisible();
});

test("workspace page switches between tabs", async ({ page }) => {
  await page.goto("/workspace");

  await expect(page.getByRole("heading", { name: "Workspace", level: 1 })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Tasks", selected: true })).toBeVisible();

  await page.getByRole("tab", { name: "Notes" }).click();
  await expect(page.getByRole("tab", { name: "Notes", selected: true })).toBeVisible();
});
