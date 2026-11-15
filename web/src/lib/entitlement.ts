import { PLANS, type PlanId } from "./plans";
import type { Subscription } from "./types";

export type Entitlement = {
  active: boolean;
  plan: PlanId | null;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  quota: number;
  used: number;
  remaining: number;
};

export const NO_ENTITLEMENT: Entitlement = {
  active: false,
  plan: null,
  periodEnd: null,
  cancelAtPeriodEnd: false,
  quota: 0,
  used: 0,
  remaining: 0,
};

/** Start of the window that tailoring usage is counted in. */
export function usageWindowStart(sub: Subscription, now: Date): string {
  const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  return new Date(Math.max(Date.parse(sub.currentPeriodStart), thirtyDaysAgo)).toISOString();
}

export function computeEntitlement(sub: Subscription | null, now: Date, used: number): Entitlement {
  if (!sub || sub.status === "expired" || Date.parse(sub.currentPeriodEnd) <= now.getTime()) {
    return NO_ENTITLEMENT;
  }
  const quota = PLANS[sub.plan].tailorQuota;
  return {
    active: true,
    plan: sub.plan,
    periodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    quota,
    used,
    remaining: Math.max(0, quota - used),
  };
}

export function periodFrom(start: Date, plan: PlanId) {
  const end = new Date(start.getTime() + PLANS[plan].periodDays * 24 * 60 * 60 * 1000);
  return { currentPeriodStart: start.toISOString(), currentPeriodEnd: end.toISOString() };
}

/** Whether a user may buy the given plan right now. */
export function canPurchase(
  plan: PlanId,
  opts: { trialUsed: boolean; hasActive: boolean },
): { ok: true } | { ok: false; reason: string } {
  if (opts.hasActive) return { ok: false, reason: "כבר יש לך מנוי פעיל." };
  if (plan === "trial" && opts.trialUsed) {
    return { ok: false, reason: "שבוע ההיכרות כבר נוצל בחשבון הזה. אפשר להמשיך במנוי חודשי." };
  }
  return { ok: true };
}
