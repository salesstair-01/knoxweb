/** @type {import('next').NextConfig} */
const next_config = {
  // Self-contained server bundle for the admin/builder container.
  output: "standalone",
  images: { remotePatterns: [{ protocol: "https", hostname: "d3h5k3uy9yutcq.cloudfront.net" }] },
};

export default next_config;
