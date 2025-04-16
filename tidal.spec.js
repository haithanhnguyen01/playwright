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
    await page.locator('.variante').first().click();
    const products = await page.locator('.variante').elementHandles();
    for (const product of products) {
        const productName = await product.$eval('.left.col25.font26.serif', el => el.textContent);
        //const imageUrl = await product.$eval('img.img-tecnica', node => node.getAttribute('src'));
        console.log(`Product Name: ${productName}`);
        //console.log(`Image URL: ${imageUrl}`);
    expect(page.locator('.body-variante')).toBeVisible();
    }
});
