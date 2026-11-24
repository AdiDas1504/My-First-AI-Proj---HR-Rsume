import { randomUUID } from "node:crypto";
import { runAnalyze } from "@/lib/ai";
import { errorResponse, UserError } from "@/lib/errors";
import { extractJob, extractResumeText } from "@/lib/extract";
import { requireActivePlan } from "@/lib/guards";
import { takeRateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";
import { resumeToText } from "@/lib/builder";
import { schedulePurge } from "@/lib/privacy";

export const maxDuration = 180;

/**
 * Step 1 of tailoring: analyze the fit, research what the role needs, and
 * prepare questions for the candidate. Nothing is written yet and no quota is
 * used; the tailored resume is written in step 2 (/api/tailor/[id]/generate).
 */
export async function POST(req: Request) {
  try {
    const { user, ent } = await requireActivePlan();
    if (ent.remaining <= 0) {
      throw new UserError(`ניצלתם את ${ent.quota} ההתאמות של התקופה הנוכחית. המכסה מתחדשת בתחילת התקופה הבאה.`, 429);
    }
    if (!(await takeRateLimit(`analyze:user:${user.id}`, 10, 60))) {
      throw new UserError("רגע, יותר מדי בדיקות ברצף. נסו שוב בעוד כמה דקות.", 429);
    }

    const form = await req.formData();
    const lang = String(form.get("language") ?? "auto");
    const language = lang === "he" || lang === "en" ? lang : "auto";
    // Either an uploaded file, or a resume the user built in the builder.
    const draftId = String(form.get("draftId") ?? "");
    let resumeText: string;
    if (draftId) {
      const draft = await getStore().getDraft(user.id, draftId);
      if (!draft?.resume || !draft.unlocked) throw new UserError("קורות החיים שבחרת לא נמצאו.", 404);
      resumeText = resumeToText(draft.resume);
    } else {
      resumeText = await extractResumeText(form.get("resume") as File | null);
    }
    const job = await extractJob({
      text: String(form.get("jobText") ?? ""),
      url: String(form.get("jobUrl") ?? ""),
      file: form.get("jobFile") as File | null,
    });

    const { analysis, questions } = await runAnalyze(resumeText, job);
    const now = new Date().toISOString();
    const id = randomUUID();
    await getStore().createSession({
      id,
      userId: user.id,
      resumeText,
      job,
      language,
      analysis,
      questions,
      answers: {},
      documentId: null,
      createdAt: now,
      updatedAt: now,
    });
    schedulePurge();
    return Response.json({ ok: true, id });
  } catch (err) {
    return errorResponse(err);
  }
}
