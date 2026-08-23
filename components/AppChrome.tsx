"use client";

import { usePathname } from "next/navigation";
import { Shell } from "@/components/app/Shell";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  // The landing page renders its own full-page chrome (offer bar, nav, footer, toast).
  if (pathname === "/") {
    return <>{children}</>;
  }

  if (pathname.startsWith("/checkout")) {
    return <main className="aurora min-h-screen">{children}</main>;
  }

  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return (
      <div className="aurora min-h-screen">
        <main className="flex min-h-screen items-center justify-center px-6 py-16">{children}</main>
      </div>
    );
  }

  return <Shell>{children}</Shell>;
}
