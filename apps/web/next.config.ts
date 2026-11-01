import type { NextConfig } from "next";

// GitHub Pages build (DEPLOY_PAGES=1): static export served under /<repo>.
// Local dev and the regular CI build stay a normal Next server app.
const pages = process.env.DEPLOY_PAGES === "1";
const basePath = pages ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  ...(pages && { output: "export", trailingSlash: true, images: { unoptimized: true } }),
  basePath,
};

export default nextConfig;
