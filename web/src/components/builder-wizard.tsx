"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { emptyRole, readiness } from "@/lib/builder";
import { BUILDER_PRODUCT, formatPrice } from "@/lib/plans";
import type { BuilderAnswers, BuilderDraft, BuilderRole, ResumeTemplate } from "@/lib/types";
import { ProgressNote } from "./progress-note";
import { TemplatePicker } from "./template-picker";

type ClientDraft = Omit<BuilderDraft, "sourceResumeText">;

const STEPS = [
  { id: "target", label: "המשרה שמחפשים" },
  { id: "personal", label: "פרטים אישיים" },
  { id: "experience", label: "ניסיון" },
  { id: "education", label: "השכלה" },
  { id: "skills", label: "כישורים" },
  { id: "finish", label: "סיום" },
] as const;

const SENIORITY = ["בלי ניסיון / אחרי צבא", "סטודנט/ית", "ג'וניור (עד 3 שנים)", "מנוסה (3-7 שנים)", "בכיר/ה", "ניהול"];

function Field({
  label,
  value,
  onChange,
  hint,
  multiline,
  dir,
  type = "text",
  placeholder,
  rows,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  multiline?: boolean;
  dir?: "rtl" | "ltr" | "auto";
  type?: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-semibold">{label}</span>
      {multiline ? (
        <textarea className={`input ${rows ? "!min-h-0" : ""}`} dir={dir} value={value} placeholder={placeholder} rows={rows} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" dir={dir} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <span className="hint mt-1.5 block">{hint}</span>}
    </label>
  );
}

export function BuilderWizard({ draft, autoGenerate }: { draft: ClientDraft; autoGenerate: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState(autoGenerate ? STEPS.length - 1 : 0);
  const [answers, setAnswers] = useState<BuilderAnswers>(draft.answers);
  const [template, setTemplate] = useState<ResumeTemplate>(draft.template);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty" | "error">("saved");
  const [followupBusy, setFollowupBusy] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const lang = answers.target.language;
  const dir = lang === "he" ? "rtl" : "ltr";

  const save = useCallback(
    async (next: BuilderAnswers) => {
      setSaveState("saving");
      try {
        const res = await fetch(`/api/builder/${draft.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: next }),
        });
        if (!res.ok) throw new Error();
        setSaveState("saved");
        return true;
      } catch {
        setSaveState("error");
        return false;
      }
    },
    [draft.id],
  );

  // Autosave a moment after the person stops typing.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("dirty");
    const t = setTimeout(() => save(answers), 1200);
    return () => clearTimeout(t);
  }, [answers, save]);

  const set = (patch: Partial<BuilderAnswers>) => setAnswers((a) => ({ ...a, ...patch }));
  const setRole = (i: number, patch: Partial<BuilderRole>) =>
    setAnswers((a) => ({ ...a, roles: a.roles.map((r, j) => (j === i ? { ...r, ...patch } : r)) }));

  function go(to: number) {
    setStep(to);
    setError(null);
    save(answers);
    setTimeout(() => headingRef.current?.focus(), 30);
  }

  async function askFollowups(i: number) {
    setFollowupBusy(i);
    setError(null);
    try {
      const res = await fetch(`/api/builder/${draft.id}/followups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: answers.roles[i], target: answers.target }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "לא הצלחנו להביא שאלות. נסו שוב.");
      const existing = new Set(answers.roles[i].followups.map((f) => f.question));
      const fresh = (data.questions as string[]).filter((q) => !existing.has(q)).map((q) => ({ question: q, answer: "" }));
      setRole(i, { followups: [...answers.roles[i].followups, ...fresh].slice(0, 8) });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setFollowupBusy(null);
    }
  }

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/builder/${draft.id}/generate`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "היצירה נכשלה. נסו שוב.");
      router.replace(`/builder/${draft.id}`);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setGenerating(false);
    }
  }, [draft.id, router]);

  const startedAuto = useRef(false);
  useEffect(() => {
    if (autoGenerate && !startedAuto.current) {
      startedAuto.current = true;
      generate();
    }
  }, [autoGenerate, generate]);

  async function toCheckoutOrGenerate() {
    const saved = await save(answers);
    if (!saved) {
      setError("לא הצלחנו לשמור. בדקו את החיבור ונסו שוב.");
      return;
    }
    if (draft.unlocked) generate();
    else router.push(`/checkout?product=builder&draft=${draft.id}`);
  }

  const ready = readiness(answers);
  const current = STEPS[step];

  return (
    <div className="container-page py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4">
          <Link href="/builder" className="link text-sm">
            → כל קורות החיים שלי
          </Link>
          <p className="text-sm text-muted" role="status" aria-live="polite">
            {saveState === "saving" ? "שומרים…" : saveState === "saved" ? "נשמר" : saveState === "error" ? "השמירה נכשלה" : ""}
          </p>
        </div>

        {/* ---------- progress ---------- */}
        <nav aria-label="שלבי הבנייה" className="mt-5">
          <ol className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-current={i === step ? "step" : undefined}
                  className="group w-full text-start"
                >
                  <span className={`block h-1.5 rounded-full transition ${i <= step ? "bg-forest" : "bg-line"}`} />
                  <span className={`mt-2 hidden text-xs sm:block ${i === step ? "font-bold text-forest" : "text-muted group-hover:text-ink"}`}>
                    {s.label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <p className="mt-8 text-sm font-semibold text-muted">
          שלב {step + 1} מתוך {STEPS.length}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-1 text-3xl md:text-4xl">
          {current.label}
        </h1>

        {/* ---------- improve mode: what's weak today ---------- */}
        {step === 0 && draft.mode === "improve" && draft.diagnosis.length > 0 && (
          <section aria-labelledby="diag" className="mt-6 rounded-2xl border border-amber/40 bg-amber-soft/50 p-6">
            <h2 id="diag" className="font-sans text-lg font-bold text-amber-ink">
              מה מחליש את קורות החיים שלך היום
            </h2>
            <ul className="mt-3 list-disc space-y-1.5 ps-5">
              {draft.diagnosis.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-muted">מילאנו כבר את מה שמצאנו בקובץ. בדקו, השלימו וענו על שאלות ההמשך בשלב הניסיון.</p>
          </section>
        )}

        <div className="card mt-6 space-y-6 p-6 md:p-8">
          {current.id === "target" && (
            <>
              <Field
                label="איזו משרה מחפשים?"
                value={answers.target.role}
                onChange={(v) => set({ target: { ...answers.target, role: v } })}
                placeholder="למשל: מנהל/ת פרויקטים, נציג/ת שירות, מפתח/ת Full Stack"
                hint="ככה נדע מה להדגיש. אפשר לשנות אחר כך."
              />
              <Field
                label="תחום (לא חובה)"
                value={answers.target.field}
                onChange={(v) => set({ target: { ...answers.target, field: v } })}
                placeholder="למשל: לוגיסטיקה, פינטק, חינוך"
              />
              <fieldset>
                <legend className="mb-2 font-semibold">רמת ניסיון</legend>
                <div className="flex flex-wrap gap-2">
                  {SENIORITY.map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2 has-[:checked]:border-forest has-[:checked]:bg-mint">
                      <input
                        type="radio"
                        name="seniority"
                        className="size-4 accent-forest"
                        checked={answers.target.seniority === s}
                        onChange={() => set({ target: { ...answers.target, seniority: s } })}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-2 font-semibold">שפת קורות החיים</legend>
                <div className="flex gap-2">
                  {[
                    { v: "he" as const, l: "עברית" },
                    { v: "en" as const, l: "English" },
                  ].map((o) => (
                    <label key={o.v} className="flex cursor-pointer items-center gap-2 rounded-full border border-line bg-paper-2 px-4 py-2 has-[:checked]:border-forest has-[:checked]:bg-mint">
                      <input
                        type="radio"
                        name="language"
                        className="size-4 accent-forest"
                        checked={answers.target.language === o.v}
                        onChange={() => set({ target: { ...answers.target, language: o.v } })}
                      />
                      {o.l}
                    </label>
                  ))}
                </div>
                <p className="hint mt-1.5">אפשר לענות על השאלות בעברית גם אם קורות החיים יהיו באנגלית. התרגום נאמן למה שכתבתם.</p>
              </fieldset>
            </>
          )}

          {current.id === "personal" && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="שם מלא" value={answers.personal.fullName} onChange={(v) => set({ personal: { ...answers.personal, fullName: v } })} />
              <Field label="עיר מגורים" value={answers.personal.location} onChange={(v) => set({ personal: { ...answers.personal, location: v } })} hint="עיר בלבד, בלי כתובת מלאה" />
              <Field label="טלפון" dir="ltr" type="tel" value={answers.personal.phone} onChange={(v) => set({ personal: { ...answers.personal, phone: v } })} />
              <Field label="אימייל" dir="ltr" type="email" value={answers.personal.email} onChange={(v) => set({ personal: { ...answers.personal, email: v } })} />
              <div className="sm:col-span-2">
                <Field
                  label="קישורים (לא חובה)"
                  dir="ltr"
                  value={answers.personal.links}
                  onChange={(v) => set({ personal: { ...answers.personal, links: v } })}
                  placeholder="linkedin.com/in/…, תיק עבודות"
                  hint="מופרדים בפסיק"
                />
              </div>
            </div>
          )}

          {current.id === "experience" && (
            <>
              <p className="text-muted">
                כתבו במילים שלכם מה עשיתם. לא צריך לנסח יפה, את זה נעשה אנחנו. שירות צבאי או לאומי, התנדבות ועבודות סטודנט נחשבים. התחילו מהתפקיד האחרון.
              </p>
              {answers.roles.map((r, i) => (
                <section key={i} aria-label={`תפקיד ${i + 1}`} className="space-y-4 rounded-2xl bg-paper-2 p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-sans text-lg font-bold">תפקיד {i + 1}</h2>
                    {answers.roles.length > 1 && (
                      <button type="button" className="text-sm text-danger underline" onClick={() => set({ roles: answers.roles.filter((_, j) => j !== i) })}>
                        הסרה
                      </button>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="תפקיד" value={r.title} onChange={(v) => setRole(i, { title: v })} />
                    <Field label="ארגון / חברה / יחידה" value={r.organization} onChange={(v) => setRole(i, { organization: v })} />
                    <Field label="מתי התחלת" value={r.start} onChange={(v) => setRole(i, { start: v })} placeholder="2021" dir="auto" />
                    <Field label="עד מתי" value={r.end} onChange={(v) => setRole(i, { end: v })} placeholder="ריק = עד היום" dir="auto" />
                  </div>
                  <Field
                    label="מה עשית שם?"
                    multiline
                    rows={5}
                    value={r.description}
                    onChange={(v) => setRole(i, { description: v })}
                    placeholder="למשל: הייתי אחראית על משמרות במחסן, טיפלתי בהזמנות מול ספקים, הדרכתי עובדים חדשים…"
                  />

                  {r.followups.length > 0 && (
                    <div className="space-y-4 border-t border-line pt-4">
                      <p className="font-semibold text-forest">שאלות שיעזרו לחזק את התפקיד הזה (ענו רק על מה שנכון)</p>
                      {r.followups.map((f, k) => (
                        <Field
                          key={k}
                          label={f.question}
                          multiline
                          rows={2}
                          value={f.answer}
                          onChange={(v) =>
                            setRole(i, { followups: r.followups.map((x, m) => (m === k ? { ...x, answer: v } : x)) })
                          }
                        />
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    className="btn btn-secondary !min-h-10"
                    onClick={() => askFollowups(i)}
                    disabled={followupBusy !== null || !r.title.trim()}
                  >
                    {followupBusy === i ? "חושבים על שאלות…" : r.followups.length ? "עוד שאלות לחיזוק" : "שאלות שיעזרו לחזק את התפקיד"}
                  </button>
                </section>
              ))}
              <button type="button" className="btn btn-quiet" onClick={() => set({ roles: [...answers.roles, emptyRole()] })}>
                + תפקיד נוסף
              </button>
            </>
          )}

          {current.id === "education" && (
            <>
              <p className="text-muted">תארים, תעודות מקצועיות וקורסים משמעותיים. אם אין, אפשר לדלג.</p>
              {answers.education.map((e, i) => (
                <section key={i} aria-label={`השכלה ${i + 1}`} className="grid gap-4 rounded-2xl bg-paper-2 p-5 sm:grid-cols-2">
                  <Field label="תואר / תעודה / קורס" value={e.degree} onChange={(v) => set({ education: answers.education.map((x, j) => (j === i ? { ...x, degree: v } : x)) })} />
                  <Field label="מוסד" value={e.institution} onChange={(v) => set({ education: answers.education.map((x, j) => (j === i ? { ...x, institution: v } : x)) })} />
                  <Field label="משנה" dir="auto" value={e.start} onChange={(v) => set({ education: answers.education.map((x, j) => (j === i ? { ...x, start: v } : x)) })} />
                  <Field label="עד שנה" dir="auto" value={e.end} onChange={(v) => set({ education: answers.education.map((x, j) => (j === i ? { ...x, end: v } : x)) })} />
                  <div className="sm:col-span-2">
                    <Field
                      label="פרטים (לא חובה)"
                      value={e.details}
                      onChange={(v) => set({ education: answers.education.map((x, j) => (j === i ? { ...x, details: v } : x)) })}
                      placeholder="התמחות, ממוצע, פרויקט גמר"
                    />
                  </div>
                  <button type="button" className="text-start text-sm text-danger underline" onClick={() => set({ education: answers.education.filter((_, j) => j !== i) })}>
                    הסרה
                  </button>
                </section>
              ))}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => set({ education: [...answers.education, { degree: "", institution: "", start: "", end: "", details: "" }] })}
              >
                + השכלה
              </button>
            </>
          )}

          {current.id === "skills" && (
            <>
              <Field
                label="כישורים, כלים ותוכנות"
                multiline
                rows={3}
                value={answers.skills}
                onChange={(v) => set({ skills: v })}
                placeholder="Excel, SAP, שירות לקוחות, ניהול צוות…"
                hint="מופרדים בפסיק. רק דברים שאתם באמת יודעים."
              />
              <Field label="שפות" value={answers.languages} onChange={(v) => set({ languages: v })} placeholder="עברית (שפת אם), אנגלית (רמה גבוהה)" />
              <Field label="הסמכות ורישיונות (לא חובה)" value={answers.certifications} onChange={(v) => set({ certifications: v })} placeholder="רישיון נהיגה, מלגזה, PMP…" />
              <Field
                label="עוד משהו שחשוב שנדע? (לא חובה)"
                multiline
                rows={3}
                value={answers.extra}
                onChange={(v) => set({ extra: v })}
                placeholder="התנדבות, פרויקטים אישיים, פרסים, תחביבים רלוונטיים"
              />
            </>
          )}

          {current.id === "finish" && (
            <>
              {!ready.ok ? (
                <div className="rounded-2xl bg-amber-soft px-5 py-4 text-amber-ink">
                  <p className="font-semibold">כמעט שם. חסר עוד:</p>
                  <ul className="mt-1 list-disc ps-5">
                    {ready.missing.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="rounded-2xl bg-mint px-5 py-4 text-forest">
                  <strong>יש לנו את כל מה שצריך.</strong> נכתוב קורות חיים מקצועיים רק מהעובדות שנתתם.
                </p>
              )}

              <TemplatePicker draftId={draft.id} value={template} onChange={setTemplate} dir={dir} />

              {generating ? (
                <ProgressNote steps={["מסדרים את הניסיון שלך…", "כותבים שורות הישג מהתשובות שלך…", "מנסחים תקציר מקצועי…", "מריצים בדיקת יושר…", "עוד כמה שניות…"]} />
              ) : draft.unlocked ? (
                <button type="button" className="btn btn-primary w-full text-lg" disabled={!ready.ok} onClick={toCheckoutOrGenerate}>
                  ליצירת קורות החיים
                </button>
              ) : (
                <div className="rounded-2xl border border-line p-5">
                  <p className="font-display text-2xl font-bold">
                    {BUILDER_PRODUCT.name} · <span className="text-forest">{formatPrice(BUILDER_PRODUCT.priceAgorot)}</span>
                  </p>
                  <p className="mt-1 text-muted">תשלום חד-פעמי, בלי מנוי. כולל עריכה ללא הגבלה, 3 תבניות והורדה ל-Word ול-PDF.</p>
                  <button type="button" className="btn btn-primary mt-4 w-full text-lg" disabled={!ready.ok} onClick={toCheckoutOrGenerate}>
                    ליצירת קורות החיים · {formatPrice(BUILDER_PRODUCT.priceAgorot)}
                  </button>
                </div>
              )}
            </>
          )}

          {error && (
            <p role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-danger">
              {error}
            </p>
          )}
        </div>

        {/* ---------- step navigation ---------- */}
        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <button type="button" className="btn btn-secondary" onClick={() => go(step - 1)}>
              → הקודם
            </button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 && (
            <button type="button" className="btn btn-primary" onClick={() => go(step + 1)}>
              הבא ←
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
