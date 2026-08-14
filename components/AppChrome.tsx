"use client";

import { usePathname } from "next/navigation";
import Nav from "@/components/Nav";
import Sidebar from "@/components/Sidebar";
import ExitIntentModal from "@/components/ExitIntentModal";
import SocialProofToast from "@/components/SocialProofToast";
import UrgencyBanner from "@/components/UrgencyBanner";

const MARKETING_PATHS = ["/", "/pricing"];

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  if (pathname.startsWith("/checkout")) {
    return <main className="min-h-screen">{children}</main>;
  }

  if (MARKETING_PATHS.includes(pathname)) {
    return (
      <>
        <UrgencyBanner />
        <Nav />
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 pb-10 pt-4 text-xs text-gray-500">
          Oddlytics provides informational analysis only, not financial advice. Paper Trading uses
          virtual money only. Nothing here is a guarantee of any outcome.
        </footer>
        <ExitIntentModal />
        <SocialProofToast />
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
