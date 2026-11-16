// Dev-only: read computed style VALUES and API response shapes from the live site.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "../../reference/.raw");
fs.mkdirSync(OUT, { recursive: true });

const PROPS = ["fontFamily","fontSize","fontWeight","lineHeight","letterSpacing","textTransform","color","backgroundColor","borderRadius","padding","margin","border","width","height","maxWidth","gap"];

(async () => {
  const browser = await chromium.launch();
  for (const width of [1440, 390]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    const api = [];
    page.on("response", async (res) => {
      if (res.url().includes("/api/zoho/")) {
        try { api.push({ url: res.url(), body: await res.json() }); } catch (e) {}
      }
    });
    for (const p of ["/", "/pricing-plans"]) {
      await page.goto("https://knoxfit.in" + p, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(2500);
      // Visible text elements with computed values
      const rows = await page.evaluate((PROPS) => {
        const out = [];
        const els = document.querySelectorAll("h1,h2,h3,h4,h5,p,a,button,li,span,div,section,header,footer,nav,input,img");
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden") continue;
          const own = Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(" ").trim();
          const isBox = !own && (cs.backgroundColor !== "rgba(0, 0, 0, 0)" || cs.borderRadius !== "0px" || el.tagName === "IMG" || ["SECTION","HEADER","FOOTER","NAV"].includes(el.tagName));
          if (!own && !isBox) continue;
          const o = { tag: el.tagName, text: own.slice(0, 60), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) };
          for (const k of PROPS) o[k] = cs[k];
          if (el.tagName === "IMG") o.src = el.currentSrc;
          if (cs.backgroundImage !== "none") o.bgImage = cs.backgroundImage.slice(0, 200);
          out.push(o);
        }
        return out;
      }, PROPS);
      const name = (p === "/" ? "home" : p.slice(1)) + "-" + width;
      fs.writeFileSync(path.join(OUT, name + ".json"), JSON.stringify(rows, null, 1));
      console.log(name, rows.length);
      if (p === "/pricing-plans") {
        // click each tab, record rendered packages
        const tabs = await page.$$eval("button", bs => bs.map(b => b.textContent.trim()).filter(t => /Lab Credits|Personal Training|Gym Access/.test(t)));
        const uniq = [...new Set(tabs)];
        const pkg = {};
        for (const t of uniq) {
          await page.locator("button:visible", { hasText: t }).first().click().catch(e => console.log("click fail", t));
          await page.waitForTimeout(2500);
          await page.screenshot({ path: path.join(__dirname, `../../reference/screenshots/pricing-plans-tab-${t.toLowerCase().replace(/\W+/g, "-")}-${width}.png`), fullPage: true });
          pkg[t] = await page.evaluate(() => document.querySelector("main")?.innerText || document.body.innerText);
        }
        fs.writeFileSync(path.join(OUT, "pricing-text-" + width + ".json"), JSON.stringify(pkg, null, 1));
      }
    }
    fs.writeFileSync(path.join(OUT, "zoho-" + width + ".json"), JSON.stringify(api, null, 1));
    await ctx.close();
  }
  await browser.close();
})();
