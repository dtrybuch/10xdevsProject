import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('basic navigation and content check', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Check for basic elements that should be on the page
    // This is a sample test that should be updated with real selectors
    await expect(page).toHaveTitle(/10xDevs/);
    
    // Example of using a locator
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();

    // Take a screenshot for visual comparison
    await expect(page).toHaveScreenshot('homepage.png');
  });
});

// Example of Page Object Model pattern
class HomePage {
  constructor(private page: any) {}

  async navigate() {
    await this.page.goto('/');
  }

  async getHeading() {
    return this.page.getByRole('heading', { level: 1 });
  }
}

test('using Page Object Model', async ({ page }) => {
  const homePage = new HomePage(page);
  
  await homePage.navigate();
  
  const heading = await homePage.getHeading();
  await expect(heading).toBeVisible();
}); 