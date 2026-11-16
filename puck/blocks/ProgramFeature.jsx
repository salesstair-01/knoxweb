import Picture from "./Picture";
import Ticker from "./Ticker";
import styles from "./ProgramFeature.module.css";

export default function ProgramFeature({
  label, image, ticker_items, eyebrow, headline, highlight, button_label, button_link,
}) {
  return (
    <section className={styles.section}>
      {label ? <h2 className={`k-label ${styles.label}`}>{label}</h2> : null}
      <div className={styles.frame}>
        <Picture src={image} alt={eyebrow || label} className={styles.image} />
        {ticker_items && ticker_items.length > 0 ? (
          <div className={styles.ticker}>
            <Ticker items={ticker_items} style_variant="glass" embedded />
          </div>
        ) : null}
        {eyebrow ? <span className={styles.eyebrow}>• {eyebrow}</span> : null}
        <div className={styles.copy}>
          <p className={styles.headline}>
            {headline} {highlight ? <span className={styles.highlight}>{highlight}</span> : null}
          </p>
          {button_label ? (
            <a href={button_link || "#"} className={`k-btn ${styles.btn}`}>
              {button_label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
