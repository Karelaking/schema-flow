import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: ['192.168.29.142'],
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: [
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
};

export default nextConfig;
