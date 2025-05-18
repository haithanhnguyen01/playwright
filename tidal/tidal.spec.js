// @ts-check
// complete full code
// @ts-ignore
import { test, expect } from '@playwright/test';
import fs from 'fs';
test("Tidal design with multiple variants", async ({ page }) => {
  await page.goto('https://www.lodes.com/en/products/tidal-2/?code=eu', { waitUntil: 'domcontentloaded' });

  try {
    const rejectCookies = page.getByRole('button', { name: 'Reject all' });
    await rejectCookies.waitFor({ timeout: 10000 });
    await rejectCookies.click();
  } catch { }

  const title = await page.locator('span.bred4').innerText();

  const ImageGallery = await page.locator('.img-gallery img').all();
  const ImageUrls = [];

  for (const img of ImageGallery) {
    const src = await img.getAttribute('src');
    ImageUrls.push(src);
  }
  const description = await page.locator('.font26.serif.text-more').first().innerText();
  const Overall = [];
  Overall.push({
    FamilyName: title,
    FamilyImage: ImageUrls,
    Description: description.trim(),
  });

  const fullProducts = [];
  const variants = await page.$$('.variante');
  const count = variants.length;
  for (let variantIndex = 0; variantIndex < count; variantIndex++) {

    await variants[variantIndex].click();
    await page.waitForTimeout(800);

    const body = page.locator('.body-variante').nth(variantIndex);
    if (await body.isVisible()) {
      const productName = await page.locator('.left.col25.font26.serif').nth(variantIndex).innerText();
      const image = await page.locator('.img-tecnica-td .img-tecnica').nth(variantIndex);
      const imageSrc = await image.getAttribute('src');
      // @ts-ignore
      const type = productName.split(' ').pop();
      let productDetails = [];

      // Only extract table and lamps for the first variant

      const tables = await page.$$('table.table-variante.marginb40');
      const table = tables[variantIndex];
      const lampDivs = page.locator('div.single-lampadina');
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
          more: 'LED and driver included'
        };
      };

      const parsedLamp2700 = parseLamp(lamp2700Text);
      const parsedLamp3000 = parseLamp(lamp3000Text);


      const formatColorForURL = (colorName) =>{
        let name = colorName.split('-')[0].trim();
        if (name=="Extra Matte Champagne") {
          name = 'Matte Champagne';
        
        }
        return name
          .split('–')[0]
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '')
          .replace(/[^\w]/g, '');
      }
      if (table) {
        const rows = await table.$$('tr');
        for (const row of rows) {
          const iconTds = await row.$$('td.icons:has(table)');
          const codeTds = await row.$$('td.codes:has(table)');
          if (iconTds.length < 1 || codeTds.length < 2) continue;

          const structureRows = await iconTds[0].$$('table tr');
          const canopyRows = await iconTds[1].$$('table tr');
          const codeRows = await codeTds[0].$$('table tr');
          const codeRows2 = await codeTds[1].$$('table tr');
          const rowCount = Math.min(structureRows.length, codeRows2.length, codeRows.length);

          // 2700K codes
          for (let i = 0; i < rowCount; i++) {
            const structureImg = await structureRows[i].$('td a img');
            const canopyImg = await canopyRows[i].$('td a img');
            const codeCell = await codeRows[i].$('td');
            const structureAlt = structureImg ? await structureImg.getAttribute('alt') : 'N/A';
            const canopyAlt = canopyImg ? await canopyImg.getAttribute('alt') : 'N/A';
            const codeText = codeCell ? (await codeCell.innerText()).trim() : 'N/A';

            // const colorProduct = formatColorForURL(structureAlt);
            // @ts-ignore
            const colorURL = formatColorForURL(structureAlt);
            const ColorUrl = `https://www.lodes.com/wp-content/uploads/2025/01/Tidal-Suspension-${colorURL}.png`;


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

            // const colorProduct = formatColorForURL(structureAlt);
            const colorURL = formatColorForURL(structureAlt);
            const ColorUrl = `https://www.lodes.com/wp-content/uploads/2025/01/Tidal-Suspension-${colorURL}.png`;


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
        "Product Details": productDetails
      });
    }
  }
  Overall.push(fullProducts);
  console.log(JSON.stringify(Overall, null, 2));
  fs.writeFileSync(`${title}.json`, JSON.stringify(Overall, null, 2));
});
