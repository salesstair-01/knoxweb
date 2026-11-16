import { CatalogBuilder } from "./packages/catalog_builder";
import { get_packages_source } from "./packages";

// Puck metadata used when resolving pages on the server.
export function server_catalog_metadata() {
  const builder = new CatalogBuilder({ packages_source: get_packages_source() });
  return { load_catalog: (params) => builder.build(params) };
}
