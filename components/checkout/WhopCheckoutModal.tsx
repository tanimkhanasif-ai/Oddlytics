"use client";

import dynamic from "next/dynamic";
import { X } from "lucide-react";

const WhopCheckoutEmbed = dynamic(
  () => import("./WhopCheckoutEmbed").then((m) => m.WhopCheckoutEmbed),
  { ssr: false }
);

export function WhopCheckoutModal({
  planId,
  userId,
  onClose,
}: {
  planId: string;
  userId: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-background p-2 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close checkout"
          className="absolute right-3 top-3 z-10 rounded-full bg-black/40 p-1.5 text-white hover:bg-black/60"
        >
          <X className="h-4 w-4" />
        </button>
        <WhopCheckoutEmbed planId={planId} userId={userId} />
      </div>
    </div>
  );
}
