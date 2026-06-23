import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Fill in login credentials
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'admin123');
  
  // Click login button
  await page.click('button:has-text("Login")');
  
  // Wait for navigation to dashboard
  await expect(page).toHaveURL('http://localhost:5173/dashboard');
});

test('invalid login shows error', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Fill in invalid credentials
  await page.fill('input[name="username"]', 'invalid');
  await page.fill('input[name="password"]', 'wrongpassword');
  
  // Click login button
  await page.click('button:has-text("Login")');
  
  // Check for error message
  const errorMessage = page.locator('[role="alert"]');
  await expect(errorMessage).toContainText('Invalid username or password');
});

test('empty fields shows validation error', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Click login button without entering credentials
  await page.click('button:has-text("Login")');
  
  // Check for validation error
  const errorMessage = page.locator('[role="alert"]');
  await expect(errorMessage).toContainText('Please fill out both');
});

test('dark mode toggle works', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Get initial mode
  const darkModeSwitch = page.locator('input[type="checkbox"][aria-label="Toggle dark mode"]');
  const initialState = await darkModeSwitch.isChecked();
  
  // Click to toggle
  await darkModeSwitch.click();
  
  // Verify state changed
  const newState = await darkModeSwitch.isChecked();
  expect(newState).toBe(!initialState);
});

test('language dropdown changes language', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Get language select
  const languageSelect = page.locator('input[role="combobox"]').first();
  
  // Click to open dropdown
  await languageSelect.click();
  
  // Select different language
  await page.click('li[data-value="ja"]');
  
  // Verify language changed
  await expect(languageSelect).toHaveValue('ja');
});
