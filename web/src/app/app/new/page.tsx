import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TailorForm } from "@/components/tailor-form";
import { getEntitlement } from "@/lib/billing";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "התאמה למשרה חדשה" };

export default async function NewTailorPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/app/new");
  const ent = await getEntitlement(user.id);
  if (!ent.active) redirect(user.trialUsedAt ? "/checkout?plan=monthly" : "/checkout?plan=trial");
  const from = (await searchParams).from;
  const draft = from ? await getStore().getDraft(user.id, from) : null;
  const fromDraft =
    draft?.resume && draft.unlocked
      ? { id: draft.id, title: [draft.resume.fullName, draft.resume.headline].filter(Boolean).join(" · ") }
      : undefined;

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/app" className="link text-sm">
          → חזרה לגרסאות שלי
        </Link>
        <h1 className="mt-3 text-4xl md:text-5xl">התאמה למשרה חדשה</h1>
        <p className="mt-3 text-lg text-muted">
          נשארו לך {ent.remaining} התאמות בתקופה הזו. כל התאמה נשמרת ואפשר לערוך אותה אחר כך.
        </p>
        {ent.remaining > 0 ? (
          <TailorForm fromDraft={fromDraft} />
        ) : (
          <div className="card mt-8 p-8">
            <p className="text-lg">ניצלתם את כל ההתאמות של התקופה הנוכחית. המכסה מתחדשת בתחילת התקופה הבאה.</p>
          </div>
        )}
      </div>
    </div>
  );
}
