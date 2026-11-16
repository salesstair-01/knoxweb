import { site_settings } from "@/lib/site_settings";
import styles from "./Studios.module.css";

// Global block: content lives once in site settings; pages only choose to include it.
export default function Studios({ label, show_map }) {
  const studios = site_settings.studios;
  const map_query = encodeURIComponent(studios.map((studio) => studio.maps_query).join(" | "));

  return (
    <section className={styles.section}>
      <h2 className="k-label">{label || "Our Studios"}</h2>
      <div className={styles.layout}>
        <ol className={styles.list}>
          {studios.map((studio, index) => (
            <li key={studio.name} className={styles.studio}>
              <h3 className={styles.name}>{index + 1}. {studio.name}</h3>
              <p className={styles.address}>{studio.address}</p>
              <a
                className={styles.pill}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(studio.maps_query)}`}
                target="_blank"
                rel="noreferrer"
              >
                Locate on Maps
              </a>
            </li>
          ))}
        </ol>
        {show_map ? (
          <iframe
            className={styles.map}
            title="Knox studios map"
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(studios[0].maps_query)}&output=embed`}
            data-query={map_query}
          />
        ) : null}
      </div>
    </section>
  );
}
