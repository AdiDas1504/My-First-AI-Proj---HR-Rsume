"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { TRACKED_PAGES } from "@/lib/analytics";

/**
 * Counts a visit to a funnel page, on our own server only: no third-party
 * scripts, no ad pixels, nothing about who the visitor is.
 */
export function TrackView() {
  const pathname = usePathname();
  useEffect(() => {
    const name = TRACKED_PAGES[pathname];
    if (!name) return;
    const body = JSON.stringify({ name });
    try {
      if (!navigator.sendBeacon?.("/api/ping", new Blob([body], { type: "application/json" }))) {
        void fetch("/api/ping", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
      }
    } catch {
      /* counting must never break the page */
    }
  }, [pathname]);
  return null;
}
