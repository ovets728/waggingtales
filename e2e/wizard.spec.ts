import { test, expect } from '@playwright/test';

test.describe('Story Wizard', () => {
  test('redirects unauthenticated users from /wizard to /login', async ({ page }) => {
    await page.goto('/wizard');

    // Middleware should redirect unauthenticated users to /login
    await expect(page).toHaveURL(/\/login/);
  });

  test.skip('Step 1: Pet name is required — should not proceed without pet name', async ({ page }) => {
    // Requires authenticated session - run with real Supabase
    await page.goto('/wizard');

    // Attempt to proceed without entering a pet name
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();

    // Should still be on step 1 with a validation message
    await expect(page.getByText(/pet name/i)).toBeVisible();
  });

  test.skip('Step 2: Under-18 hides image upload — selecting under 18 should remove image upload from the DOM', async ({ page }) => {
    // Requires authenticated session - run with real Supabase
    await page.goto('/wizard');

    // Navigate to step 2 (after filling step 1)
    // Select the under-18 option
    // Verify the image upload input is not in the DOM
  });

  test.skip('Step 2: Over-18 requires terms acceptance — image upload disabled until terms checkbox is checked', async ({ page }) => {
    // Requires authenticated session - run with real Supabase
    await page.goto('/wizard');

    // Navigate to step 2 (after filling step 1)
    // Select the over-18 option
    // Verify the image upload is disabled until terms checkbox is checked
  });

  test.skip('Step 3: Theme and art style required — should not proceed without both selections', async ({ page }) => {
    // Requires authenticated session - run with real Supabase
    await page.goto('/wizard');

    // Navigate to step 3 (after filling steps 1 and 2)
    // Attempt to proceed without selecting theme and art style
    // Should remain on step 3 with validation messages
  });

  test.skip('Step 4: Review shows collected data — review page displays pet name, theme, art style', async ({ page }) => {
    // Requires authenticated session - run with real Supabase
    await page.goto('/wizard');

    // Navigate through all steps filling in data
    // On the review step, verify the pet name, theme, and art style are displayed
  });
});
