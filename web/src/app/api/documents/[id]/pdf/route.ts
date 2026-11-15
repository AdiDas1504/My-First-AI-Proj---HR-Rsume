import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { pdfFileName, pdfResponse, renderPrintPagePdf } from "@/lib/pdf";
import { takeRateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";

export const maxDuration = 60;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const doc = await getStore().getDocument(user.id, id);
    if (!doc) throw new UserError("המסמך לא נמצא.", 404);
    if (!(await takeRateLimit(`pdf:user:${user.id}`, 40, 60))) {
      throw new UserError("הורדתם הרבה קבצים בשעה האחרונה. נסו שוב מאוחר יותר.", 429);
    }
    const pdf = await renderPrintPagePdf({
      origin: new URL(req.url).origin,
      path: `/app/doc/${encodeURIComponent(id)}/print`,
      cookie: req.headers.get("cookie") ?? "",
      authorization: req.headers.get("authorization"),
    });
    return pdfResponse(pdf, pdfFileName(`${doc.resume.fullName} - ${doc.analysis.jobTitle}`));
  } catch (err) {
    return errorResponse(err);
  }
}
