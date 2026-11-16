"use client";

import { useState } from "react";
import styles from "./Accordion.module.css";

export default function Accordion({ label, heading, body, items = [], layout }) {
  const [open_index, set_open_index] = useState(-1);

  return (
    <section className={`${styles.section} ${layout === "stacked" ? styles.stacked : styles.split}`}>
      <div className={styles.intro}>
        {label ? <h2 className="k-label">{label}</h2> : null}
        {heading ? <p className={styles.heading}>{heading}</p> : null}
        {body ? <p className={styles.body}>{body}</p> : null}
      </div>
      <ul className={styles.list}>
        {items.map((item, index) => {
          const is_open = index === open_index;
          return (
            <li key={index} className={styles.item}>
              <button
                className={styles.question}
                aria-expanded={is_open}
                onClick={() => set_open_index(is_open ? -1 : index)}
              >
                <span>{item.question}</span>
                <svg className={is_open ? styles.chev_open : styles.chev} width="22" height="22" viewBox="0 0 16 16" aria-hidden>
                  <path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
              {is_open ? <div className={`${styles.answer} k-rich`}>{item.answer}</div> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
