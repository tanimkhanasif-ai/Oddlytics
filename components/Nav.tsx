"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Nav() {
  const { status } = useSession();

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
        {status === "authenticated" ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
          >
            Open Dashboard
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-300 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
