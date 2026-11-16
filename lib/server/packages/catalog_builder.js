import { site_settings } from "@/lib/site_settings";


/**
 * Turns the pricing menu (presentation, from site settings) plus live packages
 * (from the packages source) into the shape PackageGrid renders.
 *
 * Result: { status: "ok" | "unavailable", tabs?: [...], groups?: [...] }
 */
export class CatalogBuilder {

  #packages_source;
  #pricing_menu;


  constructor({ packages_source, pricing_menu }) {

    this.#packages_source = packages_source;
    this.#pricing_menu = pricing_menu || site_settings.pricing_menu;

  }


  async build({ mode, category_id, heading }) {

    let _catalog = { status: "ok" };

    try {

      if (mode === "category") {

        _catalog.groups = await this.#build_groups([{ heading: heading || "", category_id: category_id }]);

      } else {

        _catalog.tabs = await this.#build_tabs();

      }

    } catch (source_error) {

      _catalog = { status: "unavailable" };

    }

    return _catalog;

  }


  async #build_tabs() {

    let _tabs = new Array();

    for (const menu_tab of this.#pricing_menu) {

      const tab_record = { id: menu_tab.id, label: menu_tab.label };

      if (!!menu_tab.tiers) {

        let _tiers = new Array();

        for (const menu_tier of menu_tab.tiers) {

          const tier_groups = await this.#build_groups(menu_tier.groups);

          _tiers.push({ id: menu_tier.id, label: menu_tier.label, groups: tier_groups });

        }

        tab_record.tiers_heading = menu_tab.tiers_heading;
        tab_record.default_tier = menu_tab.default_tier;
        tab_record.tiers = _tiers;

      } else {

        tab_record.groups = await this.#build_groups(menu_tab.groups);

      }

      _tabs.push(tab_record);

    }

    return _tabs;

  }


  async #build_groups(menu_groups) {

    let _groups = new Array();

    for (const menu_group of menu_groups) {

      const packages = await this.#packages_source.list_packages(menu_group.category_id);

      if (menu_group.split === "solo_duo") {

        _groups.push({ heading: `Solo ${menu_group.heading}`, packages: this.#filter_by_word(packages, "Solo") });
        _groups.push({ heading: `Duo ${menu_group.heading}`, packages: this.#filter_by_word(packages, "Duo") });

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

    return this.#to_cards(_matching);

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
