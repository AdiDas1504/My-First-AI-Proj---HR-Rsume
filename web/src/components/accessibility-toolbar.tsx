"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

const OPTIONS = [
  { key: "a11y-text-lg", label: "הגדלת טקסט" },
  { key: "a11y-text-xl", label: "הגדלת טקסט נוספת" },
  { key: "a11y-contrast", label: "ניגודיות גבוהה" },
  { key: "a11y-links", label: "הדגשת קישורים" },
  { key: "a11y-readable", label: "גופן קריא" },
  { key: "a11y-no-motion", label: "עצירת אנימציות" },
] as const;

type Prefs = Partial<Record<(typeof OPTIONS)[number]["key"], boolean>>;

function load(): Prefs {
  try {
    return JSON.parse(localStorage.getItem("jf-a11y") || "{}");
  } catch {
    return {};
  }
}

function apply(prefs: Prefs) {
  const list = document.documentElement.classList;
  for (const o of OPTIONS) list.toggle(o.key, Boolean(prefs[o.key]));
  try {
    localStorage.setItem("jf-a11y", JSON.stringify(prefs));
  } catch {
    /* storage unavailable: preferences last for this page only */
  }
}

export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>({});
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setPrefs(load()), []);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("input")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (key: keyof Prefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    if (key === "a11y-text-lg" && next[key]) next["a11y-text-xl"] = false;
    if (key === "a11y-text-xl" && next[key]) next["a11y-text-lg"] = false;
    setPrefs(next);
    apply(next);
  };

  const reset = () => {
    setPrefs({});
    apply({});
  };

  return (
    <div className="no-print fixed bottom-4 left-4 z-40 flex flex-col items-end">
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="הגדרות נגישות"
          className="card mb-3 w-72 p-4"
        >
          <h2 className="font-sans text-base font-bold">הגדרות נגישות</h2>
          <ul className="mt-3 space-y-1">
            {OPTIONS.map((o) => (
              <li key={o.key}>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-paper">
                  <span>{o.label}</span>
                  <input
                    type="checkbox"
                    className="size-5 accent-forest"
                    checked={Boolean(prefs[o.key])}
                    onChange={() => toggle(o.key)}
                  />
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm">
            <button type="button" className="link" onClick={reset}>
              איפוס
            </button>
            <Link href="/accessibility" className="link">
              הצהרת נגישות
            </Link>
          </div>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex size-12 items-center justify-center rounded-full bg-forest text-white shadow-lift transition hover:bg-forest-800"
      >
        <span className="sr-only">{open ? "סגירת הגדרות נגישות" : "פתיחת הגדרות נגישות"}</span>
        <svg viewBox="0 0 24 24" className="size-7" aria-hidden="true" fill="currentColor">
          <circle cx="12" cy="4.5" r="2.2" />
          <path d="M4 8h16v2.2h-5.4V14l2.1 7h-2.4L12 15.6 9.7 21H7.3l2.1-7v-3.8H4z" />
        </svg>
      </button>
    </div>
  );
}
