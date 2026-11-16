import { get_packages_source } from "@/lib/server/packages";

// Checkout URL is fetched at click time so it always reflects the live price.
export async function GET(request, { params }) {
  const { package_id } = await params;
  const checkout_url = await get_packages_source().get_checkout_url(package_id);
  return Response.redirect(checkout_url, 307);
}
