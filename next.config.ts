import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  basePath: "/Mermaid-Retina",
  assetPrefix: "/Mermaid-Retina/",
  allowedDevOrigins: ["10.10.30.86", "*.10.10.30.86"],
};

export default nextConfig;
