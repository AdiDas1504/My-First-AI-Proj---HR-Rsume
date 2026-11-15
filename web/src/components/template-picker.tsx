"use client";

import type { ResumeTemplate } from "@/lib/types";
import { TEMPLATE_NAMES } from "./resume-preview";

/** Small visual swatches of the three designs. Saves the choice right away. */
function Swatch({ t }: { t: ResumeTemplate }) {
  const side = t === "classic" ? "bg-[#3e5c80]" : t === "modern" ? "bg-[#1f4d3a]" : "bg-[#e6e1db]";
  const sideLine = t === "minimal" ? "bg-[#9a948e]" : "bg-white/70";
  const head = t === "classic" ? "bg-[#3e5c80]" : t === "modern" ? "bg-[#1f4d3a]" : "bg-[#111]";
  const line = "h-1.5 rounded-full bg-[#d9d4cf]";
  return (
    <div aria-hidden="true" className="grid h-28 grid-cols-[34%_1fr] overflow-hidden rounded-lg bg-white shadow-soft">
      <div className={`space-y-1.5 p-2 ${side}`}>
        <div className={`h-2 w-4/5 rounded-full ${t === "minimal" ? "bg-[#111]" : "bg-white"}`} />
        <div className={`h-1 w-3/5 rounded-full ${sideLine}`} />
        <div className={`h-1 w-2/3 rounded-full ${sideLine}`} />
        <div className={`mt-2 h-1.5 w-1/2 rounded-full ${t === "modern" ? "bg-[#e9a23b]" : sideLine}`} />
        <div className={`h-1 w-3/4 rounded-full ${sideLine}`} />
      </div>
      <div className="space-y-1.5 p-2">
        <div className="h-2 w-1/2 rounded-full bg-[#1c1f1d]" />
        <div className={`${line} w-full`} />
        <div className={`mt-2 h-1.5 w-1/3 rounded-full ${head}`} />
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
      <p className="hint mt-2">העיצוב חל על התצוגה ועל ה-PDF. קובץ ה-Word נשמר בעמודה אחת עם אותם מדורים, כדי שמערכות סינון יקראו אותו בקלות.</p>
    </fieldset>
  );
}
