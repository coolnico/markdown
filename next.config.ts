import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dynamic imports of these packages
  serverExternalPackages: ["mammoth", "pdfjs-dist"],
};

export default nextConfig;
