import { scoreLabel } from "@/lib/scoring";

export function ScoreRing({ score, size = "lg" }: { score: number; size?: "lg" | "sm" }) {
  const big = size === "lg";
  const color = score >= 60 ? "var(--color-forest)" : score >= 40 ? "var(--color-amber)" : "var(--color-danger)";
  return (
    <div className="flex items-center gap-4">
      <div className={`relative ${big ? "size-28" : "size-14"}`} role="img" aria-label={`ציון התאמה ${score} מתוך 100, ${scoreLabel(score)}`}>
        <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden="true">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-line)" strokeWidth="3.5" />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${Math.max(score, 1)} 100`}
          />
        </svg>
        <span aria-hidden="true" className={`absolute inset-0 flex items-center justify-center font-display font-bold text-ink ${big ? "text-4xl" : "text-lg"}`}>
          {score}
        </span>
      </div>
      {big && (
        <div aria-hidden="true">
          <p className="text-sm text-muted">ציון התאמה</p>
          <p className="font-display text-2xl font-bold">{scoreLabel(score)}</p>
        </div>
      )}
    </div>
  );
}
