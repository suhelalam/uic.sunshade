import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@firebase/firestore": path.resolve(__dirname, "node_modules/@firebase/firestore"),
      "@firebase/app": path.resolve(__dirname, "node_modules/@firebase/app"),
    };
    return config;
  },
};

export default nextConfig;
