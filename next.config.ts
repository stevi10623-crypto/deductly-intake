import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* output: 'export', // Disabled to support Server Actions */
  images: {
    /* unoptimized: true, // Disabled, Vercel supports optimization */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
};

export default nextConfig;
