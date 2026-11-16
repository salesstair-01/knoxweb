"use client";

import { useEffect, useState } from "react";
import Picture from "./Picture";
import styles from "./HeroCarousel.module.css";

function pad(number) {
  return String(number).padStart(2, "0");
}

export default function HeroCarousel({ slides = [], text, button_label, button_link, heading, show_counter, autoplay_seconds }) {
  const [active_index, set_active_index] = useState(0);
  const slide_count = slides.length;
  const slide = slides[active_index] || {};
  const step = (delta) => set_active_index((active_index + delta + slide_count) % slide_count);

  useEffect(() => {
    if (slide_count < 2 || !autoplay_seconds) return undefined;
    const timer = setTimeout(() => set_active_index((active_index + 1) % slide_count), autoplay_seconds * 1000);
    return () => clearTimeout(timer);
  }, [active_index, slide_count, autoplay_seconds]);

  const slide_heading = slide.heading || heading;
  const slide_button_label = slide.button_label || button_label;
  const slide_button_link = slide.button_link || button_link;

  return (
    <section className={styles.hero} aria-roledescription="carousel">
      <div className={styles.track} style={{ transform: `translateX(-${active_index * 100}%)` }}>
        {slides.map((item, index) => (
          <div className={styles.slide} key={index} aria-hidden={index !== active_index}>
            <Picture src={item.image} mobile_src={item.mobile_image} alt={item.alt} className={styles.image} eager={index === 0} />
          </div>
        ))}
      </div>
      <div className={styles.shade} aria-hidden />

      {text || show_counter ? (
        <div className={styles.panel}>
          {show_counter && slide_count > 1 ? (
            <div className={styles.counter}>
              <button aria-label="Previous slide" className={styles.arrow} onClick={() => step(-1)}>
                <span className={styles.arrow_left} />
              </button>
              <span>{pad(active_index + 1)} / {pad(slide_count)}</span>
              <button aria-label="Next slide" className={styles.arrow} onClick={() => step(1)}>
                <span className={styles.arrow_right} />
              </button>
            </div>
          ) : null}
          {text ? <p className={styles.panel_text}>{text}</p> : null}
        </div>
      ) : null}

      <div className={styles.center}>
        {slide_heading ? <h1 className={styles.heading}>{slide_heading}</h1> : null}
        <p className={styles.mobile_text}>{text}</p>
        {slide_button_label ? (
          <a href={slide_button_link || "#"} className={`k-btn ${styles.btn}`}>{slide_button_label}</a>
        ) : null}
      </div>

      {slide_count > 1 ? (
        <div className={styles.progress} aria-hidden>
          {slides.map((_, index) => (
            <span key={index} className={index === active_index ? styles.bar_active : styles.bar} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
