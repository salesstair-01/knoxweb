"use client";

import { useState } from "react";
import { Puck, usePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import config from "@/puck/config";

const site_url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:8080";

async function send(page_id, action, data) {
  const response = await fetch(`/api/pages/${page_id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || `${action} failed`);
  return body;
}

export default function Editor({ page_id, slug, initial_data }) {
  const [status_text, set_status_text] = useState("");

  async function run(action, data) {
    set_status_text(action === "publish" ? "Publishing…" : "Saving…");
    try {
      await send(page_id, action, data);
      set_status_text(action === "publish" ? "Published to site" : "Draft saved");
    } catch (error) {
      set_status_text(error.message);
    }
  }

  function HeaderActions() {
    const { appState } = usePuck();
    return (
      <>
        <span style={{ fontSize: 13, color: "#666" }}>{status_text}</span>
        <a href={`${site_url}/${slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>View live</a>
        <button data-testid="save-draft" onClick={() => run("save_draft", appState.data)} style={{ padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6 }}>
          Save draft
        </button>
      </>
    );
  }

  return (
    <Puck
      config={config}
      data={initial_data}
      headerPath={`/${slug}`}
      onPublish={(data) => run("publish", data)}
      overrides={{ headerActions: ({ children }) => (<><HeaderActions />{children}</>) }}
      viewports={[
        { width: 390, height: "auto", label: "Mobile", icon: "Smartphone" },
        { width: 1440, height: "auto", label: "Desktop", icon: "Monitor" },
      ]}
    />
  );
}
