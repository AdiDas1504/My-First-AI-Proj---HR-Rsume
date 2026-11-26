"use client";

import { useState } from "react";

/** Owner tool: one more free check for a phone number. */
export function AdminGrantScan() {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/free-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "משהו השתבש.");
      setMessage({
        ok: true,
        text: data.deleted > 0 ? "בוצע. המספר יכול לעשות עוד בדיקה חינמית אחת." : "למספר הזה אין בדיקה חינמית שמורה, כך שהוא כבר יכול לבדוק.",
      });
      setPhone("");
    } catch (err) {
      setMessage({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="grant-phone" className="block text-sm font-semibold">
          מספר טלפון
        </label>
        <input
          id="grant-phone"
          className="input mt-1 w-56"
          inputMode="tel"
          dir="ltr"
          placeholder="050-1234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>
      <button className="btn btn-secondary" disabled={busy}>
        {busy ? "רגע…" : "לאפשר עוד בדיקה חינמית"}
      </button>
      <p role="status" aria-live="polite" className={`basis-full text-sm ${message?.ok ? "text-forest" : "text-danger"}`}>
        {message?.text}
      </p>
    </form>
  );
}
