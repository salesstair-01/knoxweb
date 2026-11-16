import Picture from "./Picture";
import styles from "./HeadingCta.module.css";

export default function HeadingCta({ heading, button_label, button_link, variant, left_image, right_image }) {
  const with_images = variant === "side_images";
  return (
    <section className={`${styles.section} ${with_images ? styles.with_images : styles.plain}`}>
      {with_images ? <Picture src={left_image} alt="" className={styles.side_left} /> : null}
      <div className={styles.center}>
        <h2 className={styles.heading}>{heading}</h2>
        {button_label ? (
          <a href={button_link || "#"} className={`k-btn ${styles.btn}`}>{button_label}</a>
        ) : null}
      </div>
      {with_images ? <Picture src={right_image} alt="" className={styles.side_right} /> : null}
    </section>
  );
}
