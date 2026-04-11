import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('renders with hero section', async ({ page }) => {
    await page.goto('/');

    const heroTitle = page.getByText('Turn Your Pet Into a Storybook Star');
    await expect(heroTitle).toBeVisible();
  });

  test('has how-it-works section with 3 steps', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('How It Works')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upload a photo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Customize your story' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Get your book' })).toBeVisible();
  });

  test('has pricing section with price', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Pricing')).toBeVisible();
    await expect(page.getByText('$9.99')).toBeVisible();
    await expect(page.getByText('One-time payment per story')).toBeVisible();
  });

  test('CTA button links to register for unauthenticated users', async ({ page }) => {
    await page.goto('/');

    const ctaButton = page.getByRole('link', { name: /get started/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toHaveAttribute('href', '/register');
  });

  test('full unauthenticated flow: landing to register', async ({ page }) => {
    await page.goto('/');

    // Verify we're on the landing page
    await expect(page.getByText('Turn Your Pet Into a Storybook Star')).toBeVisible();

    // Click the CTA button
    const ctaButton = page.getByRole('link', { name: /get started/i });
    await ctaButton.click();

    // Should navigate to the register page
    await expect(page).toHaveURL(/\/register/);

    // Verify register form is visible
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirmPassword')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });
});
