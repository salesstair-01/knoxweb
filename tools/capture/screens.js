// Dev-only: full-page reference screenshots + network log of the live site.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const BASE = "https://knoxfit.in";
const PAGES = (process.argv[2] || "/,/pricing-plans,/programs,/trainers,/new-to-knox,/reset-retreats,/careers,/privacy-policy,/terms-and-conditions").split(",");
const WIDTHS = [1440, 390];
const OUT = path.join(__dirname, "../../reference/screenshots");

async function scroll_through(page) {
  await page.evaluate(async () => {
    const step = 400;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

(async () => {
  const browser = await chromium.launch();
  const net = [];
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on("response", async (res) => {
      const t = res.request().resourceType();
      if (t === "fetch" || t === "xhr") net.push({ page: page.url(), url: res.url(), status: res.status() });
    });
    for (const p of PAGES) {
      const name = p === "/" ? "home" : p.slice(1);
      try {
        await page.goto(BASE + p, { waitUntil: "networkidle", timeout: 60000 });
      } catch (e) { console.log("timeout", p); }
      await scroll_through(page);
      await page.screenshot({ path: path.join(OUT, `${name}-${width}.png`), fullPage: true });
      console.log("saved", name, width);
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(__dirname, "../../reference/.network.json"), JSON.stringify(net, null, 2));
  await browser.close();
})();
