import { promises as fs } from "fs";
import path from "path";
import { render_token } from "./render_token";


/**
 * Exports every published page as static HTML into a new release folder:
 *
 *   <releases_root>/releases/<release_id>/
 *     index.html, <slug>/index.html, 404.html, _next/static/..., public files
 *     manifest.json   (page paths with publish_at / expire_at / expired_redirect)
 *   <releases_root>/current -> releases/<release_id>   (switched atomically)
 *
 * site-server serves `current` and enforces the dates in manifest.json, so a
 * scheduled page goes live or expires without a rebuild. Prices are never
 * exported: pages read prices.json in the browser.
 */
export class SitePublisher {

  #repository;
  #render_origin;
  #releases_root;
  #app_root;
  #keep_releases;
  #running_publish = null;
  #publish_again = false;


  constructor({ repository, render_origin, releases_root, app_root, keep_releases }) {

    this.#repository = repository;
    this.#render_origin = render_origin;
    this.#releases_root = releases_root;
    this.#app_root = app_root;
    this.#keep_releases = keep_releases || 5;

  }


  // Publishes one at a time. A request that arrives mid-publish triggers exactly
  // one more run afterwards, so the last edit always makes it out.
  async publish_site() {

    let _result = null;

    if (this.#running_publish !== null) {

      this.#publish_again = true;
      _result = await this.#running_publish;

    } else {

      this.#running_publish = this.#publish_until_settled();

      try {

        _result = await this.#running_publish;

      } finally {

        this.#running_publish = null;

      }

    }

    return _result;

  }


  async has_current_release() {

    let _has_release = false;

    try {

      await fs.stat(path.join(this.#releases_root, "current", "manifest.json"));
      _has_release = true;

    } catch (stat_error) {

      _has_release = false;

    }

    return _has_release;

  }


  async #publish_until_settled() {

    let _summary = await this.#publish_once();

    while (this.#publish_again) {

      this.#publish_again = false;
      _summary = await this.#publish_once();

    }

    return _summary;

  }


  async #publish_once() {

    const release_id = new Date().toISOString().replace(/[:.]/g, "-");
    const release_dir = path.join(this.#releases_root, "releases", release_id);
    const pages = await this.#repository.list_published();
    let _manifest_pages = new Object();

    await fs.mkdir(release_dir, { recursive: true });

    for (const page of pages) {

      const page_path = page.slug === "" ? "/" : `/${page.slug}`;
      const page_html = await this.#render(page_path, 200);
      const html_file = page.slug === ""
        ? path.join(release_dir, "index.html")
        : path.join(release_dir, page.slug, "index.html");

      await fs.mkdir(path.dirname(html_file), { recursive: true });
      await fs.writeFile(html_file, page_html);

      _manifest_pages[page_path] = {
        publish_at: page.publish_at,
        expire_at: page.expire_at,
        expired_redirect: page.expired_redirect || "/pricing-plans",
      };

    }

    const not_found_html = await this.#render("/__knox-not-found__", 404);

    await fs.writeFile(path.join(release_dir, "404.html"), not_found_html);
    await this.#copy_assets(release_dir);

    const manifest = {
      release_id: release_id,
      published_at: new Date().toISOString(),
      pages: _manifest_pages,
    };

    await fs.writeFile(path.join(release_dir, "manifest.json"), JSON.stringify(manifest, null, 2));
    await this.#switch_current(release_id);
    await this.#prune_releases();

    return { release_id: release_id, page_count: pages.length };

  }


  async #render(page_path, expected_status) {

    const response = await fetch(`${this.#render_origin}${page_path}`, {
      headers: { "x-render-token": render_token },
      cache: "no-store",
      redirect: "manual",
    });

    if (response.status !== expected_status) {
      throw new Error(`Rendering ${page_path} returned ${response.status}, expected ${expected_status}`);
    }

    const page_html = await response.text();

    return page_html;

  }


  async #copy_assets(release_dir) {

    const next_static_dir = path.join(this.#app_root, ".next", "static");
    const public_dir = path.join(this.#app_root, "public");

    await fs.cp(next_static_dir, path.join(release_dir, "_next", "static"), { recursive: true });

    // Prices are served by site-server from the middleware-owned file, never from a release.
    await fs.cp(public_dir, release_dir, {
      recursive: true,
      filter: (source_path) => {
        return path.relative(public_dir, source_path).split(path.sep)[0] !== "data";
      },
    });

  }


  async #switch_current(release_id) {

    const current_link = path.join(this.#releases_root, "current");
    const temp_link = path.join(this.#releases_root, `current.${release_id}.tmp`);

    // Relative target so the link resolves in any container that mounts the volume.
    await fs.symlink(path.join("releases", release_id), temp_link);
    await fs.rename(temp_link, current_link);

  }


  async #prune_releases() {

    const releases_dir = path.join(this.#releases_root, "releases");
    const release_ids = await fs.readdir(releases_dir);

    release_ids.sort();

    const stale_count = release_ids.length - this.#keep_releases;
    let _removed = 0;

    for (const release_id of release_ids) {

      if (_removed >= stale_count) {
        break;
      }

      await fs.rm(path.join(releases_dir, release_id), { recursive: true, force: true });
      _removed += 1;

    }

  }

}


let shared_publisher = null;


export function get_site_publisher(repository) {

  if (shared_publisher === null) {

    shared_publisher = new SitePublisher({
      repository: repository,
      render_origin: process.env.RENDER_ORIGIN || `http://127.0.0.1:${process.env.PORT || 3000}`,
      releases_root: process.env.SITE_RELEASES_DIR || path.join(process.cwd(), ".data", "site"),
      app_root: process.cwd(),
      keep_releases: 5,
    });

  }

  return shared_publisher;

}
