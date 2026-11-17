/**
 * Builds what PackageGrid shows from two inputs:
 *   - prices_file: the middleware-owned prices.json (schema_version 1)
 *   - pricing_menu: which categories go under which tab (site settings, a UI edit)
 *
 * Runs in the browser. Result: { status: "ok" | "unavailable", tabs?, groups? }
 */
export const SUPPORTED_SCHEMA_VERSION = 1;


export class PriceCatalog {

  #packages_by_category = new Map();
  #pricing_menu;
  #is_valid = false;


  constructor({ prices_file, pricing_menu }) {

    this.#pricing_menu = pricing_menu;
    this.#is_valid = this.#index_packages(prices_file);

  }


  build({ mode, category_id, heading }) {

    let _catalog = { status: "unavailable" };

    if (this.#is_valid) {

      _catalog = { status: "ok" };

      if (mode === "category") {

        _catalog.groups = this.#build_groups([{ heading: heading || "", category_id: category_id }]);

      } else {

        _catalog.tabs = this.#build_tabs();

      }

    }

    return _catalog;

  }


  #index_packages(prices_file) {

    let _is_valid = false;

    const has_shape = !!prices_file
      && prices_file.schema_version === SUPPORTED_SCHEMA_VERSION
      && Array.isArray(prices_file.packages);

    if (has_shape) {

      for (const package_record of prices_file.packages) {

        const is_usable = package_record.active === true
          && typeof package_record.rate === "number"
          && !!package_record.id
          && !!package_record.category_id;

        if (is_usable) {

          if (!this.#packages_by_category.has(package_record.category_id)) {
            this.#packages_by_category.set(package_record.category_id, new Array());
          }

          this.#packages_by_category.get(package_record.category_id).push(package_record);

        }

      }

      _is_valid = true;

    }

    return _is_valid;

  }


  #build_tabs() {

    let _tabs = new Array();

    for (const menu_tab of this.#pricing_menu) {

      const tab_record = { id: menu_tab.id, label: menu_tab.label };

      if (!!menu_tab.tiers) {

        let _tiers = new Array();

        for (const menu_tier of menu_tab.tiers) {
          _tiers.push({ id: menu_tier.id, label: menu_tier.label, groups: this.#build_groups(menu_tier.groups) });
        }

        tab_record.tiers_heading = menu_tab.tiers_heading;
        tab_record.default_tier = menu_tab.default_tier;
        tab_record.tiers = _tiers;

      } else {

        tab_record.groups = this.#build_groups(menu_tab.groups);

      }

      _tabs.push(tab_record);

    }

    return _tabs;

  }


  #build_groups(menu_groups) {

    let _groups = new Array();

    for (const menu_group of menu_groups) {

      const packages = this.#packages_by_category.get(menu_group.category_id) || new Array();

      if (menu_group.split === "solo_duo") {

        _groups.push({ heading: `Solo ${menu_group.heading}`, packages: this.#to_cards(this.#filter_by_word(packages, "Solo")) });
        _groups.push({ heading: `Duo ${menu_group.heading}`, packages: this.#to_cards(this.#filter_by_word(packages, "Duo")) });

      } else {

        _groups.push({ heading: menu_group.heading, packages: this.#to_cards(packages) });

      }

    }

    return _groups;

  }


  #filter_by_word(packages, word) {

    let _matching = new Array();

    for (const package_record of packages) {

      if (package_record.name.split(" ").includes(word)) {
        _matching.push(package_record);
      }

    }

    return _matching;

  }


  #to_cards(packages) {

    let _cards = new Array();

    for (const package_record of packages) {

      _cards.push({
        id: package_record.id,
        name: package_record.name,
        rate: package_record.rate,
        description: package_record.description || "",
      });

    }

    // Cheapest first, matching the current site.
    _cards.sort((previous, next) => {
      return previous.rate - next.rate;
    });

    return _cards;

  }

}
