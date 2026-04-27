import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-e28f392d-9dc8-47e6-a734-0ee51dc5ec65.space.z.ai",
  ],
};

export default nextConfig;
