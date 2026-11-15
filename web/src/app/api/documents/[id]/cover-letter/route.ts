import { runCoverLetter } from "@/lib/ai";
import { errorResponse, UserError } from "@/lib/errors";
import { requireActivePlan } from "@/lib/guards";
import { takeRateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";

export const maxDuration = 60;

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user } = await requireActivePlan();
    const { id } = await params;
    const store = getStore();
    const doc = await store.getDocument(user.id, id);
    if (!doc) throw new UserError("המסמך לא נמצא.", 404);
    if (!(await takeRateLimit(`cover:user:${user.id}`, 20, 24 * 60))) {
      throw new UserError("הגעתם למספר המכתבים המקדימים להיום.", 429);
    }
    const letter = await runCoverLetter(doc.resume, doc.analysis);
    await store.updateDocument({ ...doc, coverLetter: letter, updatedAt: new Date().toISOString() });
    await store.addUsage(user.id, "cover");
    return Response.json({ ok: true, coverLetter: letter });
  } catch (err) {
    return errorResponse(err);
  }
}
