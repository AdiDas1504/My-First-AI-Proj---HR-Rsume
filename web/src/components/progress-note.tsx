"use client";

import { useEffect, useState } from "react";

/** Rotating status line for long AI calls, announced politely to screen readers. */
export function ProgressNote({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => Math.min(v + 1, steps.length - 1)), 6000);
    return () => clearInterval(t);
  }, [steps.length]);
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-mint px-5 py-4 text-forest" role="status" aria-live="polite">
      <span aria-hidden="true" className="size-5 animate-spin rounded-full border-[3px] border-forest/25 border-t-forest" />
      <span className="font-semibold">{steps[i]}</span>
    </div>
  );
}
