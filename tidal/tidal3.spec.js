// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'fs';
test("Tidal design with multiple variants", async ({ page }) => {
  await page.goto('https://www.lodes.com/en/products/tidal-2/?code=eu', { waitUntil: 'domcontentloaded' });

  try {
    const rejectCookies = page.getByRole('button', { name: 'Reject all' });
    await rejectCookies.waitFor({ timeout: 10000 });
    await rejectCookies.click();
  } catch {}

  const fullProducts = [];

    const variants = await page.$$('.variante');

    await variants[2].click();
    await page.waitForTimeout(800);

    const body = page.locator('.body-variante').nth(2);
    if (await body.isVisible()) {
      const productName = await page.locator('.left.col25.font26.serif').nth(2).innerText();
      const image = await page.locator('.img-tecnica-td .img-tecnica').nth(2);
      const imageSrc = await image.getAttribute('src');
      const description = await page.locator('.font26.serif.text-more').first().innerText();

      const ImageGallery = await page.locator('.img-gallery img').all();
      const ImageUrls = [];

      for (const img of ImageGallery) {
        const src = await img.getAttribute('src');
        ImageUrls.push(src);
      }

      let productDetails = [];

      // Only extract table and lamps for the first variant
   
        const tables = await page.$$('table.table-variante.marginb40');
        const table = tables[2];
        const lampDivs = body.locator('div.single-lampadina');
        const lamp2700Text = await lampDivs.nth(0).innerText();
        const lamp3000Text = await lampDivs.nth(1).innerText();

        const parseLamp = (text) => {
          const lines = text
            .split('\n')
            .map(line => line.replace(/^\u2199\s?/, '').trim())
            .filter(line => line.length > 0);

          return {
            type: lines[0] || 'N/A',
            temperature: lines[1] || 'N/A',
            wattage: lines[2] || 'N/A',
            lumens: lines[3] || 'N/A',
            current: lines[4] || 'N/A',
            CRI: lines[5] || 'N/A',
            macAdam: lines[6] || 'N/A',
            more:'LED and driver included'
          };
        };

        const parsedLamp2700 = parseLamp(lamp2700Text);
        const parsedLamp3000 = parseLamp(lamp3000Text);

        const formatColorForURL = (colorName) =>
          colorName.replace(/\s+/g, '')       // remove spaces
                   .replace(/é/g, 'e')
                   .replace(/[^\w]/g, '');

        if (table) {
          const rows = await table.$$('tr');
          for (const row of rows) {
            const iconTds = await row.$$('td.icons:has(table)');
            const codeTds = await row.$$('td.codes:has(table)');
            if (iconTds.length < 2 || codeTds.length < 1) continue;

            const structureRows = await iconTds[0].$$('table tr');
            const canopyRows = await iconTds[1].$$('table tr');
            const codeRows = await codeTds[0].$$('table tr');
            const codeRows2 = await codeTds[1].$$('table tr');
            const rowCount = Math.min(structureRows.length, canopyRows.length, codeRows.length);

            // 2700K codes
            for (let i = 0; i < rowCount; i++) {
              const structureImg = await structureRows[i].$('td a img');
              const canopyImg = await canopyRows[i].$('td a img');
              const codeCell = await codeRows[i].$('td');
              const structureAlt = structureImg ? await structureImg.getAttribute('alt') : 'N/A';
              const canopyAlt = canopyImg ? await canopyImg.getAttribute('alt') : 'N/A';
              const codeText = codeCell ? (await codeCell.innerText()).trim() : 'N/A';

              const colorProduct = formatColorForURL(structureAlt);
              const ColorUrl = `https://www.lodes.com/wp-content/uploads/2025/01/Tidal-Suspension-${colorProduct}.png`;

              productDetails.push({
                Code: codeText,
                Structure: structureAlt,
                Canopy: canopyAlt,
                Lamp: parsedLamp2700,
                ThumbnailImage: ColorUrl,
                Dimming: 'Triac, Dali'
              });
            }

            // 3000K codes
            for (let i = 0; i < rowCount; i++) {
              const structureImg = await structureRows[i].$('td a img');
              const canopyImg = await canopyRows[i].$('td a img');
              const codeCell = await codeRows2[i].$('td');
              const structureAlt = structureImg ? await structureImg.getAttribute('alt') : 'N/A';
              const canopyAlt = canopyImg ? await canopyImg.getAttribute('alt') : 'N/A';
              const codeText = codeCell ? (await codeCell.innerText()).trim() : 'N/A';

              const colorProduct = formatColorForURL(structureAlt);
              const ColorUrl = `https://www.lodes.com/wp-content/uploads/2025/01/Tidal-Suspension-${colorProduct}.png`;

              productDetails.push({
                Code: codeText,
                Structure: structureAlt,
                Canopy: canopyAlt,
                Lamp: parsedLamp3000,
                ThumbnailImage: ColorUrl,
                Dimming: 'Triac, Dali'
              });
            }
          }
        }
      

      fullProducts.push({
        "Product Name": productName.trim(),
        "Dimension Drawing": imageSrc || 'N/A',
        "Description": description.trim() || 'N/A',
        "Image Gallery": ImageUrls,
        "Product Details": productDetails
      });
    }
  

  console.log(JSON.stringify(fullProducts, null, 2));
  fs.writeFileSync('tidal_output3.json', JSON.stringify(fullProducts, null, 2));
});
