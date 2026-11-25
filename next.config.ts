import type { NextConfig } from "next";

const localPractice = process.env.NODE_ENV === "development" && process.env.CODELINGO_DATA_SOURCE === "sqlite";

const nextConfig: NextConfig = {
  // Local detail pages can return a 404 before streaming a response.
  cacheComponents: !localPractice,
  partialPrefetching: !localPractice,
  outputFileTracingExcludes: {
    "/*": ["./content/problems/**/answer.json", "./data/**"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
