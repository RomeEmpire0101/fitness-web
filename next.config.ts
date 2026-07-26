import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: "dist",
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
