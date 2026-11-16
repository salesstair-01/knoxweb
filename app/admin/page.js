import { get_pages_repository } from "@/lib/server/pages_repository";
import NewPageForm from "./NewPageForm";
import styles from "./admin.module.css";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const pages = await get_pages_repository().list_pages();
  return (
    <div className={styles.admin}>
      <h1>Pages</h1>
      <table className={styles.table}>
        <thead>
          <tr><th>Page</th><th>URL</th><th>Status</th><th /></tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id}>
              <td>{page.title}</td>
              <td><a href={`/${page.slug}`} target="_blank" rel="noreferrer">/{page.slug}</a></td>
              <td>
                {page.status}
                {page.status === "published" && page.has_unpublished_changes ? " (unpublished changes)" : ""}
              </td>
              <td><a className={styles.edit} href={`/admin/edit/${page.id}`}>Edit</a></td>
            </tr>
          ))}
        </tbody>
      </table>
      <NewPageForm />
    </div>
  );
}
