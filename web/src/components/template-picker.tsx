"use client";

import type { ResumeTemplate } from "@/lib/types";
import { TEMPLATE_NAMES } from "./resume-preview";

/** Small visual swatches of the three designs. Saves the choice right away. */
function Swatch({ t }: { t: ResumeTemplate }) {
  const line = "h-1.5 rounded-full bg-[#d9d4cf]";
  return (
    <div aria-hidden="true" className="h-28 overflow-hidden rounded-lg bg-white p-3 shadow-soft">
      {t === "modern" ? (
        <div className="-m-3 mb-2 bg-[#1f4d3a] p-3">
          <div className="h-2.5 w-2/3 rounded-full bg-white" />
          <div className="mt-1.5 h-1.5 w-1/3 rounded-full bg-[#fbe7c6]" />
        </div>
      ) : (
        <div className={t === "minimal" ? "flex flex-col items-center" : ""}>
          <div className={`h-2.5 w-2/3 rounded-full ${t === "classic" ? "bg-[#1f4d3a]" : "bg-[#111]"}`} />
          <div className="mt-1.5 h-1.5 w-1/3 rounded-full bg-[#9a9a9a]" />
        </div>
      )}
      <div className={`mt-3 h-[2px] ${t === "minimal" ? "bg-[#111]" : t === "classic" ? "bg-[#d9cbbe]" : "w-1/4 bg-[#e9a23b]"}`} />
      <div className="mt-2 space-y-1.5">
        <div className={`${line} w-full`} />
        <div className={`${line} w-5/6`} />
        <div className={`${line} w-2/3`} />
      </div>
    </div>
  );
}

export function TemplatePicker({
  draftId,
  value,
  onChange,
  dir,
}: {
  draftId: string;
  value: ResumeTemplate;
  onChange: (t: ResumeTemplate) => void;
  dir?: "rtl" | "ltr";
}) {
  async function choose(t: ResumeTemplate) {
    onChange(t);
    await fetch(`/api/builder/${draftId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: t }),
    }).catch(() => undefined);
  }
  return (
    <fieldset>
      <legend className="mb-3 font-semibold">עיצוב</legend>
      <div className="grid grid-cols-3 gap-3" dir={dir}>
        {(Object.keys(TEMPLATE_NAMES) as ResumeTemplate[]).map((t) => (
          <label
            key={t}
            className="cursor-pointer rounded-2xl border-2 border-line bg-paper-2 p-2.5 transition has-[:checked]:border-forest has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-amber-ink"
          >
            <input type="radio" name="template" value={t} checked={value === t} onChange={() => choose(t)} className="sr-only" />
            <Swatch t={t} />
            <span className="mt-2 block text-center text-sm font-semibold" dir="rtl">
              {TEMPLATE_NAMES[t]}
            </span>
          </label>
        ))}
      </div>
      <p className="hint mt-2">כל התבניות בנויות בעמודה אחת עם טקסט אמיתי, כך שמערכות סינון קוראות אותן. קובץ ה-Word תמיד נקי ופשוט.</p>
    </fieldset>
  );
}
