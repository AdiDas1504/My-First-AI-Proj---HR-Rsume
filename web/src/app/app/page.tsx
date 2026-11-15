import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ScoreRing } from "@/components/score-ring";
import { getEntitlement } from "@/lib/billing";
import { PLANS } from "@/lib/plans";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "האזור שלי" };

const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" });

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app");
  const [ent, docs] = await Promise.all([getEntitlement(user.id), getStore().listDocuments(user.id)]);
  const welcome = (await searchParams).welcome === "1";

  return (
    <div className="container-page py-10 md:py-14">
      {welcome && ent.active && (
        <div role="status" className="mb-8 rounded-2xl bg-mint px-6 py-5 text-forest">
          <p className="text-lg font-semibold">ברוכים הבאים! המנוי פעיל.</p>
          <p>אפשר להתחיל: מעלים קורות חיים ומשרה, ותוך דקה יש גרסה מותאמת.</p>
        </div>
      )}

      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl">הגרסאות שלי</h1>
          {ent.active ? (
            <p className="mt-3 text-muted">
              {PLANS[ent.plan!].name} · נשארו {ent.remaining} מתוך {ent.quota} התאמות בתקופה הזו ·{" "}
              {ent.cancelAtPeriodEnd ? "פעיל עד" : "מתחדש ב-"} {dateFmt.format(new Date(ent.periodEnd!))}
            </p>
          ) : (
            <p className="mt-3 text-muted">אין מנוי פעיל כרגע.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {ent.active ? (
            <Link href="/app/new" className="btn btn-primary text-lg">
              + התאמה למשרה חדשה
            </Link>
          ) : (
            <Link href={user.trialUsedAt ? "/checkout?plan=monthly" : "/checkout?plan=trial"} className="btn btn-primary text-lg">
              {user.trialUsedAt ? "חידוש מנוי" : "שבוע היכרות ב-19.90 ₪"}
            </Link>
          )}
          <Link href="/account" className="btn btn-secondary">
            החשבון והמנוי
          </Link>
        </div>
      </div>

      {docs.length === 0 ? (
        <div className="card mt-10 flex flex-col items-center p-12 text-center">
          <p className="font-display text-2xl font-bold">עדיין אין גרסאות</p>
          <p className="mt-2 max-w-md text-muted">כל משרה שתתאימו אליה תישמר כאן, עם הדוח, קורות החיים המותאמים והמכתב המקדים.</p>
          {!ent.active && (
            <Link href="/scan" className="btn btn-secondary mt-6">
              בדיקת התאמה חינם
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((d) => (
            <li key={d.id}>
              <Link href={`/app/doc/${d.id}`} className="card flex h-full items-center gap-4 p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <ScoreRing score={d.score} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{d.title}</p>
                  <p className="text-sm text-muted">{dateFmt.format(new Date(d.createdAt))}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
