import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["motion", "lucide-react"],
    inlineCss: true,
  },
  transpilePackages: ["@chenglou/pretext"],
  env: {
    NEXT_PUBLIC_GIT_COMMIT_HASH:
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
  },
};

export default withBundleAnalyzer(nextConfig);
