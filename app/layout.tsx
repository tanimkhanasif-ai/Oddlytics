import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import AppChrome from "@/components/AppChrome";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Oddlytics",
  description: "Understand prediction-market questions on Polymarket and Kalshi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={archivo.variable}>
      <body className="min-h-screen text-gray-200">
        <AuthProvider>
          <AppChrome>{children}</AppChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
