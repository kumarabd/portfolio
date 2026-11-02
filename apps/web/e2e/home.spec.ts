import { test, expect } from "@playwright/test";

test("home is a hub with the three worlds as links", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Abishek Kumar — Software Engineer", level: 1 })).toBeVisible();
  for (const [name, href] of [["Professional", "/professional"], ["Hobby", "/hobby"], ["Hall of Fame", "/hall-of-fame"]]) {
    await expect(page.getByRole("navigation", { name: "Worlds" }).getByRole("link", { name: new RegExp(name) })).toHaveAttribute("href", new RegExp(href));
  }
});

test("a world is a single frame with its own navigation", async ({ page }) => {
  await page.goto("/professional");

  await expect(page.getByRole("heading", { name: /Professional/, level: 1 })).toBeAttached();
  const nav = page.getByRole("complementary", { name: /Professional sections/ });
  await expect(nav.getByRole("button", { name: "Layer5" })).toBeVisible();
  await nav.getByRole("button", { name: "Layer5" }).click();
  await expect(page.getByRole("heading", { name: "Layer5", level: 2 })).toBeVisible();
});

test("hall of fame steps through schools, impact and more", async ({ page }) => {
  await page.goto("/hall-of-fame");

  await expect(page.getByRole("heading", { name: "Schools", level: 2 })).toBeVisible();
  await page.getByRole("button", { name: "Impact" }).click();
  await expect(page.getByRole("heading", { name: "Impact", level: 2 })).toBeVisible();
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
