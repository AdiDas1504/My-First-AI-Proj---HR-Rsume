"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ResumeField } from "./upload-fields";
import { ProgressNote } from "./progress-note";

/** Two ways in: improve an existing resume, or start from scratch. */
export function BuilderStart() {
  const router = useRouter();
  const [path, setPath] = useState<"improve" | "scratch" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(body: FormData | null) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/builder", body
        ? { method: "POST", body }
        : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "scratch" }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "משהו השתבש. נסו שוב.");
      router.push(`/builder/${data.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className={`card p-6 transition ${path === "improve" ? "ring-2 ring-forest" : ""}`}>
        <h2 className="text-2xl">יש לי קורות חיים, שפרו אותם</h2>
        <p className="mt-1 text-muted">מעלים את הקובץ, אנחנו מראים מה מחליש אותו ושואלים שאלות ממוקדות כדי לחזק כל תפקיד.</p>
        {path === "improve" ? (
          <form
            className="mt-5 space-y-4"
            aria-busy={busy}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              fd.set("mode", "improve");
              start(fd);
            }}
          >
            <ResumeField />
            {busy ? (
              <ProgressNote steps={["קוראים את קורות החיים…", "בודקים מה מחליש אותם…", "מכינים שאלות לכל תפקיד…"]} />
            ) : (
              <button type="submit" className="btn btn-primary w-full">
                להתחיל
              </button>
            )}
          </form>
        ) : (
          <button type="button" className="btn btn-primary mt-5" onClick={() => setPath("improve")} disabled={busy}>
            לשפר את קורות החיים שלי
          </button>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-2xl">מתחילים מאפס</h2>
        <p className="mt-1 text-muted">אין קורות חיים, או שעדיף להתחיל מחדש? נעבור יחד שלב אחרי שלב. מתאים גם אחרי צבא, לסטודנטים ולמי שמחליף תחום.</p>
        <button type="button" className="btn btn-secondary mt-5" onClick={() => start(null)} disabled={busy}>
          לבנות קורות חיים חדשים
        </button>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
