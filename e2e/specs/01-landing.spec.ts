import { test, expect } from '@playwright/test';

import { installCursorOverlay, pause, setCaption } from '../helpers/recording';

test('landing page walkthrough', async ({ page }, testInfo) => {
  await installCursorOverlay(page);
  await page.goto('/');
  await setCaption(page, 'Landing page overview');
  await page.waitForLoadState('networkidle');
  await pause(page, 1200);

  await expect(page.getByRole('heading', { name: /Never drive home/i })).toBeVisible();
  await expect(page.locator('body')).toContainText('TruckSaathi');

  await setCaption(page, 'Savings calculator');
  const ranges = page.locator('input[type="range"]');
  await expect(ranges).toHaveCount(3);
  await ranges.nth(0).evaluate((el) => {
    const input = el as HTMLInputElement;
    input.value = '20';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await ranges.nth(1).evaluate((el) => {
    const input = el as HTMLInputElement;
    input.value = '8';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await ranges.nth(2).evaluate((el) => {
    const input = el as HTMLInputElement;
    input.value = '55';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await pause(page, 800);

  await setCaption(page, 'Language toggle');
  await page.locator('button:has-text("हिं")').click();
  await pause(page, 700);
  await page.locator('button:has-text("EN")').click();
  await pause(page, 700);

  await setCaption(page, 'Demo request form');
  await page.locator('input[name="name"]').fill('Aisha Kumar');
  await page.locator('input[name="phone"]').fill('9876500010');
  await page.locator('select[name="fleet"]').selectOption({ index: 1 });
  await page.locator('input[name="city"]').fill('Delhi');
  await page.locator('form.demo-form button').click();
  await expect(page.getByText(/Your sample request is ready/i)).toBeVisible({ timeout: 15000 });
  await pause(page, 1000);

  await setCaption(page, 'Open app');
  await page.getByRole('link', { name: /TruckSaathi landing page/i }).click({ force: true });
  await expect(page).toHaveURL(/\/app/);
  await pause(page, 1500);

  await testInfo.attach('flow-01-landing-check', { path: await page.screenshot({ path: 'e2e/artifacts/01-landing.png', fullPage: true }) });
});
