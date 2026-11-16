"use client";

import { useState } from "react";
import Picture from "./Picture";
import styles from "./FeatureSlider.module.css";

export default function FeatureSlider({ label, slides = [] }) {
  const [active_index, set_active_index] = useState(0);
  const slide_count = slides.length;
  const slide = slides[active_index] || {};
  const step = (delta) => set_active_index((active_index + delta + slide_count) % slide_count);

  return (
    <section className={styles.section}>
      <div className={styles.top}>
        {label ? <h2 className={`k-label ${styles.label}`}>{label}</h2> : null}
        <p className={styles.kicker}>
          {slide.kicker} <strong>{slide.kicker_strong}</strong>
        </p>
      </div>

      <div className={styles.media}>
        <Picture src={slide.image} alt={slide.title} className={styles.image} />
      </div>

      <h3 className={styles.title}>{slide.title}</h3>

      <div className={styles.control}>
        <div className={styles.counter}>
          <button aria-label="Previous" onClick={() => step(-1)}>◂</button>
          <span>
            {String(active_index + 1).padStart(2, "0")} / {String(slide_count).padStart(2, "0")}
          </span>
          <button aria-label="Next" onClick={() => step(1)}>▸</button>
        </div>
        <p className={styles.control_text}>
          {slide.kicker}
          <br />
          <strong>{slide.kicker_strong}</strong>
        </p>
      </div>

      <div className={styles.thumbs}>
        {slides.map((thumb, index) => (
          <button key={index} onClick={() => set_active_index(index)} aria-label={`Show ${index + 1}`} className={index === active_index ? styles.thumb_active : styles.thumb}>
            <Picture src={thumb.image} alt="" className={styles.thumb_img} />
          </button>
        ))}
      </div>

      <div className={styles.copy}>
        <h3 className={styles.mobile_title}>{slide.title}</h3>
        <div className={`${styles.body} k-rich`}>{slide.body}</div>
        {slide.button_label ? (
          <a href={slide.button_link || "#"} className={`k-btn ${styles.btn}`}>{slide.button_label}</a>
        ) : null}
      </div>
    </section>
  );
}
