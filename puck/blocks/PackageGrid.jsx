"use client";

import { useState } from "react";
import styles from "./PackageGrid.module.css";

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
        <a href={`/buy/${item.id}?gift=1`} className={styles.gift}>Gift Session</a>
        <a href={`/buy/${item.id}`} className={styles.buy}>Buy Credit Pack</a>
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

export default function PackageGrid({ catalog, default_tab }) {
  let body = <p className={styles.notice}>Loading packages…</p>;

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
