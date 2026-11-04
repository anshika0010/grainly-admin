import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */

const nextConfig = {
  output: "standalone",

  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },

  allowedDevOrigins: [
    "192.168.29.177",
    "192.168.29.59",
  ],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: "http://66.116.242.51:3017/barcraft/:path*",
      },
    ];
  },
};

export default nextConfig;