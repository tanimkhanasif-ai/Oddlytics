"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Oddlytics
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-gray-400 sm:flex">
          <Link href="/#features" className="hover:text-white">
            Features
          </Link>
          <Link href="/#faq" className="hover:text-white">
            FAQs
          </Link>
          <Link href="/pricing" className="hover:text-white">
            Pricing
          </Link>
        </nav>
        <Link
          href="/dashboard"
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
        >
          Open Dashboard
        </Link>
      </div>
    </header>
  );
}
