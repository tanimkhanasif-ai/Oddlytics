import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog/posts";

const BASE_URL = "https://oddlytics.site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    ...BLOG_POSTS.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    { url: `${BASE_URL}/help`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
