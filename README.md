# KnoxFit website rebuild (POC)

Proof of concept: can the current knoxfit.in visual design be rebuilt as locked-down
Puck blocks that staff edit visually? Home and Pricing are rebuilt.

Prices are not part of any page. Package blocks fetch `prices.json` (schema_version 1,
owned and rewritten by the middleware) in the browser. Page rebuilds happen only on UI edits.
`public/data/prices.json` is a snapshot of the live prices for local use.

## Architecture

```
admin (Next.js, :3000)                      site (plain Node, :8080)  ← public
  Puck editor, page storage                   serves releases/current
  Publish → export static release ──volume──► enforces publish_at / expire_at (307)
                                              serves /data/prices.json ◄── middleware
```

- Saving a draft never changes the site. Publish/unpublish writes a new release
  (`releases/<id>`, keeps the last 5) and switches `current` atomically.
- Scheduled pages are exported ahead of time; site-server applies the dates from
  `manifest.json`, so going live and expiring need no rebuild.
- Prices are never in a release. Pages fetch `/data/prices.json`; the middleware owns that file.

## Run with Docker (both containers)

```bash
npm ci && npm run build          # the admin image copies the built app
docker compose up --build        # if Docker Hub rate-limits: NODE_IMAGE=mirror.gcr.io/library/node:22-alpine
```

- Public site: http://localhost:8080
- Admin: http://localhost:3000/admin, editor at /admin/edit/home
- Prices: edit `public/data/prices.json` (mounted read-only into the site container as the
  middleware's file). Changes show on the next page load, with no rebuild.
- Both containers honour `X_ZOHO_CATALYST_LISTEN_PORT` for AppSail.

## Run without Docker

```bash
npm run build && npm start                                              # admin on :3000
SITE_DIR=.data/site PRICES_FILE=public/data/prices.json node site-server/server.js   # site on :8080
```

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
| `app/[[...slug]]/page.js` | Renderer used by the publisher (render token) and for staff preview |
| `lib/server/site_publisher.js` | Exports published pages to a static release + `manifest.json`, swaps `current` |
| `site-server/server.js` | Public static server: releases, prices.json, cache headers, schedule, 404 |
| `docker-compose.yml`, `Dockerfile.admin`, `site-server/Dockerfile` | Local two-container stack |
| `app/admin/` | Page list, new page, editor (save draft / publish) |
| `tools/capture/` | Dev-only Playwright scripts that captured `reference/` |
| `tools/compare/compare.js` | Dev-only: live and rebuild side by side → `reference/compare/` |

## Reference
`reference/design-tokens.md`, `assets.md`, `data-sources.md`, `screenshots/`, `compare/`, `editor/`.

## Not in the POC
Auth, MySQL, image upload, scheduling screen (dates can be set via the `schedule` API action), templates, SEO fields, `/admin/settings`, other pages,
newsletter popup, floating video/WhatsApp widgets.
