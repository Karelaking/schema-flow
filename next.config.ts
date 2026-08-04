import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@schema-flow/components",
    "@schema-flow/datatypes",
    "@schema-flow/db",
    "@schema-flow/generators",
    "@schema-flow/lotus-crypto",
    "@schema-flow/schema-core",
    "@schema-flow/validation"
  ],
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: ['192.168.29.142'],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    inlineCss: true,
    cssChunking: true,
    optimizePackageImports: [
      "@schema-flow/components",
      "lucide-react",
      "@xyflow/react",
      "zod",
      "@base-ui/react",
      "sql-formatter",
      "@clerk/nextjs",
      "gsap",
      "drizzle-orm",
      "react-hook-form",
      "@hookform/resolvers",
      "sonner",
      "cmdk",
      "idb-keyval",
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/(fonts|_next/static)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
