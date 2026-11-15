import { z } from "zod";
import { answersToText } from "@/lib/builder";
import { builderAnswersSchema, templateSchema } from "@/lib/builder-schema";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { checkHonesty } from "@/lib/honesty";
import { getStore } from "@/lib/store";
import { resumeEditSchema } from "@/lib/resume-schema";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  answers: builderAnswersSchema.optional(),
  template: templateSchema.optional(),
  resume: resumeEditSchema.optional(),
});

/** Save interview progress, the chosen template, or edits to the generated resume. */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const store = getStore();
    const draft = await store.getDraft(user.id, id);
    if (!draft) throw new UserError("הטיוטה לא נמצאה.", 404);
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new UserError("הנתונים שנשלחו לא תקינים.");

    const next = { ...draft, updatedAt: new Date().toISOString() };
    if (parsed.data.answers) next.answers = parsed.data.answers;
    if (parsed.data.template) next.template = parsed.data.template;
    if (parsed.data.resume) {
      if (!draft.unlocked || !draft.resume) throw new UserError("עוד אין קורות חיים לעריכה.", 409);
      next.resume = parsed.data.resume;
    }
    if (next.resume) {
      next.honestyFlags = checkHonesty(next.resume, `${answersToText(next.answers)}\n${next.sourceResumeText}`);
    }
    await store.updateDraft(next);
    return Response.json({ ok: true, honestyFlags: next.honestyFlags, updatedAt: next.updatedAt });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await getStore().deleteDraft(user.id, id);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
