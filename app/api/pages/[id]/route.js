import { get_pages_repository } from "@/lib/server/pages_repository";
import { get_site_publisher } from "@/lib/server/site_publisher";

// PUT { action: "save_draft" | "publish" | "unpublish" | "schedule", data, schedule }
// Publish/unpublish re-export the static site; saving a draft never touches it.
export async function PUT(request, { params }) {
  const { id } = await params;
  const { action, data, schedule } = await request.json();
  const repository = get_pages_repository();

  let page = null;
  if (action === "save_draft") page = await repository.save_draft(id, data || null);
  if (action === "publish") page = await repository.publish(id, data || null);
  if (action === "unpublish") page = await repository.unpublish(id);
  // POC: no scheduling screen yet; dates are set through this action.
  if (action === "schedule") page = await repository.set_schedule(id, schedule || {});
  if (!page) return Response.json({ error: "Not found or bad action" }, { status: 404 });

  let release = null;
  if (action !== "save_draft") {
    try {
      release = await get_site_publisher(repository).publish_site();
    } catch (publish_error) {
      // The page is saved; the live site keeps its previous release.
      return Response.json({ error: `Saved, but the site export failed: ${publish_error.message}` }, { status: 502 });
    }
  }

  return Response.json({ id: page.id, status: page.status, updated_at: page.updated_at, release });
}
