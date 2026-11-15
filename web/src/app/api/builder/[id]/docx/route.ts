import { buildResumeDocx } from "@/lib/docx-export";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { getStore } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const draft = await getStore().getDraft(user.id, id);
    if (!draft?.resume || !draft.unlocked) throw new UserError("עוד אין קורות חיים להורדה.", 404);
    const buffer = await buildResumeDocx(draft.resume);
    const name = (draft.resume.fullName || "resume").replace(/[\\/:*?"<>|]+/g, "").trim().slice(0, 80) || "resume";
    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="resume.docx"; filename*=UTF-8''${encodeURIComponent(`${name}.docx`)}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
