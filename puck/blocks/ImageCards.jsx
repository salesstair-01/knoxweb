"use client";

import { useRef, useState } from "react";
import Picture from "./Picture";
import styles from "./ImageCards.module.css";

// Grid on desktop; swipeable row with dots on mobile.
export function CardRow({ items = [] }) {
  const row_ref = useRef(null);
  const [active_index, set_active_index] = useState(0);

  function on_scroll() {
    const row = row_ref.current;
    if (row) set_active_index(Math.round(row.scrollLeft / row.clientWidth));
  }

  return (
    <>
      <ul className={styles.cards} ref={row_ref} onScroll={on_scroll}>
        {items.map((item, index) => {
          const body = (
            <>
              <Picture src={item.image} alt={item.label} className={styles.image} />
              <span className={styles.caption}>• {item.label}</span>
            </>
          );
          return (
            <li key={index} className={styles.card}>
              {item.link ? <a href={item.link}>{body}</a> : body}
            </li>
          );
        })}
      </ul>
      {items.length > 1 ? (
        <div className={styles.dots} aria-hidden>
          {items.map((_, index) => (
            <span key={index} className={index === active_index ? styles.dot_active : styles.dot} />
          ))}
        </div>
      ) : null}
    </>
  );
}

export default function ImageCards({ items = [] }) {
  return (
    <section className={styles.wrap}>
      <CardRow items={items} />
    </section>
  );
}
