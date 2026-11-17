// Public site server: serves the latest static release written by the publisher,
// plus the middleware-owned prices.json. No database, no admin, no dependencies.
//
// Env:
//   SITE_DIR      folder holding `current` -> releases/<id>   (default ./site)
//   PRICES_FILE   prices.json written by the middleware        (default ./prices/prices.json)
//   X_ZOHO_CATALYST_LISTEN_PORT | PORT                        (default 8080)

const http = require("http");
const fs = require("fs");
const path = require("path");


const CONTENT_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".txt", "text/plain; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
]);

const HTML_CACHE = "public, max-age=60";
const PRICES_CACHE = "public, max-age=60";
const HASHED_ASSET_CACHE = "public, max-age=31536000, immutable";
const OTHER_ASSET_CACHE = "public, max-age=3600";


class SiteServer {

  #site_dir;
  #prices_file;
  #release_cache = { release_dir: null, manifest: null };


  constructor({ site_dir, prices_file }) {

    this.#site_dir = site_dir;
    this.#prices_file = prices_file;

  }


  start(port) {

    const server = http.createServer((request, response) => {

      this.#handle(request, response).catch((handle_error) => {

        console.error("[site-server]", handle_error);
        this.#send_text(response, 500, "Internal error");

      });

    });

    server.listen(port, () => {
      console.log(`[site-server] listening on ${port}, site=${this.#site_dir}, prices=${this.#prices_file}`);
    });

    return server;

  }


  async #handle(request, response) {

    const request_path = this.#normalise_path(request.url);

    response.setHeader("X-Content-Type-Options", "nosniff");

    if (request.method !== "GET" && request.method !== "HEAD") {

      this.#send_text(response, 405, "Method not allowed");

    } else if (request_path === null) {

      this.#send_text(response, 400, "Bad request");

    } else if (request_path === "/healthz") {

      this.#send_text(response, 200, "ok");

    } else if (request_path === "/data/prices.json") {

      await this.#send_prices(request, response);

    } else {

      await this.#send_from_release(request, response, request_path);

    }

  }


  async #send_prices(request, response) {

    const file_body = await this.#read_file(this.#prices_file);

    if (file_body === null) {

      response.setHeader("Cache-Control", "no-store");
      this.#send_text(response, 404, "Prices not available");

    } else {

      this.#send_body(request, response, 200, file_body, CONTENT_TYPES.get(".json"), PRICES_CACHE);

    }

  }


  async #send_from_release(request, response, request_path) {

    const release = await this.#load_release();

    if (release === null) {

      response.setHeader("Retry-After", "30");
      this.#send_text(response, 503, "Site not published yet");

    } else if (Object.hasOwn(release.manifest.pages, request_path)) {

      await this.#send_page(request, response, release, request_path);

    } else {

      await this.#send_asset(request, response, release, request_path);

    }

  }


  async #send_page(request, response, release, request_path) {

    const page_entry = release.manifest.pages[request_path];
    const page_state = this.#page_state(page_entry);

    if (page_state === "expired") {

      // 307: the slug may be reused for a later campaign.
      response.setHeader("Cache-Control", "no-store");
      response.setHeader("Location", page_entry.expired_redirect);
      this.#send_text(response, 307, `Moved to ${page_entry.expired_redirect}`);

    } else if (page_state === "not_yet") {

      await this.#send_not_found(request, response, release);

    } else {

      const html_file = request_path === "/"
        ? path.join(release.release_dir, "index.html")
        : path.join(release.release_dir, request_path, "index.html");
      const file_body = await this.#read_file(html_file);

      this.#send_body(request, response, 200, file_body, CONTENT_TYPES.get(".html"), HTML_CACHE);

    }

  }


  async #send_asset(request, response, release, request_path) {

    const asset_file = path.join(release.release_dir, request_path);
    const is_inside_release = asset_file.startsWith(release.release_dir + path.sep);
    const is_hidden = path.basename(asset_file) === "manifest.json" || path.extname(asset_file) === ".html";
    let _file_body = null;

    if (is_inside_release && !is_hidden) {
      _file_body = await this.#read_file(asset_file);
    }

    if (_file_body === null) {

      await this.#send_not_found(request, response, release);

    } else {

      const extension = path.extname(asset_file).toLowerCase();
      const content_type = CONTENT_TYPES.get(extension) || "application/octet-stream";
      const cache_control = request_path.startsWith("/_next/static/") ? HASHED_ASSET_CACHE : OTHER_ASSET_CACHE;

      this.#send_body(request, response, 200, _file_body, content_type, cache_control);

    }

  }


  async #send_not_found(request, response, release) {

    const file_body = await this.#read_file(path.join(release.release_dir, "404.html"));

    this.#send_body(request, response, 404, file_body || "Not found", CONTENT_TYPES.get(".html"), "no-store");

  }


  #page_state(page_entry) {

    const now = new Date();
    let _state = "live";

    if (!!page_entry.publish_at && new Date(page_entry.publish_at) > now) {

      _state = "not_yet";

    } else if (!!page_entry.expire_at && new Date(page_entry.expire_at) <= now) {

      _state = "expired";

    }

    return _state;

  }


  // Re-reads the manifest only when `current` points at a new release.
  async #load_release() {

    let _release = null;

    try {

      const release_dir = await fs.promises.realpath(path.join(this.#site_dir, "current"));

      if (release_dir !== this.#release_cache.release_dir) {

        const manifest_text = await fs.promises.readFile(path.join(release_dir, "manifest.json"), "utf8");

        this.#release_cache = { release_dir: release_dir, manifest: JSON.parse(manifest_text) };
        console.log(`[site-server] serving release ${this.#release_cache.manifest.release_id}`);

      }

      _release = this.#release_cache;

    } catch (load_error) {

      _release = null;

    }

    return _release;

  }


  #normalise_path(request_url) {

    let _path = null;

    try {

      const decoded_path = decodeURIComponent(new URL(request_url, "http://site").pathname);
      const segments = decoded_path.split("/");
      const has_traversal = segments.includes("..") || decoded_path.includes("\0");

      if (!has_traversal) {

        _path = decoded_path.length > 1 && decoded_path.endsWith("/")
          ? decoded_path.slice(0, -1)
          : decoded_path;

      }

    } catch (parse_error) {

      _path = null;

    }

    return _path;

  }


  async #read_file(file_path) {

    let _file_body = null;

    try {

      const file_stat = await fs.promises.stat(file_path);

      if (file_stat.isFile()) {
        _file_body = await fs.promises.readFile(file_path);
      }

    } catch (read_error) {

      _file_body = null;

    }

    return _file_body;

  }


  #send_body(request, response, status_code, file_body, content_type, cache_control) {

    response.statusCode = status_code;
    response.setHeader("Content-Type", content_type);
    response.setHeader("Content-Length", Buffer.byteLength(file_body));

    if (!response.hasHeader("Cache-Control")) {
      response.setHeader("Cache-Control", cache_control);
    }

    if (request.method === "HEAD") {

      response.end();

    } else {

      response.end(file_body);

    }

  }


  #send_text(response, status_code, message_text) {

    response.statusCode = status_code;
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    response.end(message_text);

  }

}


const site_server = new SiteServer({
  site_dir: path.resolve(process.env.SITE_DIR || "./site"),
  prices_file: path.resolve(process.env.PRICES_FILE || "./prices/prices.json"),
});

site_server.start(Number(process.env.X_ZOHO_CATALYST_LISTEN_PORT || process.env.PORT || 8080));
