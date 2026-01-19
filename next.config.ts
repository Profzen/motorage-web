import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["swagger-jsdoc"],
  // Ensure source files are available for swagger-jsdoc scanning on Vercel
  outputFileTracingIncludes: {
    "/api/swagger": ["./src/app/api/**/*.ts", "./src/app/api/**/*.js"],
  },
};

export default nextConfig;
