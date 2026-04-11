import { test, expect } from '@playwright/test';

test.describe('Internationalization (i18n)', () => {
  test('language toggle is visible on login page', async ({ page }) => {
    await page.goto('/login');

    // There may be two language toggles (header + page), use first
    const languageToggle = page.getByRole('button', { name: /change language/i }).first();
    await expect(languageToggle).toBeVisible();
  });

  test('default language is English', async ({ page }) => {
    // Navigate without setting any locale cookie
    await page.goto('/login');

    // English login title should be visible
    await expect(page.getByText('Sign In', { exact: true }).first()).toBeVisible();
  });

  test('switching to Spanish changes login page text', async ({ page }) => {
    // Set the locale cookie to Spanish before navigating
    await page.context().addCookies([
      { name: 'locale', value: 'es', domain: 'localhost', path: '/' },
    ]);

    await page.goto('/login');

    // Spanish login title: "Iniciar sesión"
    await expect(page.getByText('Iniciar sesión').first()).toBeVisible();
  });

  test('switching to French changes login page text', async ({ page }) => {
    // Set the locale cookie to French before navigating
    await page.context().addCookies([
      { name: 'locale', value: 'fr', domain: 'localhost', path: '/' },
    ]);

    await page.goto('/login');

    // French login title: "Connexion"
    await expect(page.getByText('Connexion').first()).toBeVisible();
  });

  test('switching to Italian changes login page text', async ({ page }) => {
    // Set the locale cookie to Italian before navigating
    await page.context().addCookies([
      { name: 'locale', value: 'it', domain: 'localhost', path: '/' },
    ]);

    await page.goto('/login');

    // Italian login title: "Accedi"
    await expect(page.getByText('Accedi').first()).toBeVisible();
  });
});
