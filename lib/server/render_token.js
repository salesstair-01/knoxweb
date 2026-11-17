// Shared secret between the publisher and the renderer. In the POC it falls back
// to a fixed dev value; set RENDER_TOKEN in any shared environment.
export const render_token = process.env.RENDER_TOKEN || "dev-render-token";

export function is_render_request(request_headers) {
  return request_headers.get("x-render-token") === render_token;
}
