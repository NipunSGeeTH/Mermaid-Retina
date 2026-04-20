import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "out",
  allowedDevOrigins: ["127.0.0.1", "localhost", "10.10.30.86", "*.10.10.30.86"],
};

export default nextConfig;
