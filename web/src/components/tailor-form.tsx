"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { JobField, ResumeField } from "./upload-fields";
import { ProgressNote } from "./progress-note";

export function TailorForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tailor", { method: "POST", body: new FormData(e.currentTarget) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "משהו השתבש. נסו שוב.");
      router.push(`/app/doc/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 space-y-7 p-7 md:p-9" aria-busy={busy}>
      <ResumeField />
      <JobField />
      <fieldset>
        <legend className="label">שפת קורות החיים המותאמים</legend>
        <div className="flex flex-wrap gap-4">
          {[
            { v: "auto", l: "לפי שפת המשרה" },
            { v: "he", l: "עברית" },
            { v: "en", l: "English" },
          ].map((o) => (
            <label key={o.v} className="flex items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2 has-[:checked]:border-forest has-[:checked]:bg-mint">
              <input type="radio" name="language" value={o.v} defaultChecked={o.v === "auto"} className="size-4 accent-forest" />
              <span>{o.l}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {error}
        </p>
      )}
      {busy ? (
        <ProgressNote
          steps={[
            "קוראים את קורות החיים…",
            "מזהים את דרישות המשרה…",
            "בודקים כל דרישה מול הניסיון שלך…",
            "מנסחים מחדש בשפה של המשרה…",
            "מריצים בדיקת יושר…",
            "עוד כמה שניות…",
          ]}
        />
      ) : (
        <button type="submit" className="btn btn-primary w-full text-lg">
          ליצירת גרסה מותאמת
        </button>
      )}
    </form>
  );
}
