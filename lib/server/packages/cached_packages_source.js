/**
 * Wraps any packages source with a short in-memory cache.
 * If the upstream fails, the last good answer is served (stale);
 * with nothing cached, the error is re-thrown so the block shows its fallback.
 */
export class CachedPackagesSource {

  #upstream;
  #ttl_ms;
  #entries = new Map();


  constructor({ upstream, ttl_ms }) {

    this.#upstream = upstream;
    this.#ttl_ms = ttl_ms;

  }


  async list_categories() {

    const categories = await this.#cached("categories", () => {
      return this.#upstream.list_categories();
    });

    return categories;

  }


  async list_packages(category_id) {

    const packages = await this.#cached(`packages:${category_id}`, () => {
      return this.#upstream.list_packages(category_id);
    });

    return packages;

  }


  async get_checkout_url(package_id) {

    // Never cached: checkout must always reflect the live price.
    const checkout_url = await this.#upstream.get_checkout_url(package_id);

    return checkout_url;

  }


  async #cached(cache_key, load_value) {

    const cache_entry = this.#entries.get(cache_key);
    const now = Date.now();
    let _value = null;

    if (!!cache_entry && now - cache_entry.stored_at < this.#ttl_ms) {

      _value = cache_entry.value;

    } else {

      try {

        _value = await load_value();
        this.#entries.set(cache_key, { value: _value, stored_at: now });

      } catch (load_error) {

        if (!cache_entry) {
          throw load_error;
        }

        _value = cache_entry.value;

      }

    }

    return _value;

  }

}
