import { CatalogBuilder } from "@/lib/server/packages/catalog_builder";
import { get_packages_source } from "@/lib/server/packages";

// Used by the editor preview; the public page resolves the same data on the server.
export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const builder = new CatalogBuilder({ packages_source: get_packages_source() });
  const catalog = await builder.build({
    mode: params.get("mode"),
    category_id: params.get("category_id"),
    heading: params.get("heading"),
  });
  return Response.json(catalog);
}
