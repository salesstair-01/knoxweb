// Remove values that are filled at render time (live prices) before storing page data.
const RESOLVED_PROPS = { PackageGrid: ["catalog"] };

export function strip_resolved_props(page_data) {
  const clean = JSON.parse(JSON.stringify(page_data || {}));
  const clean_list = (items) => {
    for (const item of items || []) {
      for (const prop_name of RESOLVED_PROPS[item.type] || []) delete item.props[prop_name];
    }
  };
  clean_list(clean.content);
  for (const zone_items of Object.values(clean.zones || {})) clean_list(zone_items);
  return clean;
}
