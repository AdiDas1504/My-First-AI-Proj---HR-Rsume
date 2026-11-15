"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

export function MobileNav({ items, loggedIn }: { items: { href: string; label: string }[]; loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-secondary !min-h-10 !px-4"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "סגירה" : "תפריט"}
      </button>
      {open && (
        <div id={panelId} className="absolute inset-x-0 top-16 border-b border-line bg-paper shadow-lift">
          <nav aria-label="ניווט ראשי (נייד)" className="container-page py-4">
            <ul className="flex flex-col">
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} onClick={close} className="block rounded-xl px-3 py-3 text-lg hover:bg-card">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-col gap-2">
              {loggedIn ? (
                <Link href="/app" onClick={close} className="btn btn-primary">
                  האזור שלי
                </Link>
              ) : (
                <>
                  <Link href="/scan" onClick={close} className="btn btn-primary">
                    בדיקת התאמה חינם
                  </Link>
                  <Link href="/login" onClick={close} className="btn btn-secondary">
                    כניסה
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
