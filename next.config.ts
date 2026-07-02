import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF (preferred) and WebP when browser supports them,
    // for images served via next/image. Confirmed in Next.js 16 docs.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
