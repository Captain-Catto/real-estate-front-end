import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "maps.googleapis.com",
      "maps.google.com",
      "datlqt-real-estate.s3.ap-southeast-2.amazonaws.com",
      "datlqt-real-estate.s3.amazonaws.com",
      "s3.ap-southeast-2.amazonaws.com",
      "s3.amazonaws.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
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
              "frame-src 'self' https://www.openstreetmap.org/ https://www.youtube.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
