import { test, expect } from "@playwright/test";

test("home is a game that starts from a realm choice", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Abishek Kumar — Software Engineer", level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: /Say hello/ })).toBeVisible();
  for (const realm of ["Professional", "Hobby", "Hall of Fame"]) {
    await expect(page.getByRole("button", { name: new RegExp(realm) })).toBeVisible();
  }

  await page.getByRole("button", { name: /Professional/ }).click();
  await expect(page.getByText(/Unlocked 0\/\d+/)).toBeVisible();
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
