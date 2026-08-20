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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-brand/30 bg-[#0a0f0c] p-6 text-center shadow-2xl shadow-brand/10">
        <h2 className="text-lg font-semibold text-white">Still deciding?</h2>
        <p className="mt-2 text-sm text-gray-400">
          Handpicked Bets, Copy Trading, and unlimited AI Analyzer runs are all part of the
          Full Access plan.
        </p>
        <Link
          href="/pricing"
          onClick={() => setShow(false)}
          className="mt-4 block rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-brand-dark"
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
