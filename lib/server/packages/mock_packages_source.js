import mock_catalog from "./mock_catalog.json";


/**
 * Static snapshot of the live site's packages (captured 2026-11-16).
 * Stands in for the Zoho middleware until real endpoints are provided.
 */
export class MockPackagesSource {

  async list_categories() {

    let _categories = new Array();

    for (const category of mock_catalog.categories) {
      _categories.push({ id: category.id, name: category.name });
    }

    return _categories;

  }


  async list_packages(category_id) {

    let _packages = new Array();

    for (const package_record of mock_catalog.packages) {

      if (package_record.category_id === category_id && package_record.status === "active") {
        _packages.push(package_record);
      }

    }

    return _packages;

  }


  async get_checkout_url(package_id) {

    return `https://example.invalid/checkout?item_id=${encodeURIComponent(package_id)}`;

  }

}
