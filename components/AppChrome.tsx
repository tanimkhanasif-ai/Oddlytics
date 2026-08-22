"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Sidebar from "@/components/Sidebar";
import ExitIntentModal from "@/components/ExitIntentModal";
import SocialProofToast from "@/components/SocialProofToast";
import UrgencyBanner from "@/components/UrgencyBanner";

const MARKETING_PATHS = ["/pricing"];

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

  if (MARKETING_PATHS.includes(pathname)) {
    return (
      <div className="aurora min-h-screen">
        <UrgencyBanner />
        <Nav />
        <main className="mx-auto max-w-6xl px-6 py-16">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-xs text-muted-foreground">
          Oddlytics provides informational analysis only, not financial advice. Paper Trading uses
          virtual money only. Nothing here is a guarantee of any outcome.
        </footer>
        <ExitIntentModal />
        <SocialProofToast />
      </div>
    );
  }

  return (
    <div className="aurora min-h-screen">
      <UrgencyBanner />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 px-6 py-6 sm:px-10">
          <div className="mx-auto max-w-5xl space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
