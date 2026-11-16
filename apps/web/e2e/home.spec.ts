import { test, expect } from "@playwright/test";

test("home is a mind map: open a branch, then a node, and read it", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Abishek Kumar — Software Engineer", level: 1 })).toBeVisible();

  await page.getByRole("button", { name: /^Professional/ }).click();
  await page.getByRole("button", { name: /^Layer5/ }).click();
  await expect(page.getByRole("complementary", { name: "Details" }).getByRole("heading", { name: "Layer5", level: 2 })).toBeVisible();
});

test("a route deep-links into its branch", async ({ page }) => {
  await page.goto("/hall-of-fame");
  await expect(page.getByRole("complementary", { name: "Details" }).getByRole("heading", { name: "Hall of Fame", level: 2 })).toBeVisible();
  await page.getByRole("button", { name: /^Impact/ }).click();
  await expect(page.getByRole("button", { name: /50% faster incident recovery/ })).toBeVisible();
});

test("projects page lists published projects", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Projects", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "MeSpace", level: 3 })).toBeVisible();
});

test("workspace page switches between tabs", async ({ page }) => {
  await page.goto("/workspace");
  await expect(page.getByRole("heading", { name: "Workspace", level: 1 })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Tasks", selected: true })).toBeVisible();
  await page.getByRole("tab", { name: "Notes" }).click();
  await expect(page.getByRole("tab", { name: "Notes", selected: true })).toBeVisible();
});
