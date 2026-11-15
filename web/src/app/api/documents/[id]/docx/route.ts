import { buildLetterDocx, buildResumeDocx } from "@/lib/docx-export";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { getStore } from "@/lib/store";

function safeName(text: string) {
  return text
    .replace(/[\\/]/g, "")
    .replace(/[:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) || "resume";
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const doc = await getStore().getDocument(user.id, id);
    if (!doc) throw new UserError("המסמך לא נמצא.", 404);
    const type = new URL(req.url).searchParams.get("type") === "letter" ? "letter" : "resume";
    if (type === "letter" && !doc.coverLetter) throw new UserError("עדיין לא נוצר מכתב מקדים.", 404);

    const buffer =
      type === "letter"
        ? await buildLetterDocx(doc.coverLetter!, doc.resume.language)
        : await buildResumeDocx(doc.resume);
    const base = safeName(`${doc.resume.fullName} - ${doc.analysis.jobTitle}`);
    const filename = type === "letter" ? `${base} - cover letter.docx` : `${base}.docx`;
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="resume.docx"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
