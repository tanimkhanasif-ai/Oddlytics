import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides and notes on prediction markets, how Oddlytics' AI analysis works, and how to read Polymarket and Kalshi prices.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Blog</h1>
        <p className="mt-1 text-sm text-gray-400">
          Guides on prediction markets and how Oddlytics' analysis works.
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="block rounded-xl border border-white/10 bg-white/5 p-6 transition hover:border-brand/40 hover:bg-white/[0.07]"
          >
            <p className="text-xs text-gray-500">{formatDate(post.date)}</p>
            <h2 className="mt-1 text-lg font-semibold text-white">{post.title}</h2>
            <p className="mt-2 text-sm text-gray-400">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
