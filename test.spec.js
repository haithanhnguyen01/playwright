// @ts-check
import { test, expect } from "@playwright/test";

test("Navigate to the website", async ({ page }) => {
    // Navigate to the website using goto
    await page.goto("https://www.westernsydney.edu.au");
});
     
test("Extract all social media links", async ({ page }) => {  
    await page.goto("https://www.westernsydney.edu.au"); // navigate to the website
        const socialLinks = await page.$$eval("a", (links) => {
        let urls = {};// create an empty object to store the URLs
        links.forEach((link) => {
            const href = link.href;
            if (href.includes("facebook.com")) urls.facebook = href;
            if (href.includes("twitter.com") || href.includes("x.com")) urls.twitter = href;
            if (href.includes("linkedin.com")) urls.linkedin = href;
            if (href.includes("instagram.com")) urls.instagram = href;
            if (href.includes("youtube.com")) urls.youtube = href;
        });
        return urls;
    });

    // Print extracted URLs as JSON
    console.log(JSON.stringify(socialLinks, null, 2));// output the extracted URLs to console

});

test("Click the apply button", async ({ page }) => {
    await page.goto("https://www.westernsydney.edu.au");// navigate to the website
    await page.getByRole("button", { name: "Apply Now" }).click();// click the apply button
    console.log("Successfully navigated to:", page.url());// output the URL to console
    expect(page.url()).toContain("apply");// check if the URL contains "apply"
});

test("extract URL of main banner's background images", async ({ page }) => {
    await page.goto("https://www.westernsydney.edu.au");// navigate to the website
    await page.waitForSelector('img[src*="homepagebanner"]'); // wait for the image to load
    // @ts-ignore
    const imageUrl = await page.$eval('img[src*="homepagebanner"]', (img) => img.src);// extract the image URL
    console.log('Updated Image URL:', imageUrl); // output the image URL to console
});
