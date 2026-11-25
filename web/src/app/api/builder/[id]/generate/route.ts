import { runBuild } from "@/lib/ai-builder";
import { answersToText, readiness } from "@/lib/builder";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { checkHonesty, dropUnsupportedSkills } from "@/lib/honesty";
import { takeRateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";

export const maxDuration = 180;

/** Write the professional resume from the saved answers. Paid (draft must be unlocked). */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const store = getStore();
    const draft = await store.getDraft(user.id, id);
    if (!draft) throw new UserError("הטיוטה לא נמצאה.", 404);
    if (!draft.unlocked) throw new UserError("כדי ליצור את קורות החיים צריך להשלים תשלום.", 402);
    const ready = readiness(draft.answers);
    if (!ready.ok) throw new UserError(`חסר עוד: ${ready.missing.join(", ")}.`);
    if (!(await takeRateLimit(`builder:generate:${draft.id}`, 15, 24 * 60))) {
      throw new UserError("יצרתם מחדש הרבה פעמים היום. אפשר לערוך ידנית, או לנסות שוב מחר.", 429);
    }
    const built = await runBuild(draft.answers, draft.sourceResumeText);
    const source = `${answersToText(draft.answers)}\n${draft.sourceResumeText}`;
    // Skills with no basis in what the person told us are left out, and mentioned in the notes.
    const { resume, dropped } = dropUnsupportedSkills(built.resume, source);
    const notes = dropped.length
      ? [...built.notes, `לא הכנסנו לכישורים: ${dropped.join(", ")}, כי לא מצאנו לזה בסיס במה שסיפרת. אם זה נכון, אפשר להוסיף בעריכה.`]
      : built.notes;
    const next = {
      ...draft,
      resume,
      notes,
      honestyFlags: checkHonesty(resume, source),
      updatedAt: new Date().toISOString(),
    };
    await store.updateDraft(next);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
