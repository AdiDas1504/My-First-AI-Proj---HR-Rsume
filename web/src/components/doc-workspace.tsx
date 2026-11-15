"use client";

import { PdfDownloadButton } from "./pdf-download-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HonestyFlag, TailorDocument, TailoredResume } from "@/lib/types";
import { ResumePreview } from "./resume-preview";
import { ScoreRing } from "./score-ring";
import { ResumeEditor } from "./resume-editor";
import { ProgressNote } from "./progress-note";

type ClientDoc = Omit<TailorDocument, "sourceResumeText">;
type Tab = "resume" | "report" | "letter";

const STATUS = {
  met: { label: "יש", cls: "bg-mint text-forest" },
  partial: { label: "חלקי", cls: "bg-amber-soft text-amber-ink" },
  missing: { label: "חסר", cls: "bg-danger-soft text-danger" },
} as const;

export function DocWorkspace({ doc, canGenerate }: { doc: ClientDoc; canGenerate: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("resume");
  const [resume, setResume] = useState<TailoredResume>(doc.resume);
  const [flags, setFlags] = useState<HonestyFlag[]>(doc.honestyFlags);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [letter, setLetter] = useState(doc.coverLetter ?? "");
  const [letterBusy, setLetterBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const a = doc.analysis;

  async function patch(body: unknown) {
    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "השמירה נכשלה.");
    return data;
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const data = await patch({ resume });
      setFlags(data.honestyFlags);
      setDirty(false);
      setStatus("השינויים נשמרו, ובדיקת היושר רצה מחדש.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function generateLetter() {
    setLetterBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/documents/${doc.id}/cover-letter`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "לא הצלחנו ליצור מכתב.");
      setLetter(data.coverLetter);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLetterBusy(false);
    }
  }

  async function saveLetter() {
    try {
      await patch({ coverLetter: letter });
      setStatus("המכתב נשמר.");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function remove() {
    if (!window.confirm("למחוק את הגרסה הזו? אי אפשר לשחזר.")) return;
    await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    router.replace("/app");
    router.refresh();
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "resume", label: "קורות החיים" },
    { id: "report", label: "דוח התאמה" },
    { id: "letter", label: "מכתב מקדים" },
  ];

  return (
    <div className="container-page py-8 md:py-12">
      <Link href="/app" className="link text-sm">
        → חזרה לגרסאות שלי
      </Link>

      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <ScoreRing score={a.score} size="sm" />
          <div>
            <h1 className="text-3xl md:text-4xl">{a.jobTitle}</h1>
            {a.company && <p className="text-lg text-muted">{a.company}</p>}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2 lg:flex-nowrap">
          <a href={`/api/documents/${doc.id}/docx`} className="btn btn-primary" aria-disabled={dirty} onClick={(e) => dirty && e.preventDefault()}>
            הורדה ל-Word
          </a>
          <PdfDownloadButton href={`/api/documents/${doc.id}/pdf`} printHref={`/app/doc/${doc.id}/print`} disabled={dirty} />
        </div>
      </div>
      {dirty && <p className="mt-3 text-sm text-amber-ink">יש שינויים שלא נשמרו. שמרו כדי להוריד את הגרסה המעודכנת.</p>}

      <p role="note" className="mt-5 rounded-2xl bg-amber-soft px-5 py-4 text-amber-ink">
        <strong>זו טיוטה שנוצרה בעזרת AI.</strong> קראו כל שורה לפני השליחה, ודאו שכל פרט נכון ומדויק, ותקנו בעריכה מה שלא.
      </p>

      {flags.length > 0 && (
        <section aria-labelledby="flags-title" className="mt-6 rounded-2xl border border-danger/30 bg-danger-soft p-5 md:p-6">
          <h2 id="flags-title" className="font-sans text-lg font-bold text-danger">
            בדיקת יושר: {flags.length} פרטים לבדיקה לפני שליחה
          </h2>
          <p className="mt-1 text-[0.95rem]">הפרטים האלה לא נמצאו בקורות החיים המקוריים. ודאו שהם נכונים, או ערכו אותם.</p>
          <ul className="mt-3 space-y-1.5">
            {flags.map((f, i) => (
              <li key={i} className="text-[0.95rem]">
                <span className="font-semibold">{f.field}:</span> <span dir="auto">“{f.value}”</span> · {f.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div role="tablist" aria-label="חלקי הגרסה" className="mt-8 inline-flex gap-1 rounded-full bg-card p-1 shadow-soft">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => {
              const i = tabs.findIndex((x) => x.id === tab);
              // RTL: ArrowLeft moves forward.
              if (e.key === "ArrowLeft") setTab(tabs[(i + 1) % tabs.length].id);
              if (e.key === "ArrowRight") setTab(tabs[(i - 1 + tabs.length) % tabs.length].id);
            }}
            className={`rounded-full px-5 py-2.5 font-semibold transition ${tab === t.id ? "bg-forest text-white" : "text-muted hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {status}
      </div>
      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {error}
        </p>
      )}

      {/* ---------- resume ---------- */}
      <div id="panel-resume" role="tabpanel" aria-labelledby="tab-resume" hidden={tab !== "resume"} className="mt-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-secondary" aria-pressed={editing} onClick={() => setEditing((v) => !v)}>
            {editing ? "סגירת העריכה" : "עריכה"}
          </button>
          {dirty && (
            <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? "שומרים…" : "שמירת שינויים"}
            </button>
          )}
          {status && !dirty && <span className="text-sm text-forest">{status}</span>}
        </div>
        <div className={editing ? "grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : ""}>
          {editing && (
            <ResumeEditor
              value={resume}
              onChange={(r) => {
                setResume(r);
                setDirty(true);
                setStatus(null);
              }}
            />
          )}
          <div className="overflow-x-auto rounded-2xl bg-[#e9dfd5] p-3 md:p-8">
            <ResumePreview resume={resume} />
          </div>
        </div>

        {(doc.addOnlyIfTrue.length > 0 || doc.changeLog.length > 0) && (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            {doc.addOnlyIfTrue.length > 0 && (
              <section className="card p-6" aria-labelledby="aoit">
                <h2 id="aoit" className="text-2xl">להוסיף רק אם נכון</h2>
                <p className="mt-1 text-muted">דרישות מהמשרה שלא מצאנו בקורות החיים. אם יש לכם ניסיון כזה, הוסיפו אותו בעריכה.</p>
                <ul className="mt-4 space-y-3">
                  {doc.addOnlyIfTrue.map((x, i) => (
                    <li key={i} className="rounded-xl bg-paper-2 p-4">
                      <p className="font-semibold">{x.requirement}</p>
                      <p className="mt-1 text-muted">{x.suggestion}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {doc.changeLog.length > 0 && (
              <section className="card p-6" aria-labelledby="changes">
                <h2 id="changes" className="text-2xl">מה שינינו ולמה</h2>
                <ul className="mt-4 list-disc space-y-2 ps-5">
                  {doc.changeLog.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      {/* ---------- report ---------- */}
      <div id="panel-report" role="tabpanel" aria-labelledby="tab-report" hidden={tab !== "report"} className="mt-6 space-y-5">
        <div className="card p-7">
          <ScoreRing score={a.score} />
          <p className="mt-5 max-w-3xl text-lg">{a.summary}</p>
          {a.strengths.length > 0 && (
            <>
              <h2 className="mt-6 font-sans text-lg font-bold">החוזקות שלך למשרה הזו</h2>
              <ul className="mt-2 list-disc space-y-1 ps-5">
                {a.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-right">
            <caption className="px-6 pt-6 text-start font-display text-2xl font-bold">כל הדרישות</caption>
            <thead>
              <tr className="border-b border-line text-sm text-muted">
                <th scope="col" className="px-6 py-3 font-semibold">דרישה</th>
                <th scope="col" className="px-3 py-3 font-semibold">סוג</th>
                <th scope="col" className="px-3 py-3 font-semibold">מצב</th>
                <th scope="col" className="hidden px-6 py-3 font-semibold md:table-cell">מה מצאנו בקורות החיים</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {a.requirements.map((r, i) => (
                <tr key={i} className="align-top">
                  <td className="px-6 py-4" dir="auto">{r.text}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">{r.importance === "must" ? "חובה" : "יתרון"}</td>
                  <td className="px-3 py-4">
                    <span className={`chip ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                  </td>
                  <td className="hidden px-6 py-4 text-muted md:table-cell" dir="auto">{r.evidence || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- cover letter ---------- */}
      <div id="panel-letter" role="tabpanel" aria-labelledby="tab-letter" hidden={tab !== "letter"} className="mt-6">
        <div className="card p-7">
          {letter ? (
            <>
              <label htmlFor="letter" className="label">
                המכתב המקדים (אפשר לערוך)
              </label>
              <textarea
                id="letter"
                dir={resume.language === "he" ? "rtl" : "ltr"}
                className="input min-h-[22rem] text-[1.05rem]"
                value={letter}
                onChange={(e) => setLetter(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="btn btn-primary" onClick={saveLetter}>
                  שמירה
                </button>
                <a href={`/api/documents/${doc.id}/docx?type=letter`} className="btn btn-secondary">
                  הורדה ל-Word
                </a>
                <button type="button" className="btn btn-secondary" onClick={() => navigator.clipboard?.writeText(letter).then(() => setStatus("המכתב הועתק."))}>
                  העתקה
                </button>
                {canGenerate && (
                  <button type="button" className="btn btn-quiet" onClick={generateLetter} disabled={letterBusy}>
                    כתיבה מחדש
                  </button>
                )}
              </div>
            </>
          ) : letterBusy ? (
            <ProgressNote steps={["כותבים מכתב קצר ומדויק…", "רק מתוך הניסיון שלך…"]} />
          ) : (
            <div className="text-center">
              <p className="font-display text-2xl font-bold">מכתב מקדים למשרה הזו</p>
              <p className="mx-auto mt-2 max-w-md text-muted">150 עד 220 מילים, ישיר וספציפי, ורק על בסיס מה שמופיע בקורות החיים שלך.</p>
              <button type="button" className="btn btn-primary mt-6" onClick={generateLetter} disabled={!canGenerate}>
                ליצירת מכתב מקדים
              </button>
              {!canGenerate && <p className="mt-3 text-sm text-muted">זמין למנויים פעילים.</p>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-6">
        <button type="button" className="btn btn-danger" onClick={remove}>
          מחיקת הגרסה
        </button>
      </div>
    </div>
  );
}
