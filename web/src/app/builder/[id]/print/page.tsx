import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FitToPage } from "@/components/fit-to-page";
import { PdfDownloadButton } from "@/components/pdf-download-button";
import { PrintButton } from "@/components/print-button";
import { ResumePreview } from "@/components/resume-preview";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "PDF", robots: { index: false } };

export default async function BuilderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/builder/${id}/print`);
  const draft = await getStore().getDraft(user.id, id);
  if (!draft?.resume || !draft.unlocked) notFound();
  return (
    <div className="bg-[#e9dfd5] py-8 print:bg-white print:py-0">
      <div className="no-print container-page mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-2xl text-muted">להדפסה: בחלון ההדפסה בחרו נייר A4, סמנו ״גרפיקת רקע״ כדי לשמור את הצבעים, ובטלו כותרות עליונות ותחתונות. כדי לקבל קובץ מוכן בלי חלון הדפסה, לחצו ״הורדה ל-PDF״.</p>
        <div className="flex flex-wrap gap-2">
          <PdfDownloadButton href={`/api/builder/${id}/pdf`} className="btn btn-primary" />
          <PrintButton />
        </div>
      </div>
      <div className="overflow-x-auto print:overflow-visible">
        <div className="mx-auto w-[210mm] print:w-auto">
          <ResumePreview resume={draft.resume} template={draft.template} />
        </div>
      </div>
      <FitToPage />
    </div>
  );
}
