import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www.google.com/');
  await page.getByRole('combobox', { name: 'ရှာဖွေခြင်း' }).click();
  await page.getByRole('combobox', { name: 'ရှာဖွေခြင်း' }).fill('playwri');
  await page.getByRole('combobox', { name: 'ရှာဖွေခြင်း' }).press('ArrowDown');
  await page.locator('iframe[name="a-ln7czrh1lt6n"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-ln7czrh1lt6n"]').contentFrame().locator('[id="1"]').click();
  await page.locator('iframe[name="c-ln7czrh1lt6n"]').contentFrame().locator('[id="7"]').click();
  await page.locator('iframe[name="c-ln7czrh1lt6n"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-ln7czrh1lt6n"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-ln7czrh1lt6n"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-ln7czrh1lt6n"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
});