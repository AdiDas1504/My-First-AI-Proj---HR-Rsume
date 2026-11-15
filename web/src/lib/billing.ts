import "server-only";
import { randomUUID } from "node:crypto";
import { config, demo, demoShortcutsAllowed } from "./config";
import { getStore } from "./store";
import { PLANS, type PlanId } from "./plans";
import { signToken, verifyToken } from "./session";
import {
  canPurchase,
  computeEntitlement,
  periodFrom,
  usageWindowStart,
  type Entitlement,
} from "./entitlement";
import type { Subscription, User } from "./types";

/**
 * Billing facade. Today only the "demo" provider exists: checkout is simulated
 * in-app and nothing is charged. A real Israeli processor (e.g. Grow, Cardcom,
 * PayPlus, Tranzila) plugs in at three points, marked PROVIDER below:
 *   1. createCheckout -> redirect to the processor's hosted payment page
 *   2. a webhook route -> call activateSubscription / renewSubscription
 *   3. cancel -> stop the recurring charge (standing order) at the processor
 */

export async function getEntitlement(userId: string): Promise<Entitlement> {
  const store = getStore();
  let sub = await store.getSubscription(userId);
  if (sub) sub = await settlePeriod(sub);
  if (!sub) return computeEntitlement(null, new Date(), 0);
  const now = new Date();
  const used = await store.countUsage(userId, "tailor", usageWindowStart(sub, now));
  return computeEntitlement(sub, now, used);
}

/** Expire or renew a subscription whose period has ended. */
async function settlePeriod(sub: Subscription): Promise<Subscription> {
  if (sub.status === "expired" || Date.parse(sub.currentPeriodEnd) > Date.now()) return sub;
  const store = getStore();
  if (sub.cancelAtPeriodEnd || !demo.payments) {
    // PROVIDER: with a real processor, renewal arrives by webhook. Until it does,
    // access ends at period end.
    const expired = { ...sub, status: "expired" as const };
    await store.upsertSubscription(expired);
    return expired;
  }
  // Demo: simulate the automatic renewal charge.
  const next = PLANS[sub.plan].renewsTo;
  const renewed: Subscription = {
    ...sub,
    plan: next,
    status: "active",
    ...periodFrom(new Date(sub.currentPeriodEnd), next),
  };
  await store.upsertSubscription(renewed);
  await store.addPayment({
    id: randomUUID(),
    userId: sub.userId,
    plan: next,
    amountAgorot: PLANS[next].priceAgorot,
    status: "paid",
    providerRef: "demo-renewal",
    createdAt: new Date().toISOString(),
  });
  return settlePeriod(renewed);
}

export async function createCheckout(user: User, plan: PlanId): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const ent = await getEntitlement(user.id);
  const allowed = canPurchase(plan, { trialUsed: Boolean(user.trialUsedAt), hasActive: ent.active });
  if (!allowed.ok) return { ok: false, error: allowed.reason };
  if (demo.payments && !demoShortcutsAllowed) {
    return { ok: false, error: "התשלומים עוד לא נפתחו. נשמח לראות אותך בקרוב." };
  }

  // PROVIDER: replace with the processor's API call that returns a hosted-page URL.
  const token = await signToken({ sub: user.id, plan, typ: "checkout" }, "30m");
  return { ok: true, url: `${config.appUrl}/checkout/demo?t=${encodeURIComponent(token)}` };
}

export async function completeDemoCheckout(token: string, userId: string): Promise<{ ok: true; plan: PlanId } | { ok: false; error: string }> {
  if (!demo.payments || !demoShortcutsAllowed) return { ok: false, error: "Demo checkout is disabled." };
  const payload = await verifyToken<{ sub?: string; plan?: PlanId; typ?: string }>(token);
  if (!payload || payload.typ !== "checkout" || payload.sub !== userId || !payload.plan || !(payload.plan in PLANS)) {
    return { ok: false, error: "קישור התשלום פג תוקף. נסו שוב מעמוד המחירים." };
  }
  const user = await getStore().getUser(userId);
  const ent = await getEntitlement(userId);
  const allowed = canPurchase(payload.plan, { trialUsed: Boolean(user?.trialUsedAt), hasActive: ent.active });
  if (!allowed.ok) return { ok: false, error: allowed.reason };
  await activateSubscription(userId, payload.plan, `demo-${randomUUID()}`);
  return { ok: true, plan: payload.plan };
}

/** Called after a successful first payment (demo checkout or provider webhook). */
export async function activateSubscription(userId: string, plan: PlanId, providerRef: string) {
  const store = getStore();
  await store.upsertSubscription({
    userId,
    plan,
    status: "active",
    cancelAtPeriodEnd: false,
    providerRef,
    ...periodFrom(new Date(), plan),
  });
  if (plan === "trial") await store.markTrialUsed(userId);
  await store.addPayment({
    id: randomUUID(),
    userId,
    plan,
    amountAgorot: PLANS[plan].priceAgorot,
    status: "paid",
    providerRef,
    createdAt: new Date().toISOString(),
  });
}

export async function setCancelAtPeriodEnd(userId: string, cancel: boolean) {
  const store = getStore();
  const sub = await store.getSubscription(userId);
  if (!sub || sub.status === "expired") return;
  // PROVIDER: cancel / restore the standing order at the processor here.
  await store.upsertSubscription({ ...sub, cancelAtPeriodEnd: cancel, status: cancel ? "canceled" : "active" });
}
