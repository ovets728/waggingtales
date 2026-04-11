import { test, expect } from '@playwright/test';

test.describe('Stripe Upgrade Route Protection', () => {
  test('redirects unauthenticated users from /dashboard/upgrade to /login', async ({ page }) => {
    await page.goto('/dashboard/upgrade');

    // Middleware should redirect unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects unauthenticated users from /dashboard/upgrade/success to /login', async ({ page }) => {
    await page.goto('/dashboard/upgrade/success');

    // Middleware should redirect unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
