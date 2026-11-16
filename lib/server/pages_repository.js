import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";


/**
 * Storage for CMS pages. Drafts and published content are kept apart:
 * saving a draft never touches `published_data`.
 *
 * Page record:
 *   id, slug, title, status ("draft" | "published"),
 *   draft_data, published_data, published_at,
 *   publish_at, expire_at, expired_redirect, created_at, updated_at
 *
 * This JSON-file adapter is for the POC only. A MySQL adapter implements the
 * same public methods.
 */
export class JsonFilePagesRepository {

  #file_path;
  #seed_dir;
  #pending_work = Promise.resolve();


  constructor({ file_path, seed_dir }) {

    this.#file_path = file_path;
    this.#seed_dir = seed_dir;

  }


  async list_pages() {

    const pages = await this.#read_all();
    let _summaries = new Array();

    for (const page of pages) {

      _summaries.push({
        id: page.id,
        slug: page.slug,
        title: page.title,
        status: page.status,
        has_unpublished_changes: page.status === "draft" || JSON.stringify(page.draft_data) !== JSON.stringify(page.published_data),
        updated_at: page.updated_at,
      });

    }

    _summaries.sort((previous, next) => {
      return previous.slug.localeCompare(next.slug);
    });

    return _summaries;

  }


  async get_page(id) {

    const pages = await this.#read_all();
    let _found = null;

    for (const page of pages) {

      if (page.id === id) {

        _found = page;
        break;

      }

    }

    return _found;

  }


  async get_published_by_slug(slug) {

    const pages = await this.#read_all();
    let _found = null;

    for (const page of pages) {

      if (page.slug === slug && page.status === "published" && !!page.published_data) {

        _found = page;
        break;

      }

    }

    return _found;

  }


  async create_page({ slug, title, draft_data }) {

    const pages = await this.#read_all();
    const now = new Date().toISOString();

    const page_record = {
      id: crypto.randomUUID(),
      slug: slug,
      title: title,
      status: "draft",
      draft_data: draft_data,
      published_data: null,
      published_at: null,
      publish_at: null,
      expire_at: null,
      expired_redirect: "/pricing-plans",
      created_at: now,
      updated_at: now,
    };

    pages.push(page_record);

    await this.#write_all(pages);

    return page_record;

  }


  async save_draft(id, draft_data) {

    const page_record = await this.#update(id, (page) => {

      page.draft_data = draft_data;

    });

    return page_record;

  }


  async publish(id, draft_data) {

    const page_record = await this.#update(id, (page) => {

      if (!!draft_data) {
        page.draft_data = draft_data;
      }

      page.published_data = page.draft_data;
      page.published_at = new Date().toISOString();
      page.status = "published";

    });

    return page_record;

  }


  async unpublish(id) {

    const page_record = await this.#update(id, (page) => {

      page.status = "draft";

    });

    return page_record;

  }


  async #update(id, apply_change) {

    const pages = await this.#read_all();
    let _updated = null;

    for (const page of pages) {

      if (page.id === id) {

        apply_change(page);
        page.updated_at = new Date().toISOString();
        _updated = page;
        break;

      }

    }

    if (!!_updated) {
      await this.#write_all(pages);
    }

    return _updated;

  }


  // Reads and writes run one at a time so concurrent requests never interleave.
  #serialised(work) {

    const queued_work = this.#pending_work.then(work, work);

    this.#pending_work = queued_work.catch(() => null);

    return queued_work;

  }


  async #read_all() {

    const pages = await this.#serialised(() => {
      return this.#read_from_disk();
    });

    return pages;

  }


  async #read_from_disk() {

    let _pages = new Array();

    try {

      const file_text = await fs.readFile(this.#file_path, "utf8");
      _pages = JSON.parse(file_text);

    } catch (read_error) {

      if (read_error.code !== "ENOENT") {
        throw read_error;
      }

      _pages = await this.#load_seed();
      await this.#write_to_disk(_pages);

    }

    return _pages;

  }


  async #load_seed() {

    const seed_files = await fs.readdir(this.#seed_dir);
    const now = new Date().toISOString();
    let _pages = new Array();

    for (const seed_file of seed_files) {

      if (seed_file.endsWith(".json")) {

        const seed_text = await fs.readFile(path.join(this.#seed_dir, seed_file), "utf8");
        const seed_page = JSON.parse(seed_text);

        _pages.push({
          id: seed_page.id,
          slug: seed_page.slug,
          title: seed_page.title,
          status: "published",
          draft_data: seed_page.data,
          published_data: seed_page.data,
          published_at: now,
          publish_at: null,
          expire_at: null,
          expired_redirect: "/pricing-plans",
          created_at: now,
          updated_at: now,
        });

      }

    }

    return _pages;

  }


  async #write_all(pages) {

    await this.#serialised(() => {
      return this.#write_to_disk(pages);
    });

  }


  async #write_to_disk(pages) {

    await fs.mkdir(path.dirname(this.#file_path), { recursive: true });

    const temp_path = `${this.#file_path}.${crypto.randomUUID()}.tmp`;

    await fs.writeFile(temp_path, JSON.stringify(pages, null, 2));
    await fs.rename(temp_path, this.#file_path);

  }

}


let shared_repository = null;


export function get_pages_repository() {

  if (shared_repository === null) {

    shared_repository = new JsonFilePagesRepository({
      file_path: path.join(process.cwd(), ".data", "pages.json"),
      seed_dir: path.join(process.cwd(), "seed", "pages"),
    });

  }

  return shared_repository;

}
