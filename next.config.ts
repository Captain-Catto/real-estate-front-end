import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["maps.googleapis.com", "maps.google.com"],
  },
  // Allow iframe từ Google Maps
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
