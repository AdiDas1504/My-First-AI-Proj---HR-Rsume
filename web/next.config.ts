import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Request-time pages (sessions, billing) are the norm in this app, so we keep
  // the classic dynamic rendering model instead of Cache Components.
  cacheComponents: false,
  // Headless Chromium for the "download PDF" routes. It must stay external
  // (it finds its compressed binary by relative path) and its bin/ folder has
  // to ship with those two functions.
  serverExternalPackages: ["unpdf", "mammoth", "@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/*/*/pdf": ["./node_modules/@sparticuz/chromium/bin/**/*"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
