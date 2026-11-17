// On boot, export the site once if no release exists yet (fresh volume).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { get_pages_repository } = await import("./lib/server/pages_repository");
  const { get_site_publisher } = await import("./lib/server/site_publisher");
  const publisher = get_site_publisher(get_pages_repository());

  setTimeout(async () => {
    try {
      if (!(await publisher.has_current_release())) {
        const release = await publisher.publish_site();
        console.log(`[publisher] initial release ${release.release_id} (${release.page_count} pages)`);
      }
    } catch (publish_error) {
      console.error("[publisher] initial export failed:", publish_error.message);
    }
  }, 3000);
}
