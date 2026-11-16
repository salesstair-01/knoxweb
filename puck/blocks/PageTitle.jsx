import styles from "./PageTitle.module.css";

export default function PageTitle({ title, columns = [] }) {
  return (
    <section className={styles.section}>
      <h1 className={styles.title}>{title}</h1>
      {columns.length > 0 ? (
        <div className={styles.columns}>
          {columns.map((column, index) => (
            <p key={index}>{column.text}</p>
          ))}
        </div>
      ) : null}
    </section>
  );
}
