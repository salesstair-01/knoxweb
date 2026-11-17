import { revalidatePath } from "next/cache";
import { get_pages_repository } from "@/lib/server/pages_repository";

// PUT { action: "save_draft" | "publish" | "unpublish", data }
export async function PUT(request, { params }) {
  const { id } = await params;
  const { action, data } = await request.json();
  const repository = get_pages_repository();
  const clean_data = data || null;

  let page = null;
  if (action === "save_draft") page = await repository.save_draft(id, clean_data);
  if (action === "publish") page = await repository.publish(id, clean_data);
  if (action === "unpublish") page = await repository.unpublish(id);
  if (!page) return Response.json({ error: "Not found or bad action" }, { status: 404 });

  if (action !== "save_draft") revalidatePath(`/${page.slug}`);
  return Response.json({ id: page.id, status: page.status, updated_at: page.updated_at });
}
