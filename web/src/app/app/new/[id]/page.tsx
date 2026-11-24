import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TailorReview } from "@/components/tailor-review";
import { getEntitlement } from "@/lib/billing";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "מה מצאנו לפני שכותבים" };

export default async function TailorReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/app/new/${id}`);
  const session = await getStore().getSession(user.id, id);
  if (!session) notFound();
  if (session.documentId) redirect(`/app/doc/${session.documentId}`);
  const ent = await getEntitlement(user.id);
  if (!ent.active) redirect(user.trialUsedAt ? "/checkout?plan=monthly" : "/checkout?plan=trial");

  return (
    <div className="container-page py-10 md:py-14">
      <div className="mx-auto max-w-4xl">
        <Link href="/app/new" className="link text-sm">
          → התאמה חדשה
        </Link>
        <h1 className="mt-3 text-4xl md:text-5xl">מה מצאנו לפני שכותבים</h1>
        <p className="mt-3 text-lg text-muted">
          בדקנו את קורות החיים מול המשרה ומול מה שנדרש בדרך כלל בתפקיד כזה. עכשיו כמה שאלות, ואז נכתוב.
        </p>
        <TailorReview sessionId={session.id} analysis={session.analysis} questions={session.questions} remaining={ent.remaining} />
      </div>
    </div>
  );
}
