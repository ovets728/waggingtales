import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test('renders login form with email, password, and submit button', async ({ page }) => {
    await page.goto('/login');

    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('shows validation when submitting empty form', async ({ page }) => {
    await page.goto('/login');

    // HTML5 required validation prevents submission — the inputs have the required attribute.
    // Click submit and verify the form is still on the login page (not navigated away).
    const submitButton = page.getByRole('button', { name: /sign in/i });
    await submitButton.click();

    // The email input has 'required', so the browser should block submission.
    // Verify we're still on the login page.
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('input#email')).toBeVisible();
  });

  test('has a link to the register page', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('link', { name: /create one/i });
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', '/register');
  });
});

test.describe('Register Page', () => {
  test('renders register form with email, password, confirm password, and submit button', async ({ page }) => {
    await page.goto('/register');

    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirmPassword')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('validates that passwords must match', async ({ page }) => {
    await page.goto('/register');

    await page.locator('input#email').fill('test@example.com');
    await page.locator('input#password').fill('password123');
    await page.locator('input#confirmPassword').fill('differentpassword');

    await page.getByRole('button', { name: /create account/i }).click();

    // The client-side validation should show an error about passwords not matching
    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
  });

  test('has a link to the login page', async ({ page }) => {
    await page.goto('/register');

    const loginLink = page.getByRole('link', { name: /sign in/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });
});

test.describe('Protected Routes', () => {
  test('redirects unauthenticated users from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard');

    // Middleware should redirect unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/);
  });
});
