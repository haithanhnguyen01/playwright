// @ts-check
import { test, expect } from '@playwright/test';
import { executionAsyncId } from 'async_hooks';
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
    //access child elements through loop of each item
  
    
  const variants = page.locator('.variante');
  const count = await variants.count();

  for (let i = 0; i < count; i++) {
    const currentTab = variants.nth(i);

    // Click the tab
    await currentTab.click();
    await page.waitForTimeout(800); 

    // Get content inside current tab
    const body = currentTab.locator('.body-variante');
    const isVisible = await body.isVisible();
    console.log(`Body visible: ${isVisible}`);

    if (isVisible) {
      const productName = await currentTab.locator('.left.col25.font26.serif').innerText();
      console.log(`Product Name: ${productName}`);

      // Optional image extraction
      const img = currentTab.locator('img.img-tecnica');
      if (await img.isVisible()) {
        const src = await img.getAttribute('src');
        console.log(`Image URL: ${src}`);
      }
    }
  }
  
});
