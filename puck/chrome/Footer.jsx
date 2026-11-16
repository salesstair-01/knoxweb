import { site_settings } from "@/lib/site_settings";
import Wordmark from "./Wordmark";
import styles from "./Footer.module.css";

export default function Footer() {
  const { columns, copyright } = site_settings.footer;

  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        {columns.map((column) => (
          <div key={column.title}>
            <h4 className={styles.title}>{column.title}</h4>
            <ul className={styles.links}>
              {column.links.map((link) =>
                link.href ? (
                  <li key={link.label}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ) : (
                  <li key={link.label}>{link.label}</li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className={styles.bottom}>
        <span>{copyright}</span>
        <Wordmark size={20} />
        <span />
      </div>
    </footer>
  );
}
