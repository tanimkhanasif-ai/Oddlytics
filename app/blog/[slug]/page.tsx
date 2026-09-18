import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog/posts";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getBlogPost(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} — Oddlytics Blog`,
    description: post.description,
    openGraph: { title: post.title, description: post.description, type: "article" },
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  if (!post) notFound();

  return (
    <article className="max-w-2xl space-y-6">
      <Link href="/blog" className="text-sm text-brand-bright hover:underline">
        ← Blog
      </Link>

      <div>
        <p className="text-xs text-gray-500">{formatDate(post.date)}</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">{post.title}</h1>
      </div>

      <div className="space-y-4 text-sm leading-relaxed text-gray-300">
        {post.body.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
