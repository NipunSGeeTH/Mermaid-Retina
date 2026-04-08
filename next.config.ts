import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  ...(isProduction && {
    basePath: "/Mermaid-Retina",
    assetPrefix: "/Mermaid-Retina/",
  }),
  allowedDevOrigins: ["127.0.0.1", "localhost", "10.10.30.86", "*.10.10.30.86"],
};

export default nextConfig;
