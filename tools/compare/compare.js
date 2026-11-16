// Dev-only: capture live site and local rebuild at the same widths, then write
// side-by-side images to reference/compare/<page>-<width>.png (live left, rebuild right).
// Usage: node tools/compare/compare.js [http://localhost:3000] [/,/pricing-plans]
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const LOCAL = process.argv[2] || "http://localhost:3000";
const PAGES = (process.argv[3] || "/,/pricing-plans").split(",");
const WIDTHS = [1440, 390];
const OUT = path.join(__dirname, "../../reference/compare");
fs.mkdirSync(OUT, { recursive: true });

async function capture(context, url, file) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(3000);
  // Hide overlays that are not part of the page design (newsletter popup, floating widgets).
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      const is_floating = cs.position === "fixed" || cs.position === "absolute";
      const is_popup = is_floating && el.innerText && el.innerText.includes("Be the first to know");
      if (is_popup || (cs.position === "fixed" && el.tagName !== "HEADER" && !el.querySelector("nav"))) el.style.display = "none";
    }
  });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 100)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: file, fullPage: true });
  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  for (const width of WIDTHS) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    for (const route of PAGES) {
      const name = route === "/" ? "home" : route.slice(1);
      const live_file = path.join(OUT, `.${name}-${width}-live.png`);
      const local_file = path.join(OUT, `.${name}-${width}-rebuild.png`);
      await capture(context, "https://knoxfit.in" + route, live_file);
      await capture(context, LOCAL + route, local_file);

      const sheet = await browser.newPage({ viewport: { width: width * 2 + 40, height: 900 } });
      const to_data = (file) => "data:image/png;base64," + fs.readFileSync(file).toString("base64");
      await sheet.setContent(`<body style="margin:0;background:#888;font:14px sans-serif;display:flex;gap:40px;align-items:flex-start">
        <figure style="margin:0;width:${width}px"><figcaption style="padding:6px">LIVE knoxfit.in${route}</figcaption><img src="${to_data(live_file)}" style="width:${width}px;display:block"></figure>
        <figure style="margin:0;width:${width}px"><figcaption style="padding:6px">REBUILD ${route}</figcaption><img src="${to_data(local_file)}" style="width:${width}px;display:block"></figure>
      </body>`);
      await sheet.waitForTimeout(500);
      await sheet.screenshot({ path: path.join(OUT, `${name}-${width}.png`), fullPage: true });
      await sheet.close();
      console.log("compare", name, width);
    }
    await context.close();
  }
  await browser.close();
})();
