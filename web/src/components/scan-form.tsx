"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { ScanResult } from "@/lib/types";
import { JobField, ResumeField } from "./upload-fields";
import { ScoreRing } from "./score-ring";
import { ProgressNote } from "./progress-note";

export function ScanForm({ subscriber, trialAvailable }: { subscriber: boolean; trialAvailable: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/scan", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "משהו השתבש. נסו שוב.");
      setResult(data.result);
      setTimeout(() => resultRef.current?.focus(), 50);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    const cta = subscriber
      ? { href: "/app/new", label: "ליצירת קורות חיים מותאמים למשרה הזו" }
      : trialAvailable
        ? { href: "/checkout?plan=trial", label: "לקבל קורות חיים מותאמים · 19.90 ₪ לשבוע" }
        : { href: "/checkout?plan=monthly", label: "לקבל קורות חיים מותאמים" };
    const lift = result.potentialScore - result.score;
    return (
      <section aria-labelledby="scan-result" className="mt-8 space-y-6">
        {/* ---------- headline: where you are, where wording alone can take you ---------- */}
        <div className="card p-7 md:p-9">
          <p className="text-muted">
            {result.jobTitle}
            {result.company && <> · {result.company}</>}
          </p>
          <h2 id="scan-result" ref={resultRef} tabIndex={-1} className="mt-2 text-3xl md:text-4xl">
            {lift >= 5 ? (
              <>
                אפשר להעלות את ההתאמה שלך מ-{result.score} ל-<span className="text-forest">{result.potentialScore}</span>
              </>
            ) : (
              <>ההתאמה שלך למשרה: {result.score}</>
            )}
          </h2>
          <div className="mt-7 flex flex-wrap items-center gap-6 md:gap-10">
            <div>
              <p className="mb-2 text-sm font-semibold text-muted">היום</p>
              <ScoreRing score={result.score} size="sm" />
            </div>
            {lift >= 5 && (
              <>
                <span aria-hidden="true" className="text-3xl text-muted">←</span>
                <div>
                  <p className="mb-2 text-sm font-semibold text-forest">אחרי התאמה</p>
                  <ScoreRing score={result.potentialScore} size="sm" />
                </div>
                <p className="max-w-xs text-sm text-muted">
                  רק מניסוח נכון של ניסיון שכבר יש לך. בלי להוסיף שום דבר שלא עשית.
                </p>
              </>
            )}
          </div>
          <p className="mt-6 max-w-2xl text-lg">{result.verdict}</p>
          {result.coveredCount > 0 && (
            <p className="mt-4 max-w-2xl rounded-xl bg-mint px-4 py-3 text-forest">
              כבר יש לך ניסיון ב-<strong>{result.coveredCount} מתוך {result.requirementCount}</strong> הדרישות של המשרה, לפחות חלקית. בקורות החיים
              המותאמים נבליט אותן, כדי שהמגייס יראה אותן מיד.
            </p>
          )}
        </div>

        {/* ---------- what already works ---------- */}
        {result.strengths.length > 0 && (
          <div className="card p-7 md:p-9">
            <h3 className="text-2xl">מה כבר עובד לטובתך</h3>
            <ul className="mt-4 space-y-2.5">
              {result.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-lg">
                  <svg viewBox="0 0 20 20" className="mt-1.5 size-5 shrink-0 text-forest" aria-hidden="true">
                    <path d="M4 10.5l3.5 3.5L16 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------- one real line, before and after ---------- */}
        {result.sampleRewrite && (
          <div className="card overflow-hidden">
            <div className="p-7 pb-5 md:p-9 md:pb-6">
              <h3 className="text-2xl">ככה נראית שורה שלך אחרי התאמה</h3>
              <p className="mt-1 text-muted">אותה עובדה בדיוק, בשפה שהמגייס של המשרה הזו מחפש.</p>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="border-t border-line bg-paper-2 p-7 md:p-9">
                <p className="chip bg-line/60 text-muted">היום</p>
                <p className="mt-3 text-lg text-muted" dir="auto">{result.sampleRewrite.before}</p>
              </div>
              <div className="border-t border-line bg-mint/60 p-7 md:border-s md:p-9">
                <p className="chip bg-forest text-white">אחרי JobFit</p>
                <p className="mt-3 text-lg font-semibold text-ink" dir="auto">{result.sampleRewrite.after}</p>
              </div>
            </div>
          </div>
        )}

        {/* ---------- gaps ---------- */}
        <div className="card p-7 md:p-9">
          <h3 className="text-2xl">מה מפריד בינך לבין זימון לראיון</h3>
          {(result.phrasingGapCount > 0 || result.missingGapCount > 0) && (
            <p className="mt-2 text-muted">
              {result.phrasingGapCount > 0 && <>את {result.phrasingGapCount} מהפערים אפשר לסגור רק בניסוח נכון. </>}
              {result.missingGapCount > 0 && <>{result.missingGapCount} דורשים ניסיון שלא מופיע כרגע בקורות החיים.</>}
            </p>
          )}
          {result.topGaps.length === 0 ? (
            <p className="mt-3 text-lg text-muted">לא מצאנו פערים משמעותיים. נשאר לחדד את הניסוח לשפה של המשרה.</p>
          ) : (
            <ol className="mt-5 space-y-4">
              {result.topGaps.map((g, i) => (
                <li key={i} className="rounded-2xl bg-paper-2 p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <p className="font-semibold">{g.requirement}</p>
                    {g.gapType === "phrasing" ? (
                      <span className="chip bg-mint text-forest">אפשר לסגור בניסוח</span>
                    ) : (
                      <span className="chip bg-amber-soft text-amber-ink">חסר בקורות החיים</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-muted">{g.tip}</p>
                </li>
              ))}
            </ol>
          )}

          {!subscriber && (
            <div className="mt-6 rounded-2xl border border-dashed border-line p-5">
              <p className="font-semibold">
                {result.hiddenGapCount > 0 ? `ועוד ${result.hiddenGapCount} פערים בדוח המלא, ` : "בדוח המלא, "}
                יחד עם:
              </p>
              <ul className="mt-2 grid gap-1.5 text-muted sm:grid-cols-2">
                <li>• כל דרישות המשרה, עם הוכחה מקורות החיים</li>
                <li>• קורות חיים מותאמים, מוכנים לשליחה</li>
                <li>• הורדה ל-Word ול-PDF, בעברית או באנגלית</li>
                <li>• מכתב מקדים קצר למשרה הזו</li>
              </ul>
            </div>
          )}
        </div>

        {/* ---------- call to action ---------- */}
        <div className="card relative overflow-hidden bg-forest p-7 text-white md:p-10">
          <div aria-hidden="true" className="absolute -left-16 -top-16 size-56 rounded-full bg-amber/25 blur-3xl" />
          <p className="relative font-display text-3xl font-bold">
            {lift >= 5 ? `קורות חיים שמגיעים ל-${result.potentialScore}, מוכנים לשליחה תוך דקה` : "קורות חיים מותאמים למשרה הזו, מוכנים לשליחה תוך דקה"}
          </p>
          <p className="relative mt-2 max-w-2xl text-white/85">
            אנחנו מנסחים מחדש את מה שכבר עשית בשפה של המשרה, מסדרים את מה שהכי רלוונטי בראש ומסמנים כל פרט לבדיקה שלך. בלי להמציא אף מילה.
          </p>
          <div className="relative mt-6 flex flex-wrap items-center gap-4">
            <Link href={cta.href} className="btn bg-white px-7 text-lg text-forest hover:bg-amber-soft">
              {cta.label}
            </Link>
            {!subscriber && <span className="text-sm text-white/80">ביטול בלחיצה אחת · בלי התחייבות</span>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 space-y-7 p-7 md:p-9" aria-busy={busy}>
      <ResumeField />
      <JobField />
      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {error}
        </p>
      )}
      {busy ? (
        <ProgressNote steps={["קוראים את קורות החיים…", "מזהים את דרישות המשרה…", "משווים דרישה מול דרישה…", "כמעט מוכן…"]} />
      ) : (
        <button type="submit" className="btn btn-primary w-full text-lg">
          {subscriber ? "בדיקה" : "לבדיקה החינמית"}
        </button>
      )}
    </form>
  );
}
