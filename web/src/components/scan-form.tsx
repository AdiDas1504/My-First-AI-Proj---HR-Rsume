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
      ? { href: "/app/new", label: "ליצירת קורות חיים מותאמים" }
      : trialAvailable
        ? { href: "/checkout?plan=trial", label: "לקבל את הדוח המלא וגרסה מותאמת · 19.90 ₪ לשבוע" }
        : { href: "/checkout?plan=monthly", label: "לקבל את הדוח המלא וגרסה מותאמת" };
    return (
      <section aria-labelledby="scan-result" className="mt-8 space-y-6">
        <div className="card p-7 md:p-9">
          <h2 id="scan-result" ref={resultRef} tabIndex={-1} className="text-2xl md:text-3xl">
            {result.jobTitle}
            {result.company && <span className="text-muted"> · {result.company}</span>}
          </h2>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <ScoreRing score={result.score} />
            <p className="max-w-md text-lg">{result.verdict}</p>
          </div>
        </div>

        <div className="card p-7 md:p-9">
          <h3 className="text-2xl">הפערים החשובים ביותר</h3>
          {result.topGaps.length === 0 ? (
            <p className="mt-3 text-lg text-muted">לא מצאנו פערים משמעותיים. כדאי עדיין לחדד את הניסוח לשפת המשרה.</p>
          ) : (
            <ol className="mt-5 space-y-4">
              {result.topGaps.map((g, i) => (
                <li key={i} className="flex gap-4 rounded-2xl bg-paper-2 p-5">
                  <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-soft font-bold text-amber-ink">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{g.requirement}</p>
                    <p className="mt-1 text-muted">{g.tip}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {!subscriber && (
            <div className="relative mt-6 overflow-hidden rounded-2xl border border-line">
              <div aria-hidden="true" className="select-none space-y-3 p-5 blur-[5px]">
                <div className="h-4 w-3/4 rounded bg-line" />
                <div className="h-4 w-1/2 rounded bg-line" />
                <div className="h-4 w-2/3 rounded bg-line" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-card/70 p-4 text-center">
                <p className="font-semibold">
                  {result.hiddenGapCount > 0
                    ? `ועוד ${result.hiddenGapCount} פערים והתאמות בדוח המלא`
                    : "הדוח המלא כולל את כל הדרישות, עם הוכחה מקורות החיים לכל אחת"}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card flex flex-col items-start gap-4 bg-forest p-7 text-white md:flex-row md:items-center md:justify-between md:p-9">
          <div>
            <p className="font-display text-2xl font-bold">רוצים שנתאים בשבילכם?</p>
            <p className="mt-1 text-white/80">קורות חיים מותאמים למשרה הזו, ב-Word וב-PDF, תוך דקה.</p>
          </div>
          <Link href={cta.href} className="btn bg-white text-forest hover:bg-amber-soft">
            {cta.label}
          </Link>
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
