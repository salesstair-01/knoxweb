"use client";

import { useEffect, useState } from "react";
import { site_settings } from "@/lib/site_settings";
import { PriceCatalog } from "@/lib/prices/price_catalog";
import { prices_url, checkout_base_url } from "@/lib/prices/prices_config";
import styles from "./PackageGrid.module.css";

function checkout_link(package_id, is_gift) {
  const params = new URLSearchParams({ item_id: package_id });
  if (is_gift) params.set("gift", "1");
  return `${checkout_base_url}?${params}`;
}

// Fetched once per page view and shared by every PackageGrid on the page.
let prices_request = null;

function load_prices_file() {
  if (prices_request === null) {
    prices_request = fetch(prices_url, { cache: "no-cache" })
      .then((response) => (response.ok ? response.json() : null))
      .catch(() => null);
  }
  return prices_request;
}

function format_rate(rate) {
  return `₹${rate}++`;
}

function PackageCard({ item }) {
  return (
    <li className={styles.card}>
      <h3 className={styles.name}>{item.name}</h3>
      <p className={styles.price}>{format_rate(item.rate)}</p>
      <p className={styles.desc}>
        {item.description ? (
          <>
            <span className={styles.diamond} aria-hidden>◆</span>
            <span>{item.description}</span>
          </>
        ) : null}
      </p>
      <div className={styles.actions}>
        <a href={checkout_link(item.id, true)} className={styles.gift}>Gift Session</a>
        <a href={checkout_link(item.id, false)} className={styles.buy}>Buy Credit Pack</a>
      </div>
    </li>
  );
}

function Groups({ groups }) {
  return groups.map((group, index) =>
    group.packages.length > 0 ? (
      <div key={index} className={styles.group}>
        {group.heading ? <h2 className={styles.group_heading}>{group.heading}</h2> : null}
        <ul className={styles.grid}>
          {group.packages.map((item) => (
            <PackageCard key={item.id} item={item} />
          ))}
        </ul>
      </div>
    ) : null,
  );
}

function Pills({ options, active_id, on_pick, small }) {
  return (
    <div className={`${styles.pills} ${small ? styles.pills_small : ""}`} role="tablist">
      {options.map((option) => (
        <button
          key={option.id}
          role="tab"
          aria-selected={option.id === active_id}
          className={option.id === active_id ? styles.pill_active : styles.pill}
          onClick={() => on_pick(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Tabs({ tabs, default_tab }) {
  const first_id = tabs.some((tab) => tab.id === default_tab) ? default_tab : tabs[0]?.id;
  const [tab_id, set_tab_id] = useState(first_id);
  const [tier_by_tab, set_tier_by_tab] = useState({});
  const tab = tabs.find((candidate) => candidate.id === tab_id) || tabs[0];
  const tier_id = tier_by_tab[tab.id] || tab.default_tier || tab.tiers?.[0]?.id;
  const tier = tab.tiers?.find((candidate) => candidate.id === tier_id);

  return (
    <>
      <Pills options={tabs} active_id={tab.id} on_pick={set_tab_id} />
      {tab.tiers ? (
        <>
          <h2 className={styles.tiers_heading}>{tab.tiers_heading}</h2>
          <Pills
            small
            options={tab.tiers}
            active_id={tier_id}
            on_pick={(id) => set_tier_by_tab({ ...tier_by_tab, [tab.id]: id })}
          />
          {tier ? <Groups groups={tier.groups} /> : null}
        </>
      ) : (
        <Groups groups={tab.groups} />
      )}
    </>
  );
}

function PlaceholderCards() {
  return (
    <ul className={styles.grid} aria-busy="true" aria-label="Loading prices">
      {[0, 1, 2].map((index) => (
        <li key={index} className={`${styles.card} ${styles.placeholder}`} />
      ))}
    </ul>
  );
}

export default function PackageGrid({ mode, category_id, heading, default_tab }) {
  const [catalog, set_catalog] = useState(null);

  useEffect(() => {
    let is_current = true;
    load_prices_file().then((prices_file) => {
      if (!is_current) return;
      const price_catalog = new PriceCatalog({ prices_file, pricing_menu: site_settings.pricing_menu });
      set_catalog(price_catalog.build({ mode, category_id, heading }));
    });
    return () => {
      is_current = false;
    };
  }, [mode, category_id, heading]);

  let body = <PlaceholderCards />;

  if (catalog && catalog.status === "unavailable") {
    body = (
      <p className={styles.notice}>
        Prices are temporarily unavailable. Please call us or check the Knox app.
      </p>
    );
  } else if (catalog && catalog.tabs) {
    body = <Tabs tabs={catalog.tabs} default_tab={default_tab} />;
  } else if (catalog && catalog.groups) {
    body = <Groups groups={catalog.groups} />;
  }

  return <section className={styles.section}>{body}</section>;
}
