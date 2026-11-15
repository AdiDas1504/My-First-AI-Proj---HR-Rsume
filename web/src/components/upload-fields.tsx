"use client";

import { useId, useState } from "react";

export function ResumeField() {
  const [name, setName] = useState<string | null>(null);
  const id = useId();
  return (
    <div>
      <span className="label" id={`${id}-label`}>
        קורות החיים שלך
      </span>
      <label
        htmlFor={id}
        className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-paper-2 px-6 py-8 text-center transition hover:border-forest focus-within:border-forest"
      >
        <svg viewBox="0 0 24 24" className="size-8 text-forest" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M12 18v-6m-3 3 3-3 3 3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {name ? (
          <span className="font-semibold text-forest">{name}</span>
        ) : (
          <span className="font-semibold">בחירת קובץ PDF או Word</span>
        )}
        <span className="hint">עד 5MB. הקובץ עצמו לא נשמר אצלנו.</span>
        <input
          id={id}
          name="resume"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          aria-labelledby={`${id}-label`}
          required
          onChange={(e) => setName(e.target.files?.[0]?.name ?? null)}
        />
      </label>
    </div>
  );
}

type Mode = "url" | "text" | "file";

const MODES: { id: Mode; label: string }[] = [
  { id: "url", label: "קישור" },
  { id: "text", label: "הדבקת טקסט" },
  { id: "file", label: "קובץ או צילום מסך" },
];

export function JobField() {
  const [mode, setMode] = useState<Mode>("url");
  const [fileName, setFileName] = useState<string | null>(null);
  const id = useId();
  return (
    <fieldset>
      <legend className="label">המשרה</legend>
      <div role="group" aria-label="איך להוסיף את המשרה" className="mb-3 inline-flex flex-wrap gap-1 rounded-full bg-paper p-1">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-full px-4 py-2 text-[0.95rem] font-semibold transition ${
              mode === m.id ? "bg-card text-forest shadow-soft" : "text-muted hover:text-ink"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "url" && (
        <div>
          <label htmlFor={`${id}-url`} className="sr-only">
            קישור למודעת הדרושים
          </label>
          <input
            id={`${id}-url`}
            name="jobUrl"
            type="url"
            dir="ltr"
            className="input"
            placeholder="https://www.linkedin.com/jobs/view/…"
            aria-describedby={`${id}-url-hint`}
            required
          />
          <p id={`${id}-url-hint`} className="hint mt-2">
            חלק מהאתרים חוסמים קריאה אוטומטית. אם זה קורה, הדביקו את הטקסט או העלו צילום מסך.
          </p>
        </div>
      )}
      {mode === "text" && (
        <div>
          <label htmlFor={`${id}-text`} className="sr-only">
            טקסט מודעת הדרושים
          </label>
          <textarea id={`${id}-text`} name="jobText" className="input" placeholder="הדביקו כאן את המודעה המלאה: תיאור התפקיד, דרישות וכו׳" required />
        </div>
      )}
      {mode === "file" && (
        <div>
          <label
            htmlFor={`${id}-file`}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-line bg-paper-2 px-5 py-5 transition hover:border-forest focus-within:border-forest"
          >
            <span className="font-semibold">{fileName ?? "בחירת PDF, Word או תמונה (PNG/JPG)"}</span>
            <span className="btn btn-secondary !min-h-9 !px-4 text-sm" aria-hidden="true">
              עיון
            </span>
            <input
              id={`${id}-file`}
              name="jobFile"
              type="file"
              accept=".pdf,.docx,.png,.jpg,.jpeg,.webp"
              className="sr-only"
              required
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </div>
      )}
    </fieldset>
  );
}
