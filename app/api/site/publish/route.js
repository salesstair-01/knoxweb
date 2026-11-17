import { get_pages_repository } from "@/lib/server/pages_repository";
import { get_site_publisher } from "@/lib/server/site_publisher";

// Re-export the whole site (e.g. after a header/footer change or a deploy).
export async function POST() {
  try {
    const release = await get_site_publisher(get_pages_repository()).publish_site();
    return Response.json(release);
  } catch (publish_error) {
    return Response.json({ error: publish_error.message }, { status: 502 });
  }
}
