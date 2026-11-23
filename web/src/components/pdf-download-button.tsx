"use client";

import { useState } from "react";

function fileNameFrom(disposition: string | null) {
  const star = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (star) {
    try {
      return decodeURIComponent(star);
    } catch {
      /* fall through */
    }
  }
  return "resume.pdf";
}

/** Downloads a ready A4 PDF file (made on the server), no print dialog. */
export function PdfDownloadButton({
  href,
  printHref,
  disabled = false,
  className = "btn btn-secondary",
}: {
  href: string;
  printHref?: string;
  disabled?: boolean;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    if (busy || disabled) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(href, { cache: "no-store" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "לא הצלחנו להכין את קובץ ה-PDF. נסו שוב.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileNameFrom(res.headers.get("content-disposition"));
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "לא הצלחנו להכין את קובץ ה-PDF. נסו שוב.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="contents">
      <button type="button" className={className} onClick={download} disabled={disabled || busy} aria-busy={busy}>
        {busy ? "מכינים PDF…" : "הורדה ל-PDF"}
      </button>
      <p role="status" aria-live="polite" className={error ? "basis-full text-sm text-danger" : "sr-only"}>
        {error}
        {error && printHref && (
          <>
            {" "}
            <a href={printHref} target="_blank" className="link">
              אפשר גם להדפיס ולשמור מחלון ההדפסה
            </a>
          </>
        )}
      </p>
    </div>
  );
}
