import Link from "next/link";
import { PLANS, formatPrice, type PlanId } from "@/lib/plans";

const FEATURES = [
  "דוח התאמה מלא לכל משרה, עם כל הפערים",
  "קורות חיים מותאמים, מוכנים לשליחה",
  "הורדה ב-Word וב-PDF, בעברית ובאנגלית",
  "מכתב מקדים קצר לכל משרה",
  "בדיקת יושר: סימון כל פרט שלא מופיע במקור",
  "גרסה שמורה לכל משרה לעריכה ולהורדה",
];

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-1 size-4 shrink-0 text-forest" aria-hidden="true">
      <path d="M4 10.5l3.5 3.5L16 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PricingCards({ ctaHref = (plan: PlanId) => `/checkout?plan=${plan}` }: { ctaHref?: (plan: PlanId) => string }) {
  const trial = PLANS.trial;
  const monthly = PLANS.monthly;
  const quarterly = PLANS.quarterly;
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[1.25fr_1fr]">
      <article className="card relative flex flex-col overflow-hidden p-7 md:p-9" aria-labelledby="plan-trial">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 size-64 rounded-full bg-amber-soft/70 blur-2xl" />
        <p className="eyebrow relative">הכי מומלץ להתחלה</p>
        <h3 id="plan-trial" className="relative mt-2 text-3xl md:text-4xl">
          {trial.name}
        </h3>
        <p className="relative mt-4 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold text-forest">{formatPrice(trial.priceAgorot)}</span>
          <span className="text-muted">ל-7 ימים</span>
        </p>
        <p className="relative mt-2 text-muted">
          אחר כך {formatPrice(monthly.priceAgorot)} לחודש. אפשר לבטל בלחיצה אחת לפני שהשבוע נגמר ולא תחויבו שוב.
        </p>
        <ul className="relative mt-6 grid gap-2.5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check />
              <span>{f}</span>
            </li>
          ))}
          <li className="flex gap-2.5">
            <Check />
            <span>עד {trial.tailorQuota} התאמות בשבוע הראשון</span>
          </li>
        </ul>
        <div className="relative mt-8 flex flex-wrap items-center gap-3">
          <Link href={ctaHref("trial")} className="btn btn-primary text-lg">
            להתחיל שבוע ב-{formatPrice(trial.priceAgorot)}
          </Link>
          <span className="text-sm text-muted">פעם אחת לכל מספר טלפון</span>
        </div>
      </article>

      <div className="flex flex-col gap-5">
        {[monthly, quarterly].map((plan) => (
          <article key={plan.id} className="card flex flex-1 flex-col p-7" aria-labelledby={`plan-${plan.id}`}>
            <h3 id={`plan-${plan.id}`} className="text-2xl">
              {plan.name}
            </h3>
            <p className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-4xl font-bold text-forest">{formatPrice(plan.priceAgorot)}</span>
              <span className="text-muted">{plan.id === "monthly" ? "לחודש" : "ל-3 חודשים"}</span>
            </p>
            <p className="mt-2 text-muted">{plan.blurb}</p>
            <p className="mt-1 text-sm text-muted">עד {plan.tailorQuota} התאמות בכל 30 יום.</p>
            <div className="mt-auto pt-5">
              <Link href={ctaHref(plan.id)} className="btn btn-secondary w-full">
                לבחור {plan.name}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
