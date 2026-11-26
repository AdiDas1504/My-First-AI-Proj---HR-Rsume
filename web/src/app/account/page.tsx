import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountActions } from "@/components/account-actions";
import { isAdmin } from "@/lib/admin";
import { getEntitlement } from "@/lib/billing";
import { maskPhone } from "@/lib/phone";
import { PLANS, formatPrice, productName } from "@/lib/plans";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "החשבון והמנוי" };

const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const [ent, payments] = await Promise.all([getEntitlement(user.id), getStore().listPayments(user.id)]);
  const plan = ent.plan ? PLANS[ent.plan] : null;
  const renewPlan = plan ? PLANS[plan.renewsTo] : null;

  return (
    <div className="container-page py-10 md:py-14">
      <Link href="/app" className="link text-sm">→ חזרה לגרסאות שלי</Link>
      <h1 className="mt-3 text-4xl md:text-5xl">החשבון והמנוי</h1>
      {isAdmin(user) && (
        <p className="mt-3">
          <Link href="/admin" className="btn btn-secondary">לוח בקרה (בעלים)</Link>
        </p>
      )}

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="card p-7" aria-labelledby="sub-title">
          <h2 id="sub-title" className="text-2xl">המנוי</h2>
          {ent.active && plan && renewPlan ? (
            <>
              <p className="mt-3 text-lg">
                <strong>{plan.name}</strong> · {ent.remaining} מתוך {ent.quota} התאמות נשארו
              </p>
              <p className="mt-2 text-muted">
                החיוב הבא: {formatPrice(renewPlan.priceAgorot)} ב-{dateFmt.format(new Date(ent.periodEnd!))} ({renewPlan.name}).
              </p>
              <p className="mt-2 text-sm text-muted">ביטול נכנס לתוקף מיד וסוגר את הגישה לשירותים בתשלום.</p>
              <AccountActions mode="cancel" />
            </>
          ) : (
            <>
              <p className="mt-3 text-muted">אין מנוי פעיל.</p>
              <Link href={user.trialUsedAt ? "/checkout?plan=monthly" : "/checkout?plan=trial"} className="btn btn-primary mt-5">
                {user.trialUsedAt ? "חידוש מנוי" : "שבוע היכרות ב-19.90 ₪"}
              </Link>
            </>
          )}
        </section>

        <section className="card p-7" aria-labelledby="acct-title">
          <h2 id="acct-title" className="text-2xl">פרטי החשבון</h2>
          <p className="mt-3">
            טלפון: <span dir="ltr">{maskPhone(user.phone)}</span>
          </p>
          <p className="mt-1 text-muted">חבר/ה מאז {dateFmt.format(new Date(user.createdAt))}</p>
          <AccountActions mode="account" />
        </section>
      </div>

      <section className="card mt-5 p-7" aria-labelledby="pay-title">
        <h2 id="pay-title" className="text-2xl">היסטוריית תשלומים</h2>
        {payments.length === 0 ? (
          <p className="mt-3 text-muted">עדיין אין תשלומים.</p>
        ) : (
          <table className="mt-4 w-full text-right">
            <thead>
              <tr className="border-b border-line text-sm text-muted">
                <th scope="col" className="py-2 font-semibold">תאריך</th>
                <th scope="col" className="py-2 font-semibold">מסלול</th>
                <th scope="col" className="py-2 font-semibold">סכום</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-3">{dateFmt.format(new Date(p.createdAt))}</td>
                  <td className="py-3">{productName(p.plan)}</td>
                  <td className="py-3">{formatPrice(p.amountAgorot)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
