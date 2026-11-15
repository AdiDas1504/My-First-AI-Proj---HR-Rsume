"use client";

import { useState } from "react";
import type { PlanId } from "@/lib/plans";

export function CheckoutButton({
  plan,
  product,
  draftId,
  label,
}: {
  plan?: PlanId;
  product?: "builder";
  draftId?: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

  async function go() {
    if (!agreed) {
      setError(product ? "צריך לאשר את תנאי השימוש כדי להמשיך." : "צריך לאשר את תנאי המנוי כדי להמשיך.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product ? { product, draftId } : { plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "משהו השתבש. נסו שוב.");
      window.location.assign(data.url);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <label className="flex items-start gap-3">
        <input type="checkbox" className="mt-1 size-5 shrink-0 accent-forest" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>
          אני מאשר/ת את{" "}
          <a href="/legal/terms" target="_blank" className="link">
            {product ? "תנאי השימוש והביטול" : "תנאי המנוי והביטול"}
          </a>
          {product ? "." : ", כולל חידוש אוטומטי עד לביטול."}
        </span>
      </label>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {error}
        </p>
      )}
      <button type="button" className="btn btn-primary mt-5 w-full text-lg" onClick={go} disabled={busy}>
        {busy ? "מעבירים לתשלום…" : label}
      </button>
    </div>
  );
}
