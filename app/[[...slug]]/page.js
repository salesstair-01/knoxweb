import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Render } from "@puckeditor/core";
import config from "@/puck/config";
import { get_pages_repository } from "@/lib/server/pages_repository";
import { PageVisibility } from "@/lib/server/page_visibility";
import { is_render_request } from "@/lib/server/render_token";

// This app is the admin + builder. The public site is the static export served
// by site-server; these routes exist so the publisher (and staff) can render pages.
// Prices are not part of the page: PackageGrid reads prices.json in the browser.
export const dynamic = "force-dynamic";

const RESERVED = new Set(["admin", "api", "data", "_next"]);

async function load_page(slug_parts) {
  const slug = (slug_parts || []).join("/");
  if (RESERVED.has(slug.split("/")[0])) return { page: null };
  const page = await get_pages_repository().get_published_by_slug(slug);
  if (!page) return { page: null };

  // The publisher exports scheduled pages ahead of time; site-server enforces the dates.
  const for_publisher = is_render_request(await headers());
  const state = for_publisher ? "live" : new PageVisibility().state_of(page);
  return { page, state };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { page, state } = await load_page(slug);
  if (!page || state !== "live") return {};
  return { title: page.published_data.root?.props?.title || page.title };
}

export default async function PublicPage({ params }) {
  const { slug } = await params;
  const { page, state } = await load_page(slug);

  if (!page || state === "not_yet") notFound();
  // 307, not 301: the slug may be reused for a later campaign.
  if (state === "expired") redirect(page.expired_redirect || "/pricing-plans");

  return <Render config={config} data={page.published_data} />;
}
