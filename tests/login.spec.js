import { test, expect } from "@playwright/test";

test("login success", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");

  await page.click("button");

  await expect(page).toHaveURL(/dashboard/);
});

test("validation error", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.click("button");

  await expect(page.locator("text=All fields required")).toBeVisible();
});

test("invalid login", async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.fill('input[name="username"]', "wrong");
  await page.fill('input[name="password"]', "123");

  await page.click("button");

  await expect(page.locator("text=Invalid credentials")).toBeVisible();
});