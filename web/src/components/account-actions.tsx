"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccountActions({ mode }: { mode: "cancel" | "account" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function call(url: string, body?: unknown) {
    setBusy(true);
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    setBusy(false);
  }

  if (mode === "cancel") {
    return (
      <button
        type="button"
        className="btn btn-danger mt-5"
        disabled={busy}
        onClick={async () => {
          if (
            !window.confirm(
              "לבטל את המנוי?\n\nהביטול נכנס לתוקף מיד: הגישה לשירותים בתשלום נסגרת ולא יהיו חיובים נוספים. החזר על התקופה הנוכחית אפשרי רק אם לא השתמשתם בשירותי האתר בתקופה הזו.",
            )
          )
            return;
          await call("/api/billing/cancel");
          router.refresh();
        }}
      >
        ביטול המנוי
      </button>
    );
  }
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        type="button"
        className="btn btn-secondary"
        disabled={busy}
        onClick={async () => {
          await call("/api/auth/logout");
          router.replace("/");
          router.refresh();
        }}
      >
        יציאה
      </button>
      <button
        type="button"
        className="btn btn-danger"
        disabled={busy}
        onClick={async () => {
          if (!window.confirm("למחוק את החשבון וכל הגרסאות השמורות? המנוי יבוטל. אי אפשר לשחזר.")) return;
          await call("/api/account/delete");
          router.replace("/");
          router.refresh();
        }}
      >
        מחיקת החשבון והמידע
      </button>
    </div>
  );
}
