import styles from "./Ticker.module.css";

export default function Ticker({ items = [], style_variant, embedded }) {
  const words = items.map((item) => item.text).filter(Boolean);
  // Repeat enough to fill wide screens; the second half makes the loop seamless.
  const run = Array.from({ length: 6 }, () => words).flat();

  return (
    <div className={`${styles.ticker} ${styles[style_variant] || styles.lime} ${embedded ? styles.embedded : ""}`}>
      <div className={styles.track}>
        {[...run, ...run].map((word, index) => (
          <span key={index} className={styles.item}>
            {word}
            <span className={styles.star} aria-hidden>✱</span>
          </span>
        ))}
      </div>
    </div>
  );
}
