# KnoxFit website rebuild (POC)

Proof of concept: can the current knoxfit.in visual design be rebuilt as locked-down
Puck blocks that staff edit visually? Home and Pricing are rebuilt; prices come from a
packages source (a static snapshot for now, your middleware later).

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
| `lib/server/packages/` | `PackagesSource` contract, mock source (static snapshot of live prices), 60s cache with stale fallback, catalog builder |
| `app/[[...slug]]/page.js` | Public renderer: published data only, honours `publish_at` / `expire_at` (expired → 307) |
| `app/admin/` | Page list, new page, editor (save draft / publish) |
| `app/buy/[package_id]` | Looks up the checkout URL when the button is clicked |
| `tools/capture/` | Dev-only Playwright scripts that captured `reference/` |
| `tools/compare/compare.js` | Dev-only: live and rebuild side by side → `reference/compare/` |

## Reference
`reference/design-tokens.md`, `assets.md`, `data-sources.md`, `screenshots/`, `compare/`, `editor/`.

## Not in the POC
Auth, MySQL, S3 upload, scheduling UI, templates, SEO fields, `/admin/settings`, other pages,
newsletter popup, floating video/WhatsApp widgets.
