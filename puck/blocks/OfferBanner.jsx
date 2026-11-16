"use client";

import { useEffect, useState } from "react";
import styles from "./OfferBanner.module.css";

function remaining_parts(target_ms, now_ms) {
  const total = Math.max(0, target_ms - now_ms);
  return {
    days: Math.floor(total / 86400000),
    hours: Math.floor(total / 3600000) % 24,
    minutes: Math.floor(total / 60000) % 60,
    seconds: Math.floor(total / 1000) % 60,
  };
}

export default function OfferBanner({ heading, text, button_label, button_link, countdown_to, style_variant }) {
  // Countdown is computed only on the client to avoid a server/client mismatch.
  const [now_ms, set_now_ms] = useState(null);
  const target_ms = countdown_to ? new Date(countdown_to).getTime() : NaN;

  useEffect(() => {
    if (Number.isNaN(target_ms)) return undefined;
    set_now_ms(Date.now());
    const timer = setInterval(() => set_now_ms(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target_ms]);

  const parts = now_ms === null || Number.isNaN(target_ms) ? null : remaining_parts(target_ms, now_ms);

  return (
    <section className={`${styles.banner} ${styles[style_variant] || styles.lime}`}>
      <div className={styles.copy}>
        <h2 className={styles.heading}>{heading}</h2>
        {text ? <p className={styles.text}>{text}</p> : null}
      </div>
      {parts ? (
        <div className={styles.countdown} aria-label="Offer ends in">
          {[["days", "Days"], ["hours", "Hrs"], ["minutes", "Min"], ["seconds", "Sec"]].map(([key, unit]) => (
            <span key={key} className={styles.unit}>
              <strong>{String(parts[key]).padStart(2, "0")}</strong>
              {unit}
            </span>
          ))}
        </div>
      ) : null}
      {button_label ? (
        <a href={button_link || "#"} className={`k-btn ${style_variant === "dark" ? "" : "k-btn--dark"} ${styles.btn}`}>
          {button_label}
        </a>
      ) : null}
    </section>
  );
}
