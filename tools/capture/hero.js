// Dev-only: viewport capture of the home hero with the newsletter popup dismissed.
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto("https://knoxfit.in/", { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(5000);
    await page.mouse.click(width > 800 ? 1381 : 357, width > 800 ? 573 : 558);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `reference/screenshots/home-hero-${width}.png` });
  }
  await browser.close();
})();
