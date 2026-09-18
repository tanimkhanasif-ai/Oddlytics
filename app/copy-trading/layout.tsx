import type { Metadata } from "next";

export const metadata: Metadata = { title: "Copy Trading" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
