import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutButton } from "@/components/checkout-button";
import { getEntitlement } from "@/lib/billing";
import { canPurchase } from "@/lib/entitlement";
import { BUILDER_PRODUCT, PLANS, formatPrice, isPlanId } from "@/lib/plans";
import { getStore } from "@/lib/store";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "הצטרפות" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; product?: string; draft?: string }>;
}) {
  const sp = await searchParams;
  if (sp.product === "builder" && sp.draft) return <BuilderCheckout draftId={sp.draft} />;
  const raw = sp.plan;
  const planId = isPlanId(raw) ? raw : "trial";
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout?plan=${planId}`)}`);

  const ent = await getEntitlement(user.id);
  const allowed = canPurchase(planId, { trialUsed: Boolean(user.trialUsedAt), hasActive: ent.active });
  const plan = PLANS[planId];
  const renew = PLANS[plan.renewsTo];

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl">הצטרפות: {plan.name}</h1>
        {!allowed.ok ? (
          <div className="card mt-8 p-8">
            <p className="text-lg">{allowed.reason}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {ent.active ? (
                <Link href="/app" className="btn btn-primary">לאזור האישי</Link>
              ) : (
                <Link href="/checkout?plan=monthly" className="btn btn-primary">למנוי החודשי</Link>
              )}
              <Link href="/pricing" className="btn btn-secondary">כל המסלולים</Link>
            </div>
          </div>
        ) : (
          <div className="card mt-8 p-8">
            <dl className="divide-y divide-line">
              <div className="flex justify-between py-3">
                <dt className="text-muted">מסלול</dt>
                <dd className="font-semibold">{plan.name}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted">לתשלום היום</dt>
                <dd className="font-display text-2xl font-bold text-forest">{formatPrice(plan.priceAgorot)}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-muted">תקופה</dt>
                <dd>{plan.periodDays} ימים</dd>
              </div>
              <div className="flex justify-between gap-6 py-3">
                <dt className="text-muted">אחר כך</dt>
                <dd className="text-left">
                  {formatPrice(renew.priceAgorot)} {renew.id === "quarterly" ? "כל 3 חודשים" : "לחודש"}, עד לביטול
                </dd>
              </div>
            </dl>
            <p className="mt-6 rounded-xl bg-paper-2 p-4 text-[0.95rem]">
              <strong>חשוב לדעת:</strong> המנוי מתחדש אוטומטית בסוף כל תקופה. אפשר לבטל בכל רגע באזור האישי בלחיצה אחת. הביטול נכנס לתוקף מיד וסוגר את הגישה והחזר על התקופה הנוכחית אפשרי רק אם לא השתמשתם בשירותי האתר בתקופה הזו. המחיר הוא המחיר הסופי.
            </p>
            <CheckoutButton plan={planId} label={`לתשלום ${formatPrice(plan.priceAgorot)}`} />
            <p className="mt-4 text-center text-sm text-muted">
              התשלום מתבצע בעמוד מאובטח של חברת הסליקה. פרטי הכרטיס לא נשמרים אצלנו.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

async function BuilderCheckout({ draftId }: { draftId: string }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout?product=builder&draft=${draftId}`)}`);
  const draft = await getStore().getDraft(user.id, draftId);
  if (!draft) redirect("/builder");
  if (draft.unlocked) redirect(`/builder/${draft.id}`);
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-xl">
        <h1 className="text-4xl">{BUILDER_PRODUCT.name}</h1>
        <div className="card mt-8 p-8">
          <dl className="divide-y divide-line">
            <div className="flex justify-between py-3">
              <dt className="text-muted">מוצר</dt>
              <dd className="font-semibold">קורות חיים אחד, נבנים מהתשובות שלך</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-muted">לתשלום</dt>
              <dd className="font-display text-2xl font-bold text-forest">{formatPrice(BUILDER_PRODUCT.priceAgorot)}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt className="text-muted">סוג תשלום</dt>
              <dd>חד-פעמי, בלי מנוי ובלי חיובים נוספים</dd>
            </div>
          </dl>
          <p className="mt-6 rounded-xl bg-paper-2 p-4 text-[0.95rem]">
            כולל: יצירת קורות החיים, עריכה ללא הגבלה, 3 תבניות עיצוב והורדה ל-Word ול-PDF בעברית או באנגלית. המחיר הוא המחיר הסופי.
          </p>
          <CheckoutButton product="builder" draftId={draft.id} label={`לתשלום ${formatPrice(BUILDER_PRODUCT.priceAgorot)}`} />
          <p className="mt-4 text-center text-sm text-muted">התשלום מתבצע בעמוד מאובטח של חברת הסליקה. פרטי הכרטיס לא נשמרים אצלנו.</p>
        </div>
      </div>
    </div>
  );
}
