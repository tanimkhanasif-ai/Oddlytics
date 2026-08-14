import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oddlytics",
  description: "Understand prediction-market questions on Polymarket and Kalshi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f17] text-gray-200">
        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              Oddlytics
            </Link>
            <nav className="flex gap-6 text-sm text-gray-400">
              <Link href="/analyzer" className="hover:text-white">
                AI Analyzer
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-xs text-gray-500">
          Oddlytics provides informational analysis only, not financial advice. Nothing here is a
          guarantee of any outcome.
        </footer>
      </body>
    </html>
  );
}
