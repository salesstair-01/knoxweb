import { notFound, redirect } from "next/navigation";
import { Render, resolveAllData } from "@puckeditor/core";
import config from "@/puck/config";
import { get_pages_repository } from "@/lib/server/pages_repository";
import { PageVisibility } from "@/lib/server/page_visibility";
import { server_catalog_metadata } from "@/lib/server/catalog_metadata";

// Short ISR window: picks up price changes and publish_at/expire_at boundaries.
// Publishing also revalidates the page immediately.
export const revalidate = 60;

const RESERVED = new Set(["admin", "api", "buy", "_next"]);

async function load_live_page(slug_parts) {
  const slug = (slug_parts || []).join("/");
  if (RESERVED.has(slug.split("/")[0])) return { page: null };
  const page = await get_pages_repository().get_published_by_slug(slug);
  if (!page) return { page: null };
  return { page, state: new PageVisibility().state_of(page) };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { page, state } = await load_live_page(slug);
  if (!page || state !== "live") return {};
  return { title: page.published_data.root?.props?.title || page.title };
}

export default async function PublicPage({ params }) {
  const { slug } = await params;
  const { page, state } = await load_live_page(slug);

  if (!page || state === "not_yet") notFound();
  // 307, not 301: the slug may be reused for a later campaign.
  if (state === "expired") redirect(page.expired_redirect || "/pricing-plans");

  const metadata = server_catalog_metadata();
  const resolved = await resolveAllData(page.published_data, config, metadata);

  return <Render config={config} data={resolved} />;
}
