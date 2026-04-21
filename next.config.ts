import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output mode for efficient Docker deployments
  output: "standalone",
};

export default nextConfig;
