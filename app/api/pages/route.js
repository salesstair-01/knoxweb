import { get_pages_repository } from "@/lib/server/pages_repository";

export async function GET() {
  return Response.json(await get_pages_repository().list_pages());
}

export async function POST(request) {
  const { slug, title } = await request.json();
  const clean_slug = String(slug || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(clean_slug) || ["admin", "api", "buy"].includes(clean_slug.split("/")[0])) {
    return Response.json({ error: "Invalid or reserved slug" }, { status: 400 });
  }
  const page = await get_pages_repository().create_page({
    slug: clean_slug,
    title: title || clean_slug,
    draft_data: { root: { props: { title: title || clean_slug, header_style: "solid" } }, content: [], zones: {} },
  });
  return Response.json(page, { status: 201 });
}
