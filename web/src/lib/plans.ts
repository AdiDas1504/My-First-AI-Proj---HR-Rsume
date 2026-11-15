// Prices are in agorot and include VAT. Shared by server and client code.

export type PlanId = "trial" | "monthly" | "quarterly";

export type Plan = {
  id: PlanId;
  name: string;
  priceAgorot: number;
  periodDays: number;
  /** Tailored resumes allowed per 30-day window (fair use, protects AI costs). */
  tailorQuota: number;
  /** Plan the subscription renews into when the period ends. */
  renewsTo: PlanId;
  blurb: string;
};

export const PLANS: Record<PlanId, Plan> = {
  trial: {
    id: "trial",
    name: "שבוע היכרות",
    priceAgorot: 1990,
    periodDays: 7,
    tailorQuota: 10,
    renewsTo: "monthly",
    blurb: "7 ימים מלאים, ואחר כך מנוי חודשי. אפשר לבטל בכל רגע.",
  },
  monthly: {
    id: "monthly",
    name: "מנוי חודשי",
    priceAgorot: 4990,
    periodDays: 30,
    tailorQuota: 40,
    renewsTo: "monthly",
    blurb: "לחיפוש עבודה פעיל. מתחדש כל חודש, מתבטל בלחיצה.",
  },
  quarterly: {
    id: "quarterly",
    name: "3 חודשים",
    priceAgorot: 11900,
    periodDays: 90,
    tailorQuota: 40,
    renewsTo: "quarterly",
    blurb: "לחיפוש ארוך יותר. יוצא כ-39.70 ₪ לחודש.",
  },
};

export function formatPrice(agorot: number): string {
  const shekels = agorot / 100;
  return `${shekels.toLocaleString("he-IL", {
    minimumFractionDigits: shekels % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })} ₪`;
}

export function isPlanId(value: unknown): value is PlanId {
  return value === "trial" || value === "monthly" || value === "quarterly";
}
