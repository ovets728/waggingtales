import { test, expect } from '@playwright/test';

test.describe('Admin Route Protection', () => {
  test('redirects unauthenticated users from /admin to /login', async ({ page }) => {
    await page.goto('/admin');

    // Middleware should redirect unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('redirects unauthenticated users from /admin/users to /login', async ({ page }) => {
    await page.goto('/admin/users');

    // Middleware should redirect unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
