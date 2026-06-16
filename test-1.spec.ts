import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('rp%3DEgZjaHJvbWUyBggAEEUYOdIBCTE0NDc3ajBqMqgCALACAQ%26sourceid%3Dchrome%26ie%3DUTF-8%26sei%3DoYUiauWsAdCYseMPqpGgwAc&q=EgRn6c9iGKGLitEGIjBx6NKImawT2KRXn56S72d42tb3Gb3qW-0xmLRnWywFHa4WVaEUkgW0fQeyF_sFzvgyAVJaAUM');
  await page.locator('iframe[name="a-wukgz5lcc2i"]').contentFrame().getByRole('checkbox', { name: 'I\'m not a robot' }).click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().locator('[id="4"]').click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().locator('[id="5"]').click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().locator('[id="0"]').click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().locator('[id="2"]').click();
  await page.locator('iframe[name="c-wukgz5lcc2i"]').contentFrame().getByRole('button', { name: 'Verify' }).click();
  await page.getByRole('link', { name: 'Installation' }).click();
  await page.getByRole('tab', { name: 'yarn' }).first().click();
  await page.getByRole('link', { name: 'VS Code', exact: true }).click();
  await page.getByRole('link', { name: 'Agents' }).click();
  await page.getByRole('link', { name: 'Trace viewer' }).first().click();
  await page.getByRole('link', { name: 'Setting up CI', exact: true }).click();
  await page.getByRole('link', { name: 'Agents' }).click();
  await page.getByRole('link', { name: 'Annotations', exact: true }).click();
  await page.getByRole('link', { name: 'Command line', exact: true }).click();
  await page.getByRole('link', { name: 'Command line', exact: true }).click();
});