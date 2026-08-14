import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oddlytics",
  description: "Understand prediction-market questions on Polymarket and Kalshi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f17] text-gray-200">
        <Nav />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-xs text-gray-500">
          Oddlytics provides informational analysis only, not financial advice. Paper Trading uses
          virtual money only. Nothing here is a guarantee of any outcome.
        </footer>
      </body>
    </html>
  );
}
