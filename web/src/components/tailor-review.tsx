"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Analysis, TailorQuestion } from "@/lib/types";
import { coverage } from "@/lib/scoring";
import { ScoreRing } from "./score-ring";
import { FitChips, RequirementsTable, RoleInsights } from "./fit-details";
import { ProgressNote } from "./progress-note";

/**
 * Between analysis and writing: show what we found, ask what only the
 * candidate knows, then write. Answers are optional and used only as stated.
 */
export function TailorReview({
  sessionId,
  analysis,
  questions,
  remaining,
}: {
  sessionId: string;
  analysis: Analysis;
  questions: TailorQuestion[];
  remaining: number;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const covered = coverage(analysis.requirements);
  const answeredCount = questions.filter((q) => !skipped[q.id] && answers[q.id]?.trim()).length;

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const body = { answers: Object.fromEntries(questions.filter((q) => !skipped[q.id]).map((q) => [q.id, answers[q.id] ?? ""])) };
      const res = await fetch(`/api/tailor/${sessionId}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "משהו השתבש. נסו שוב.");
      router.push(`/app/doc/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="mt-8 space-y-6">
      <section className="card p-6 md:p-7" aria-labelledby="fit-title">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <ScoreRing score={analysis.score} />
          <div>
            <h2 id="fit-title" className="text-2xl">
              {analysis.jobTitle}
              {analysis.company ? ` · ${analysis.company}` : ""}
            </h2>
            <FitChips analysis={analysis} />
            <p className="mt-3 max-w-2xl text-lg">{analysis.summary}</p>
            {covered.covered > 0 && (
              <p className="mt-3 text-forest">
                כבר יש לך ניסיון ב-<strong>{covered.covered} מתוך {covered.total}</strong> הדרישות של המשרה, לפחות חלקית. נבליט אותן בקורות החיים.
              </p>
            )}
          </div>
        </div>
        {analysis.strengths.length > 0 && (
          <>
            <h3 className="mt-6 font-sans text-lg font-bold">מה כבר עובד לטובתך</h3>
            <ul className="mt-2 list-disc space-y-1 ps-5">
              {analysis.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </>
        )}
        <details className="mt-6">
          <summary className="link cursor-pointer font-semibold">איך חושב הציון? כל הדרישות והשורות שעליהן הוא נשען</summary>
          <div className="mt-4">
            <RequirementsTable analysis={analysis} />
          </div>
        </details>
      </section>

      <RoleInsights insights={analysis.insights ?? []} />

      <section className="card p-6 md:p-7" aria-labelledby="q-title">
        <h2 id="q-title" className="text-2xl">כמה שאלות לפני שכותבים</h2>
        <p className="mt-1 max-w-2xl text-muted">
          אלה דברים שחשובים בתפקיד הזה ולא ברור מקורות החיים אם יש לך אותם. מספיק לענות בכמה מילים, בשפה שלך ורק על מה שנכון. את
          הניסוח המקצועי וההתאמה למשרה אנחנו עושים. אפשר לדלג על כל שאלה.
        </p>
        {questions.length === 0 ? (
          <p className="mt-4">אין לנו שאלות הפעם, קורות החיים מכסים את מה שחשוב. אפשר להמשיך לכתיבה.</p>
        ) : (
          <ol className="mt-6 space-y-6">
            {questions.map((q, n) => (
              <li key={q.id} className="rounded-2xl border border-line p-5">
                <label htmlFor={`a-${q.id}`} className="block font-semibold">
                  <span className="text-muted">{n + 1}. </span>
                  {q.question}
                </label>
                {q.why && (
                  <p id={`why-${q.id}`} className="mt-1 text-sm text-muted">
                    {q.why}
                  </p>
                )}
                <textarea
                  id={`a-${q.id}`}
                  aria-describedby={q.why ? `why-${q.id}` : undefined}
                  className="input mt-3 min-h-20"
                  maxLength={1500}
                  disabled={busy || skipped[q.id]}
                  value={answers[q.id] ?? ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value }))}
                  placeholder="בכמה מילים, למשל: כן, ניהלתי 2 עובדות"
                />
                <label className="mt-2 inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="size-4 accent-forest"
                    checked={Boolean(skipped[q.id])}
                    disabled={busy}
                    onChange={(e) => setSkipped((s) => ({ ...s, [q.id]: e.target.checked }))}
                  />
                  אין לי ניסיון כזה / לא רלוונטי
                </label>
              </li>
            ))}
          </ol>
        )}
      </section>

      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {error}
        </p>
      )}
      {busy ? (
        <ProgressNote
          steps={[
            "משלבים את התשובות שלך…",
            "מסדרים לפי מה שחשוב בתפקיד…",
            "מנסחים בשפה של המקצוע…",
            "מריצים בדיקת יושר…",
            "עוד כמה שניות…",
          ]}
        />
      ) : (
        <div className="card p-6">
          <button type="button" className="btn btn-primary w-full text-lg" onClick={generate}>
            {answeredCount === 0
              ? "לכתיבת קורות החיים המותאמים"
              : answeredCount === 1
                ? "לכתיבת קורות החיים עם התשובה שלך"
                : `לכתיבת קורות החיים עם ${answeredCount} התשובות שלך`}
          </button>
          <p className="mt-2 text-center text-sm text-muted">משתמש בהתאמה אחת מתוך {remaining} שנשארו לך בתקופה הזו.</p>
        </div>
      )}
    </div>
  );
}
