import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    // Modify this to match your actual app title
    await expect(page).toHaveTitle(/FPL Alpha/);
});
