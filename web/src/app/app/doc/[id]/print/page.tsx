import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PrintButton } from "@/components/print-button";
import { ResumePreview } from "@/components/resume-preview";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "PDF", robots: { index: false } };

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/app/doc/${id}/print`);
  const doc = await getStore().getDocument(user.id, id);
  if (!doc) notFound();
  return (
    <div className="bg-[#e9dfd5] py-8 print:bg-white print:py-0">
      <div className="no-print container-page mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-muted">בחלון ההדפסה בחרו ״שמירה כ-PDF״ כיעד, הפעילו ״גרפיקת רקע״ כדי לשמור את הצבעים, ובטלו כותרות עליונות ותחתונות.</p>
        <PrintButton />
      </div>
      <ResumePreview resume={doc.resume} />
    </div>
  );
}
