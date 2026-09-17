import type { MetadataRoute } from "next";

const BASE_URL = "https://oddlytics.site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/settings", "/checkout"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
