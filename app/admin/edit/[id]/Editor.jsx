"use client";

import { useMemo, useState } from "react";
import { Puck, usePuck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import config from "@/puck/config";

async function load_catalog(params) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) query.set(key, value);
  const response = await fetch(`/api/packages/catalog?${query}`);
  return response.ok ? response.json() : { status: "unavailable" };
}

async function send(page_id, action, data) {
  const response = await fetch(`/api/pages/${page_id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, data }),
  });
  if (!response.ok) throw new Error(`${action} failed`);
  return response.json();
}

export default function Editor({ page_id, slug, initial_data }) {
  const [status_text, set_status_text] = useState("");
  const metadata = useMemo(() => ({ load_catalog }), []);

  async function run(action, data) {
    set_status_text(action === "publish" ? "Publishing…" : "Saving…");
    try {
      await send(page_id, action, data);
      set_status_text(action === "publish" ? "Published" : "Draft saved");
    } catch (error) {
      set_status_text(error.message);
    }
  }

  function HeaderActions() {
    const { appState } = usePuck();
    return (
      <>
        <span style={{ fontSize: 13, color: "#666" }}>{status_text}</span>
        <a href={`/${slug}`} target="_blank" rel="noreferrer" style={{ fontSize: 13 }}>View live</a>
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
      metadata={metadata}
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
