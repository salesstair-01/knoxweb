/**
 * Contract every packages source implements (mock now, middleware later).
 *
 *   list_categories()            -> [{ id, name }]
 *   list_packages(category_id)   -> [{ id, category_id, name, rate, description }]
 *   get_checkout_url(package_id) -> string
 *
 * Prices always come from the source; nothing price-related is stored in pages.
 */
export class PackagesSourceUnavailable extends Error {

  constructor(message) {

    super(message);
    this.name = "PackagesSourceUnavailable";

  }

}
