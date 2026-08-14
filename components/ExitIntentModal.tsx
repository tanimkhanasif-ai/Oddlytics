"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SESSION_KEY = "oddlytics_exit_modal_shown";

export default function ExitIntentModal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY)) return;

    function handleMouseOut(e: MouseEvent) {
      if (e.clientY <= 0 && !window.sessionStorage.getItem(SESSION_KEY)) {
        window.sessionStorage.setItem(SESSION_KEY, "1");
        setShow(true);
      }
    }
    document.addEventListener("mouseout", handleMouseOut);
    return () => document.removeEventListener("mouseout", handleMouseOut);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#0b0f17] p-6 text-center shadow-xl">
        <h2 className="text-lg font-semibold text-white">Still deciding?</h2>
        <p className="mt-2 text-sm text-gray-400">
          Handpicked Bets, Copy Trading, and unlimited AI Analyzer runs are all part of the
          All-Access plan.
        </p>
        <Link
          href="/pricing"
          onClick={() => setShow(false)}
          className="mt-4 block rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black hover:bg-gray-200"
        >
          See pricing
        </Link>
        <button onClick={() => setShow(false)} className="mt-2 text-xs text-gray-500 hover:text-white">
          No thanks
        </button>
      </div>
    </div>
  );
}
