import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DemoPayForm } from "@/components/demo-pay-form";
import { demo } from "@/lib/config";
import { PLANS, formatPrice } from "@/lib/plans";
import { getCurrentUser, verifyToken } from "@/lib/session";
import type { PlanId } from "@/lib/plans";

export const metadata: Metadata = { title: "תשלום (הדגמה)", robots: { index: false } };

export default async function DemoCheckoutPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  if (!demo.payments) notFound();
  const token = (await searchParams).t ?? "";
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const payload = await verifyToken<{ plan?: PlanId; sub?: string }>(token);
  if (!payload?.plan || payload.sub !== user.id) redirect("/pricing");
  const plan = PLANS[payload.plan];

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-md">
        <p className="rounded-xl bg-amber-soft px-4 py-3 text-amber-ink">
          <strong>עמוד תשלום להדגמה.</strong> כאן יופיע עמוד הסליקה המאובטח של חברת האשראי. לא מתבצע חיוב.
        </p>
        <h1 className="mt-8 text-3xl">
          {plan.name} · {formatPrice(plan.priceAgorot)}
        </h1>
        <DemoPayForm token={token} />
      </div>
    </div>
  );
}
