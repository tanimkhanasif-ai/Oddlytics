import type { Metadata } from "next";
import AppChrome from "@/components/AppChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oddlytics",
  description: "Understand prediction-market questions on Polymarket and Kalshi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0b0f17] text-gray-200">
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
