import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");

  await page.fill('input[name="username"]', "test");
  await page.fill('input[name="password"]', "123");

  await page.getByRole("button", { name: /login/i }).click();

  console.log(await page.url());

  // ✅ now go to users page
  await page.goto("http://localhost:5173/users");

});

test("add user", async ({ page }) => {

  const username = "testuser_" + Date.now(); 

  // ✅ open modal
  await page.getByRole("button", { name: /add user/i }).click();

  // ✅ fill form
  await page.getByLabel("Username").fill(username);
  await page.getByLabel("Password").fill("123");

  // ✅ click create
  await page.getByRole("button", { name: "Create" }).click();

  // ✅ verify user appears
  await expect(page.locator(`text=${username}`)).toBeVisible();
});

test("edit user", async ({ page }) => {
  await page.getByRole("button", { name: "Edit" }).first().click();

  const newName = "updatedUser";

  await page.getByLabel("Username").fill(newName);

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.locator(`text=${newName}`)).toBeVisible();
});

test("delete user", async ({ page }) => {
  const row = page.locator("table tbody tr").first();

  const username = await row.locator("td").nth(2).textContent();

  // click delete and confirm
  await row.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete" }).click();

  // verify removed
  await expect(
    page.locator(`text=${username}`)
  ).not.toBeVisible();
});

test("search user", async ({ page }) => {
  await page.getByLabel("Search user").fill("admin");

  await expect(page.locator("text=admin")).toBeVisible();
});

test("pagination next", async ({ page }) => {
  const nextBtn = page.getByRole("button", { name: "Next" });

  if (await nextBtn.isEnabled()) {
    await nextBtn.click();
  }

  await expect(page.locator("text=Page")).toBeVisible();
});