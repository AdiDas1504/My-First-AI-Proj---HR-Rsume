import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  return ["", "/scan", "/builder", "/pricing", "/legal/privacy", "/legal/terms", "/accessibility"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "monthly",
  }));
}
