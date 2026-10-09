import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // PGlite loads its WebAssembly and data files at runtime; keep it out of the bundle.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Images in public/ are already sized for the page. On-the-fly optimization
  // needs sharp and a decision on where images are served from (Phase 5).
  images: { unoptimized: true },
};

export default nextConfig;
