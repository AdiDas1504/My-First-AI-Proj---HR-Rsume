"use client";

import { PdfDownloadButton } from "./pdf-download-button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BuilderDraft, HonestyFlag, ResumeTemplate, TailoredResume } from "@/lib/types";
import { ResumeEditor } from "./resume-editor";
import { ResumePreview } from "./resume-preview";
import { TemplatePicker } from "./template-picker";

type ClientDraft = Omit<BuilderDraft, "sourceResumeText">;

export function BuilderResult({
  draft,
  hasSubscription,
  trialAvailable,
}: {
  draft: ClientDraft;
  hasSubscription: boolean;
  trialAvailable: boolean;
}) {
  const router = useRouter();
  const [resume, setResume] = useState<TailoredResume>(draft.resume!);
  const [template, setTemplate] = useState<ResumeTemplate>(draft.template);
  const [flags, setFlags] = useState<HonestyFlag[]>(draft.honestyFlags);
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/builder/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "השמירה נכשלה.");
      setFlags(data.honestyFlags);
      setDirty(false);
      setStatus("השינויים נשמרו.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("למחוק את קורות החיים האלה? אי אפשר לשחזר.")) return;
    await fetch(`/api/builder/${draft.id}`, { method: "DELETE" });
    router.replace("/builder");
    router.refresh();
  }

  const tailorHref = hasSubscription
    ? `/app/new?from=${draft.id}`
    : trialAvailable
      ? "/checkout?plan=trial"
      : "/checkout?plan=monthly";

  return (
    <div className="container-page py-8 md:py-12">
      <Link href="/builder" className="link text-sm">
        → כל קורות החיים שלי
      </Link>

      <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">קורות החיים שלך מוכנים</p>
          <h1 className="mt-1 text-3xl md:text-4xl">{resume.fullName}</h1>
          {resume.headline && <p className="text-lg text-muted">{resume.headline}</p>}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <a href={`/api/builder/${draft.id}/docx`} className="btn btn-primary" aria-disabled={dirty} onClick={(e) => dirty && e.preventDefault()}>
            הורדה ל-Word
          </a>
          <PdfDownloadButton href={`/api/builder/${draft.id}/pdf`} printHref={`/builder/${draft.id}/print`} disabled={dirty} />
        </div>
      </div>
      {dirty && <p className="mt-3 text-sm text-amber-ink">יש שינויים שלא נשמרו. שמרו כדי להוריד את הגרסה המעודכנת.</p>}

      <p role="note" className="mt-5 rounded-2xl bg-amber-soft px-5 py-4 text-amber-ink">
        <strong>זו טיוטה שנוצרה בעזרת AI.</strong> קראו כל שורה לפני השליחה. בדקו שכל פרט נכון ומדויק ותקנו בעריכה את מה שלא.
      </p>

      {flags.length > 0 && (
        <section aria-labelledby="flags-title" className="mt-5 rounded-2xl border border-danger/30 bg-danger-soft p-5">
          <h2 id="flags-title" className="font-sans text-lg font-bold text-danger">
            בדיקת יושר: {flags.length} פרטים לבדיקה
          </h2>
          <p className="mt-1 text-[0.95rem]">הפרטים האלה לא מופיעים בתשובות שלך. ודאו שהם נכונים, או ערכו אותם.</p>
          <ul className="mt-3 space-y-1.5">
            {flags.map((f, i) => (
              <li key={i} className="text-[0.95rem]">
                <span className="font-semibold">{f.field}:</span> <span dir="auto">“{f.value}”</span> · {f.reason}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
        <aside className="space-y-5">
          <div className="card p-5">
            <TemplatePicker draftId={draft.id} value={template} onChange={setTemplate} />
          </div>

          <div className="card space-y-3 p-5">
            <button type="button" className="btn btn-secondary w-full" aria-pressed={editing} onClick={() => setEditing((v) => !v)}>
              {editing ? "סגירת העריכה" : "עריכה ידנית"}
            </button>
            {dirty && (
              <button type="button" className="btn btn-primary w-full" onClick={save} disabled={saving}>
                {saving ? "שומרים…" : "שמירת שינויים"}
              </button>
            )}
            <Link href={`/builder/${draft.id}?edit=1`} className="btn btn-quiet w-full">
              חזרה לשאלות ויצירה מחדש
            </Link>
            <p className="text-sm text-forest" role="status" aria-live="polite">
              {status}
            </p>
          </div>

          {draft.notes.length > 0 && (
            <div className="card p-5">
              <h2 className="font-sans text-lg font-bold">מה הדגשנו</h2>
              <ul className="mt-2 list-disc space-y-1.5 ps-5 text-[0.95rem]">
                {draft.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="card bg-forest p-5 text-white">
            <p className="font-display text-xl font-bold">הצעד הבא: התאמה לכל משרה</p>
            <p className="mt-1 text-white/85">מדביקים מודעת דרושים ומקבלים גרסה של קורות החיים האלה בשפה של המשרה, עם ציון התאמה.</p>
            <Link href={tailorHref} className="btn mt-4 w-full bg-white text-forest hover:bg-amber-soft">
              {hasSubscription ? "להתאים למשרה" : "להתאים למשרה · שבוע ב-19.90 ₪"}
            </Link>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
              {error}
            </p>
          )}
        </aside>

        <div className="space-y-6">
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
            <ResumePreview resume={resume} template={template} />
          </div>
        </div>
      </div>

      <div className="mt-12 border-t border-line pt-6">
        <button type="button" className="btn btn-danger" onClick={remove}>
          מחיקת קורות החיים
        </button>
      </div>
    </div>
  );
}
