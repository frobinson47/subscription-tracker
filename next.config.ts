import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: output: 'export' removed because dynamic routes [id] need server-side routing.
  // For static deployment, use hash-based routing or deploy to Vercel/Netlify which handle this natively.
  images: { unoptimized: true },
};

export default nextConfig;
