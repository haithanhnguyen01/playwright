// @ts-check

import { test, expect } from '@playwright/test';
import fs from 'fs';
test("Tidal design with multiple variants", async ({ page }) => {
    await page.goto('https://www.lodes.com/en/products/megaphone/?code=eu', { waitUntil: 'domcontentloaded' });

    try {
        const rejectCookies = page.getByRole('button', { name: 'Reject all' });
        await rejectCookies.waitFor({ timeout: 10000 });
        await rejectCookies.click();
    } catch { }

    //get the family name
    const title = await page.locator('span.bred3').innerText();

    // Extract the image URLs from the gallery
    const galleryImgs = await page.locator('.carousel-cell img').all();
    const ImageUrls = [];

    for (const img of galleryImgs) {
        let src = await img.getAttribute('src');
        if (!src) {
            src = await img.getAttribute('data-flickity-lazyload');
        }

        if (src) ImageUrls.push(src);
    }
    // Extract the description
    const description = await page.locator('.font22.marginb20').first().innerText();
    // Create the Overall array
    // and push the family name, image URLs, and description
    const Overall = [];
    Overall.push({
        FamilyName: title,
        FamilyImage: ImageUrls,
        Description: description.trim(),
    });

    const fullProducts = [];
    const variants = await page.$$('.variante');
    const count = variants.length;
    // Loop through each variant and extract the product details
    for (let variantIndex = 0; variantIndex < count; variantIndex++) {

        await variants[variantIndex].click();
        await page.waitForTimeout(800);

        const body = page.locator('.body-variante').nth(variantIndex);
        if (await body.isVisible()) {
            const productName = await page.locator('.left.col25.font26.serif').nth(variantIndex).innerText(); //product name each variant
            const image = await page.locator('.img-tecnica-td .img-tecnica').nth(variantIndex);               // image of each variant
            const imageSrc = await image.getAttribute('src');

            let productDetails = [];

            // Only extract table and lamps for the first variant

            const tables = await page.$$('table.table-variante.marginb40');
            const table = tables[variantIndex];
            const lampDivs = page.locator('div.single-lampadina');
            const lamp2700Text = await lampDivs.nth(0).innerText(); //lamp details 2700k

            const parseLamp = (text) => {
                const lines = text
                    .split('\n')
                    .map(line => line.replace(/^\u2199\s?/, '').trim())
                    .filter(line => line.length > 0);

                return {
                    ShapeandScrewbase: lines[0] || 'N/A',
                    type: lines[1] || 'N/A',
                    // temperature: lines[1] || 'N/A',
                    wattage: lines[2] || 'N/A',
                    WiringandLength: lines[3] || 'N/A',
                    WiringandLengthinInches: lines[4] || 'N/A',
                    // lumens: lines[3] || 'N/A',
                    // current: lines[4] || 'N/A',
                    // CRI: lines[5] || 'N/A',
                    // macAdam: lines[6] || 'N/A',
                    // more:'LED and driver included'
                };
            };

            const parsedLamp2700 = parseLamp(lamp2700Text);


            const formatColorForURL = (colorName) =>
                colorName.replace(/\s+/g, '')       // remove spaces
                    .replace(/é/g, 'e')
                    .replace(/[^\w]/g, '');
            // start extracting the product details from the table
            if (table) {
                const rows = await table.$$('tr');
                for (const row of rows) {
                    const iconTds = await row.$$('td.icons:has(table)');
                    const codeTds = await row.$$('td.codes:has(table)');
                    if (iconTds.length < 1 || codeTds.length < 1) continue;

                    const structureRows = await iconTds[0].$$('table tr');
                    // const canopyRows = await iconTds[1].$$('table tr');
                    const codeRows = await codeTds[0].$$('table tr');
                    // const codeRows2 = await codeTds[1].$$('table tr');
                    const rowCount = Math.min(structureRows.length, codeRows.length);

                    // 2700K codes
                    for (let i = 0; i < rowCount; i++) {
                        const structureImg = await structureRows[i].$('td img');
                        //   const canopyImg = await canopyRows[i].$('td a img');
                        const codeCell = await codeRows[i].$('td');
                        const structureAlt = structureImg ? await structureImg.getAttribute('alt') : 'N/A';
                        //   const canopyAlt = canopyImg ? await canopyImg.getAttribute('alt') : 'N/A';
                        const codeText = codeCell ? (await codeCell.innerText()).trim() : 'N/A';

                        const colorProduct = formatColorForURL(structureAlt);
                        const ColorUrl = `https://www.lodes.com/wp-content/uploads/2024/05/Megaphone-${colorProduct}.png`;

                        productDetails.push({
                            Code: codeText,
                           Structure: structureAlt,
                            // Diffuser: canopyAlt,
                            Lamp: parsedLamp2700,
                            ThumbnailImage: ColorUrl,
                            Dimming: 'N/A'
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
