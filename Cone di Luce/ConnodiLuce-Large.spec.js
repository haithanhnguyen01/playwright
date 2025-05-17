// @ts-check
import { test, expect } from '@playwright/test';
import fs from 'fs';
test("Cono di Luce Large", async ({ page }) => {
  await page.goto('https://www.lodes.com/en/products/cono-di-luce-sospensione-cluster/?code=eu', { waitUntil: 'domcontentloaded' });

  try {
    const rejectCookies = page.getByRole('button', { name: 'Reject all' });
    await rejectCookies.waitFor({ timeout: 10000 });
    await rejectCookies.click();
  } catch {}

  const fullProducts = [];

    const variants = await page.$$('.varianti.marginb60 .variante');

    await variants[1].click();
    await page.waitForTimeout(800);

    const body = page.locator('.variante.open');

    if (await body.isVisible()) {
      const productName = await page.locator('.left.col25.font26.serif').nth(1).innerText();
      const image = await page.locator('.img-tecnica-td .img-tecnica').nth(1);
      const imageSrc = await image.getAttribute('src');
      const description = await page.locator('.font26.serif.text-more').nth(1).innerText();

      const ImageGallery = await page.locator('.img-gallery img').all();
      const ImageUrls = [];

      for (const img of ImageGallery) {
        const src = await img.getAttribute('src');
        ImageUrls.push(src);
      }
      // array to store product details...
      let productDetails = [];

      // Only extract table and lamps for the first variant
   
        const table = await page.$$('table.table-variante.marginb40');
        const table2 = table[1];
        const lampDivs = body.locator('div.single-lampadina');
        const lamp2700Text = await lampDivs.nth(0).innerText();
        // const moreInfo = await page.locator('.nota.margin20.font11').nth[0].innerText(); 

        const parseLamp = (text) => {
          const lines = text
            .split('\n')
            .map(line => line.replace(/^\u2199\s?/, '').trim())
            .filter(line => line.length > 0);

          return {
            temperature: lines[0] || 'N/A',
            wattage: lines[1] || 'N/A',
            lumens: lines[2] || 'N/A',
            current: lines[3] || 'N/A',
            CRI: lines[4] || 'N/A',
            macAdam: lines[5] || 'N/A',
            // more: moreInfo||'N//A'
          };
        };

        const parsedLamp2700 = parseLamp(lamp2700Text);

        const formatColorForURL = (colorName) =>
          colorName.replace(/\s+/g, '')       // remove spaces
                   .replace(/é/g, 'e')
                   .replace(/[^\w]/g, '');

        if (table2) {
          const rows = await table2.$$('tr');
          for (const row of rows) {
            const iconTds = await row.$$('td.icons:has(table)');
            const codeTds = await row.$$('td.codes:has(table)');
            if (iconTds.length < 2 || codeTds.length < 1) continue;

            const structureRows = await iconTds[0].$$('table tr');
            const canopyRows = await iconTds[1].$$('table tr');
            const codeRows = await codeTds[0].$$('table tr');
            const rowCount = Math.min(structureRows.length, canopyRows.length, codeRows.length);

            // 2700K codes
            for (let i = 0; i < rowCount; i++) {
              const structureImg = await structureRows[i].$('td a img');
              const canopyImg = await canopyRows[i].$('td a img');
              const codeCell = await codeRows[i].$('td');
              
              const structureAlt = structureImg ? await structureImg.getAttribute('alt') : 'N/A';
              const canopyAlt = canopyImg ? await canopyImg.getAttribute('alt') : 'N/A';
              const codeText = codeCell ? (await codeCell.innerText()).trim() : 'N/A';

              const colorProduct = formatColorForURL(canopyAlt);
              const ColorUrl = `https://www.lodes.com/wp-content/uploads/2024/01/Cono-di-Luce-large-${colorProduct}-1.png`;

              productDetails.push({
                Code: codeText,
                OutsideDiffuser: structureAlt,
                InsideDiffuser: canopyAlt,
                ThumbnailImage: ColorUrl,
                Lamp: parsedLamp2700
              });
            }           
          }
        }
      
        fullProducts.push({
        "Product Name": productName.trim(),
        "Dimension Drawing": imageSrc || 'N/A',
        "Description": description || 'N/A',
        "Image Gallery": ImageUrls,
        "Product Details": productDetails
      });
    }
  

  console.log(JSON.stringify(fullProducts, null, 2));
  fs.writeFileSync('ConnodiLuce-Large.json', JSON.stringify(fullProducts, null, 2), 'utf-8');
});
