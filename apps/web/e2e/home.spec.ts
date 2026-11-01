import { test, expect } from "@playwright/test";

test("home page shows the hero", async ({ page }) => {
  await page.goto("/");

  // The visible name is split-animated and aria-hidden; the sr-only text
  // carries the accessible h1 name for SEO/screen readers.
  await expect(page.getByRole("heading", { name: "Abishek Kumar — Software Engineer", level: 1 })).toBeAttached();
  await expect(page.getByRole("link", { name: /Say hello/ })).toBeVisible();
  await expect(page.getByTestId("health-status-badge")).toContainText("API status: ok");
});

test("projects page lists published projects", async ({ page }) => {
  await page.goto("/projects");

  await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "MeSpace", level: 3 })).toBeVisible();
});

test("about page shows expertise", async ({ page }) => {
  await page.goto("/resume");

  await expect(page.getByRole("heading", { name: "Expertise", level: 2 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI infrastructure", level: 3 })).toBeVisible();
});

test("workspace page switches between tabs", async ({ page }) => {
  await page.goto("/workspace");

  await expect(page.getByRole("heading", { name: "Workspace", level: 1 })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Tasks", selected: true })).toBeVisible();

  await page.getByRole("tab", { name: "Notes" }).click();
  await expect(page.getByRole("tab", { name: "Notes", selected: true })).toBeVisible();
});
