# KnoxFit website rebuild (POC)

Proof of concept: can the current knoxfit.in visual design be rebuilt as locked-down
Puck blocks that staff edit visually? Home and Pricing are rebuilt.

Prices are not part of any page. Package blocks fetch `prices.json` (schema_version 1,
owned and rewritten by the middleware) in the browser. Page rebuilds happen only on UI edits.
`public/data/prices.json` is a snapshot of the live prices for local use.

## Run

```bash
npm install
npm run build && npm start      # or: npm run dev
```

- Public site: http://localhost:3000/ and /pricing-plans
- Admin page list: http://localhost:3000/admin
- Editor: http://localhost:3000/admin/edit/home

Page data lives in `.data/pages.json`, created from `seed/pages/*.json` on first run.
Delete `.data/` to reset.

## Layout

| Path | What |
|---|---|
| `puck/config.jsx` | Puck config: every block's fields and preset variants |
| `puck/blocks/` | One responsive component per block (CSS modules, tokens from `app/globals.css`) |
| `puck/chrome/` | Global header and footer (from `lib/site_settings.js`) |
| `lib/server/pages_repository.js` | Page storage (draft and published kept separately). JSON file for the POC; MySQL adapter later |
| `lib/prices/price_catalog.js` | Builds tabs/groups from `prices.json` + the pricing menu; rejects unknown schema versions |
| `lib/prices/prices_config.js` | `NEXT_PUBLIC_PRICES_URL` (default `/data/prices.json`), `NEXT_PUBLIC_CHECKOUT_URL` |
| `app/[[...slug]]/page.js` | Public renderer: published data only, honours `publish_at` / `expire_at` (expired → 307) |
| `app/admin/` | Page list, new page, editor (save draft / publish) |
| `tools/capture/` | Dev-only Playwright scripts that captured `reference/` |
| `tools/compare/compare.js` | Dev-only: live and rebuild side by side → `reference/compare/` |

## Reference
`reference/design-tokens.md`, `assets.md`, `data-sources.md`, `screenshots/`, `compare/`, `editor/`.

## Not in the POC
Auth, MySQL, S3 upload, scheduling UI, templates, SEO fields, `/admin/settings`, other pages,
newsletter popup, floating video/WhatsApp widgets.
