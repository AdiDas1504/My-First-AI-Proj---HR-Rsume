"use client";

import type { EducationItem, ExperienceItem, TailoredResume } from "@/lib/types";

const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
const list = (v: string) => v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);

function Field({
  label,
  value,
  onChange,
  multiline,
  dir,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  dir?: "rtl" | "ltr" | "auto";
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {multiline ? (
        <textarea className="input !min-h-28 text-[0.95rem]" dir={dir} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input text-[0.95rem]" dir={dir} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="hint mt-1 block">{hint}</span>}
    </label>
  );
}

export function ResumeEditor({ value, onChange }: { value: TailoredResume; onChange: (r: TailoredResume) => void }) {
  const dir = value.language === "he" ? "rtl" : "ltr";
  const set = <K extends keyof TailoredResume>(k: K, v: TailoredResume[K]) => onChange({ ...value, [k]: v });
  const setExp = (i: number, patch: Partial<ExperienceItem>) =>
    set("experience", value.experience.map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const setEdu = (i: number, patch: Partial<EducationItem>) =>
    set("education", value.education.map((e, j) => (j === i ? { ...e, ...patch } : e)));

  return (
    <div className="card space-y-6 p-6" aria-label="עריכת קורות החיים" role="region">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="שם מלא" dir={dir} value={value.fullName} onChange={(v) => set("fullName", v)} />
        <Field label="כותרת מקצועית" dir={dir} value={value.headline} onChange={(v) => set("headline", v)} />
        <Field label="טלפון" dir="ltr" value={value.contact.phone} onChange={(v) => set("contact", { ...value.contact, phone: v })} />
        <Field label="אימייל" dir="ltr" value={value.contact.email} onChange={(v) => set("contact", { ...value.contact, email: v })} />
        <Field label="מיקום" dir={dir} value={value.contact.location} onChange={(v) => set("contact", { ...value.contact, location: v })} />
        <Field
          label="קישורים"
          dir="ltr"
          value={value.contact.links.join(", ")}
          onChange={(v) => set("contact", { ...value.contact, links: list(v) })}
          hint="מופרדים בפסיק"
        />
      </div>
      <Field label="תקציר" dir={dir} multiline value={value.summary} onChange={(v) => set("summary", v)} />

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-bold">ניסיון</legend>
        {value.experience.map((e, i) => (
          <div key={i} className="space-y-3 rounded-2xl bg-paper-2 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="תפקיד" dir={dir} value={e.title} onChange={(v) => setExp(i, { title: v })} />
              <Field label="ארגון" dir={dir} value={e.organization} onChange={(v) => setExp(i, { organization: v })} />
              <Field label="מתאריך" dir="auto" value={e.start} onChange={(v) => setExp(i, { start: v })} />
              <Field label="עד תאריך" dir="auto" value={e.end} onChange={(v) => setExp(i, { end: v })} hint="ריק = עד היום" />
            </div>
            <Field
              label="שורות (שורה לכל נקודה)"
              dir={dir}
              multiline
              value={e.bullets.join("\n")}
              onChange={(v) => setExp(i, { bullets: lines(v) })}
            />
            <button type="button" className="text-sm text-danger underline" onClick={() => set("experience", value.experience.filter((_, j) => j !== i))}>
              הסרת התפקיד
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary !min-h-10"
          onClick={() => set("experience", [...value.experience, { title: "", organization: "", location: "", start: "", end: "", bullets: [] }])}
        >
          + תפקיד
        </button>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-bold">השכלה</legend>
        {value.education.map((e, i) => (
          <div key={i} className="grid gap-3 rounded-2xl bg-paper-2 p-4 sm:grid-cols-2">
            <Field label="תואר / קורס" dir={dir} value={e.degree} onChange={(v) => setEdu(i, { degree: v })} />
            <Field label="מוסד" dir={dir} value={e.institution} onChange={(v) => setEdu(i, { institution: v })} />
            <Field label="מתאריך" dir="auto" value={e.start} onChange={(v) => setEdu(i, { start: v })} />
            <Field label="עד תאריך" dir="auto" value={e.end} onChange={(v) => setEdu(i, { end: v })} />
            <div className="sm:col-span-2">
              <Field label="פרטים" dir={dir} value={e.details} onChange={(v) => setEdu(i, { details: v })} />
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary !min-h-10"
          onClick={() => set("education", [...value.education, { degree: "", institution: "", start: "", end: "", details: "" }])}
        >
          + השכלה
        </button>
      </fieldset>

      <Field label="מיומנויות" dir={dir} multiline value={value.skills.join(", ")} onChange={(v) => set("skills", list(v))} hint="מופרדות בפסיק" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="הסמכות" dir={dir} value={value.certifications.join(", ")} onChange={(v) => set("certifications", list(v))} />
        <Field label="שפות" dir={dir} value={value.languages.join(", ")} onChange={(v) => set("languages", list(v))} />
      </div>
    </div>
  );
}
