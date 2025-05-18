// @ts-check
/*

needed to do thumbnail Img URL as it require to flexible edit the url in order to match to specific type of random cloud,
ex: each random has its code on its name such as random cloud 7 Lights 23 with number 7 and 23. they are required to add those
number to url not just only changing the diffuser
current possible solution: loops that extract the name to get number, then add it to url
                                  DO LATER AFTER FINISH ALL OTHER FAMILIES
*/ 
import { test, expect } from '@playwright/test';
import fs from 'fs';
test("Tidal design with multiple variants", async ({ page }) => {
  await page.goto('https://www.lodes.com/en/products/random-cloud/?code=eu', { waitUntil: 'domcontentloaded' });

  try {
    const rejectCookies = page.getByRole('button', { name: 'Reject all' });
    await rejectCookies.waitFor({ timeout: 10000 });
    await rejectCookies.click();
  } catch {}

 //get the family name
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
  for (let variantIndex = 0; variantIndex < 8; variantIndex++) {
    const variants = await page.$$('.variante');
    if (variants.length <= variantIndex) break;

    await variants[variantIndex].click();
    await page.waitForTimeout(800);

    const body = page.locator('.body-variante').nth(variantIndex);
    if (await body.isVisible()) {
      const productName = await page.locator('.left.col25.font26.serif').nth(variantIndex).innerText();
      const image = await page.locator('.img-tecnica-td .img-tecnica').nth(variantIndex);
      const imageSrc = await image.getAttribute('src');
      const type1= productName.split(' ')[2];
      const match = productName.match(/Ø(\d+)/);
      const type2 = match ? match[1] : null;
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

              // @ts-ignore
              const colorProduct = canopyAlt.replace(' ', '-');
              const ColorUrl = `https://www.lodes.com/wp-content/uploads/2023/12/Random-Cloud-${type1}-${type2}-${colorProduct}.png`;

              productDetails.push({
                Code: codeText,
                Canopy: structureAlt,
                Diffuser: canopyAlt,
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
              // @ts-ignore
              const colorProduct = canopyAlt.replace(' ', '-');
              const ColorUrl = `https://www.lodes.com/wp-content/uploads/2023/12/Random-Cloud-${type1}-${type2}-${colorProduct}.png`;

              productDetails.push({
                Code: codeText,
                Canopy: structureAlt,
                Diffuser: canopyAlt,
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
