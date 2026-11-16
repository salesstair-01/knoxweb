// Dev-only: list image URLs (hero/sections) and header/hero geometry on home + pricing.
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const out = {};
  for (const width of [1440, 390]) {
    const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
    for (const p of ["/", "/pricing-plans"]) {
      await page.goto("https://knoxfit.in" + p, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0,0); });
      await page.waitForTimeout(1500);
      out[p + "@" + width] = await page.evaluate(() => {
        const imgs = [];
        document.querySelectorAll("img, video, [style*='background-image']").forEach(e => {
          const r = e.getBoundingClientRect();
          const cs = getComputedStyle(e);
          if (cs.display === "none" || cs.visibility === "hidden") return;
          const src = e.currentSrc || e.src || (cs.backgroundImage !== "none" ? cs.backgroundImage : "");
          imgs.push({ tag: e.tagName, alt: e.alt || "", src: decodeURIComponent(src).slice(0, 300), box: [Math.round(r.x), Math.round(r.y + scrollY), Math.round(r.width), Math.round(r.height)], fit: cs.objectFit, radius: cs.borderRadius });
        });
        const header = document.querySelector("header, nav");
        const hr = header && header.getBoundingClientRect();
        return { imgs, header: header && { tag: header.tagName, box: [hr.x, hr.y, hr.width, hr.height], bg: getComputedStyle(header).backgroundColor, pos: getComputedStyle(header).position } };
      });
    }
  }
  require("fs").writeFileSync(require("path").join(__dirname, "../../reference/.raw/assets.json"), JSON.stringify(out, null, 1));
  await browser.close();
})();
