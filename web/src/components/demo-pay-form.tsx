"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DemoPayForm({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/billing/demo-complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "התשלום נכשל.");
      setBusy(false);
      return;
    }
    router.replace("/app?welcome=1");
    router.refresh();
  }

  return (
    <form onSubmit={pay} className="card mt-6 space-y-4 p-7">
      <div>
        <label htmlFor="card" className="label">מספר כרטיס (הדגמה)</label>
        <input id="card" className="input" dir="ltr" defaultValue="4580 0000 0000 0000" readOnly />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="exp" className="label">תוקף</label>
          <input id="exp" className="input" dir="ltr" defaultValue="12/29" readOnly />
        </div>
        <div>
          <label htmlFor="cvv" className="label">CVV</label>
          <input id="cvv" className="input" dir="ltr" defaultValue="123" readOnly />
        </div>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full text-lg" disabled={busy}>
        {busy ? "מאשרים…" : "אישור תשלום (הדגמה)"}
      </button>
    </form>
  );
}
