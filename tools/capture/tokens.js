// Dev-only: computed style values for representative elements, located by visible text.
const { chromium } = require("playwright");
const PROPS = ["fontFamily","fontSize","fontWeight","lineHeight","letterSpacing","textTransform","color","backgroundColor","borderRadius","padding","border","width","height"];
const TARGETS = {
  "/": ["WELCOME TO KNOX|Welcome to Knox","At Knox, we transcend","Start your transformation","YES","Group Classes","OUR PROGRAMS|Our Programs","NEW YEAR NEW YOU","Try three group classes","TAKE A TRIAL|Take a Trial","THE KNOX EDGE|The Knox Edge","Knox is a high-touch","Explore the signature","Individual Assessments by coaches","STAY IN THE KNOW|Stay in the Know","Wellness beyond the Studio: RESET","RESET is our signature","LEARN MORE|Learn More","Swap stuff for strength","START THEIR JOURNEY|Start Their Journey","WHERE DO YOU NEED TO GO?|Where do you need to go?","There is no place like knox","Tryambika Shah","Download our","Buy credits for your","OUR STUDIOS|Our Studios","1. New Delhi","Opposite Flyover","LOCATE ON MAPS|Locate on Maps","CONNECT|Connect","Delhi : +91","Copyright Knox","PROGRAMS|Programs","SCHEDULE/BOOK CLASSES|Schedule/Book Classes"],
  "/pricing-plans": ["TRAIN ON YOUR TERMS|Train on Your Terms","Choose between our","The Lab Credits","Personal Training","First Timer Packs","The Lab 1 Promo","₹599++","This package offers 1 Studio","GIFT SESSION|Gift Session","BUY CREDIT PACK|Buy Credit Pack","PRICING|Pricing"],
};
(async () => {
  const browser = await chromium.launch();
  const result = {};
  for (const width of [1440, 390]) {
    const page = await (await browser.newContext({ viewport: { width, height: 900 } })).newPage();
    for (const [p, list] of Object.entries(TARGETS)) {
      await page.goto("https://knoxfit.in" + p, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } });
      await page.waitForTimeout(1500);
      const r = await page.evaluate(({ list, PROPS }) => {
        const out = {};
        const all = Array.from(document.querySelectorAll("body *"));
        for (const t of list) {
          const alts = t.split("|");
          const el = all.find(e => {
            const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
            const own = Array.from(e.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join("").trim();
            return own && alts.some(a => own.startsWith(a));
          });
          if (!el) { out[t] = null; continue; }
          const pick = (e) => { const cs = getComputedStyle(e); const o = {}; for (const k of PROPS) o[k] = cs[k]; const b = e.getBoundingClientRect(); o.box = [Math.round(b.x), Math.round(b.y + scrollY), Math.round(b.width), Math.round(b.height)]; return o; };
          const o = { el: el.tagName, ...pick(el) };
          // nearest ancestor with a background/radius (card/button/section)
          let a = el.parentElement, hops = 0;
          while (a && hops < 6) { const cs = getComputedStyle(a); if (cs.backgroundColor !== "rgba(0, 0, 0, 0)" || cs.borderRadius !== "0px" || cs.borderTopWidth !== "0px") { o.container = { el: a.tagName, ...pick(a) }; break; } a = a.parentElement; hops++; }
          out[t] = o;
        }
        out.__body = { bg: getComputedStyle(document.body).backgroundColor, color: getComputedStyle(document.body).color, font: getComputedStyle(document.body).fontFamily };
        return out;
      }, { list, PROPS });
      result[p + "@" + width] = r;
    }
  }
  require("fs").writeFileSync(require("path").join(__dirname, "../../reference/.raw/tokens.json"), JSON.stringify(result, null, 1));
  await browser.close();
})();
