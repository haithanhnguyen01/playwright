// @ts-check
import { test, expect } from '@playwright/test';
test("Tidal design", async ({ page }) => {
    // Navigate to the website using goto
    await page.goto('https://www.lodes.com/en/products/tidal-2/', { waitUntil: 'domcontentloaded' });

    // Accept cookies if visible
    const rejectCookies = page.getByRole('button', { name: 'Reject all' });
  try {
    await rejectCookies.waitFor({ timeout: 10000 });
    await rejectCookies.click();
  } catch {
  }
  
    // Click the "Tidal Adjustable" tab
    await page.getByText('Tidal Adjustable').nth(0).click();
    await page.locator('div.variant-open').nth(0);
    // Wait for tab content to appear
    const tabContent = page.locator('div.body-variante').nth(0);
    await expect(tabContent).toBeVisible();
    await page.waitForTimeout(500); // Wait 0.5 seconds before checking
    
    //extract dimension_drawing
    const dimensionDrawing = tabContent.locator('img.img-tecnica');
    await expect(dimensionDrawing).toBeVisible({ timeout: 10000 });

    const imgUrl = await dimensionDrawing.getAttribute('src');
    console.log('Image URL:', imgUrl);
});