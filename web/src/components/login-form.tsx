"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Step = "phone" | "code";

export function LoginForm({ next = "/app", compact = false }: { next?: string; compact?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  async function post(url: string, body: unknown) {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "משהו השתבש. נסו שוב.");
    return data;
  }

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    if (!consent) {
      setError("כדי להמשיך צריך לאשר את תנאי השימוש ומדיניות הפרטיות.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const data = await post("/api/auth/send-code", { phone });
      setDevCode(data.devCode ?? null);
      setStep("code");
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await post("/api/auth/verify", { phone, code });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const errorId = "login-error";

  return (
    <div className={compact ? "" : "card p-7 md:p-9"}>
      {step === "phone" ? (
        <form onSubmit={sendCode} noValidate>
          <label htmlFor="phone" className="label">
            מספר טלפון נייד
          </label>
          <input
            id="phone"
            className="input text-lg tracking-wide"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            dir="ltr"
            placeholder="050-1234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={`phone-hint ${error ? errorId : ""}`}
            required
          />
          <p id="phone-hint" className="hint mt-2">
            נשלח קוד חד-פעמי ב-SMS. בלי סיסמאות ובלי הודעות שיווק.
          </p>
          <label className="mt-5 flex items-start gap-3 text-[0.95rem]">
            <input type="checkbox" className="mt-1 size-5 shrink-0 accent-forest" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              קראתי ואני מסכים/ה ל
              <a href="/legal/terms" target="_blank" className="link">
                תנאי השימוש
              </a>{" "}
              ול
              <a href="/legal/privacy" target="_blank" className="link">
                מדיניות הפרטיות
              </a>
              , כולל עיבוד קורות החיים שלי באמצעות AI.
            </span>
          </label>
          {error && (
            <p id={errorId} role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-danger">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full text-lg" disabled={busy}>
            {busy ? "שולחים…" : "שליחת קוד"}
          </button>
        </form>
      ) : (
        <form onSubmit={verify} noValidate>
          <p className="mb-4">
            שלחנו קוד ל-<span dir="ltr" className="font-semibold">{phone}</span>.{" "}
            <button type="button" className="link" onClick={() => { setStep("phone"); setCode(""); setError(null); }}>
              שינוי מספר
            </button>
          </p>
          {devCode && (
            <p className="mb-4 rounded-xl bg-amber-soft px-4 py-3 text-amber-ink">
              מצב הדגמה, אין SMS אמיתי. הקוד הוא: <strong dir="ltr" className="tracking-widest">{devCode}</strong>
            </p>
          )}
          <label htmlFor="code" className="label">
            קוד בן 6 ספרות
          </label>
          <input
            id="code"
            ref={codeRef}
            className="input text-center text-2xl tracking-[0.5em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            required
          />
          {error && (
            <p id={errorId} role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-danger">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full text-lg" disabled={busy || code.length !== 6}>
            {busy ? "בודקים…" : "כניסה"}
          </button>
          <button type="button" className="btn btn-quiet mt-2 w-full" onClick={() => sendCode()} disabled={busy}>
            לא הגיע? שליחה חוזרת
          </button>
        </form>
      )}
    </div>
  );
}
