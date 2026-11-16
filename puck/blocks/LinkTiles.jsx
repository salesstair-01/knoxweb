"use client";

import { useState } from "react";
import styles from "./LinkTiles.module.css";

function Arrow() {
  return (
    <svg className={styles.arrow} viewBox="0 0 32 32" aria-hidden>
      <path d="M6 26L26 6M10 6h16v16" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function LinkTiles({ label, testimonials = [], tiles = [] }) {
  const [active_index, set_active_index] = useState(0);
  const quote = testimonials[active_index];

  return (
    <section className={styles.section}>
      {label ? <h2 className={`k-label ${styles.label}`}>{label}</h2> : null}
      <div className={styles.grid}>
        {quote ? (
          <figure className={styles.quote}>
            <span className={styles.mark} aria-hidden>“</span>
            <blockquote className={styles.text}>{quote.quote}</blockquote>
            <figcaption className={styles.person}>
              {quote.avatar ? <img src={quote.avatar} alt="" className={styles.avatar} /> : null}
              <span>
                <span className={styles.name}>{quote.name}</span>
                <span className={styles.place}>● {quote.location}</span>
              </span>
            </figcaption>
            <div className={styles.dots}>
              {testimonials.map((_, index) => (
                <button key={index} aria-label={`Testimonial ${index + 1}`} onClick={() => set_active_index(index)} className={index === active_index ? styles.dot_active : styles.dot} />
              ))}
            </div>
            <span className={styles.mark_end} aria-hidden>”</span>
          </figure>
        ) : null}

        {tiles.map((tile, index) => (
          <a key={index} href={tile.link || "#"} className={styles.tile}>
            {tile.badge === "qr" ? <span className={styles.qr} aria-label="App QR code">QR</span> : <Arrow />}
            <span className={styles.tile_title}>{tile.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
