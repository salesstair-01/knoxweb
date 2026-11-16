import { CardRow } from "./ImageCards";
import styles from "./IntroText.module.css";

// Mobile order: label, lead, cards, side prompt. Desktop: lead + side prompt in a row, cards below.
export default function IntroText({ label, lead, aside_text, aside_button_label, aside_button_link, cards = [], spacing }) {
  const has_cards = cards && cards.length > 0;
  return (
    <section className={`${styles.intro} ${styles[spacing] || ""}`}>
      {label ? <h2 className="k-label">{label}</h2> : null}
      <div className={styles.row}>
        <div className={`${styles.lead} k-rich`}>{lead}</div>
        {aside_text ? (
          <div className={styles.aside}>
            <p className={styles.aside_text}>{aside_text}</p>
            {aside_button_label ? (
              <a href={aside_button_link || "#"} className={`k-btn k-btn--sm ${styles.aside_btn}`}>
                {aside_button_label}
              </a>
            ) : null}
          </div>
        ) : null}
        {has_cards ? (
          <div className={styles.cards}>
            <CardRow items={cards} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
