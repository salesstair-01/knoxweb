import { notFound } from "next/navigation";
import { get_pages_repository } from "@/lib/server/pages_repository";
import Editor from "./Editor";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }) {
  const { id } = await params;
  const page = await get_pages_repository().get_page(id);
  if (!page) notFound();
  return <Editor page_id={page.id} slug={page.slug} initial_data={page.draft_data} />;
}
