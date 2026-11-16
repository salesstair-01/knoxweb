"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { site_settings } from "@/lib/site_settings";
import Wordmark from "./Wordmark";
import styles from "./Header.module.css";

export default function Header({ overlay }) {
  const [menu_open, set_menu_open] = useState(false);
  const pathname = usePathname();
  const { nav_links, cta } = site_settings.header;

  return (
    <header className={`${styles.header} ${overlay ? styles.overlay : ""}`}>
      <a href="/" className={styles.logo}>
        <Wordmark />
      </a>

      <nav className={styles.nav} aria-label="Main">
        {nav_links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={pathname === link.href ? styles.active : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <a href={cta.href} className={`k-btn k-btn--sm ${styles.cta}`}>
        {cta.label}
      </a>

      <button
        className={styles.burger}
        aria-label={menu_open ? "Close menu" : "Open menu"}
        aria-expanded={menu_open}
        onClick={() => set_menu_open(!menu_open)}
      >
        <span />
        <span />
        <span />
      </button>

      {menu_open && (
        <div className={styles.sheet}>
          {nav_links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
          <a href={cta.href} className="k-btn k-btn--block">
            {cta.label}
          </a>
        </div>
      )}
    </header>
  );
}
