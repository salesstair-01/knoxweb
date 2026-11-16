"use client";

import { useState } from "react";
import styles from "./admin.module.css";

export default function NewPageForm() {
  const [error_text, set_error_text] = useState("");

  async function create_page(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/pages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: form.get("title"), slug: form.get("slug") }),
    });
    const body = await response.json();
    if (!response.ok) set_error_text(body.error);
    else window.location.href = `/admin/edit/${body.id}`;
  }

  return (
    <form className={styles.form} onSubmit={create_page}>
      <h2>New page</h2>
      <input name="title" placeholder="Title, e.g. Diwali Sale" required />
      <input name="slug" placeholder="URL, e.g. diwali-sale" required />
      <button type="submit">Create</button>
      {error_text ? <p className={styles.error}>{error_text}</p> : null}
    </form>
  );
}
