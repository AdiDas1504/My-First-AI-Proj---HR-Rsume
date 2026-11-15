import { randomUUID } from "node:crypto";
import { runTailor } from "@/lib/ai";
import { errorResponse, UserError } from "@/lib/errors";
import { extractJob, extractResumeText } from "@/lib/extract";
import { requireActivePlan } from "@/lib/guards";
import { checkHonesty } from "@/lib/honesty";
import { takeRateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";
import { resumeToText } from "@/lib/builder";

export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const { user, ent } = await requireActivePlan();
    if (ent.remaining <= 0) {
      throw new UserError(`ניצלתם את ${ent.quota} ההתאמות של התקופה הנוכחית. המכסה מתחדשת בתחילת התקופה הבאה.`, 429);
    }
    if (!(await takeRateLimit(`tailor:user:${user.id}`, 5, 10))) {
      throw new UserError("רגע, יותר מדי בקשות ברצף. נסו שוב בעוד כמה דקות.", 429);
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

    const out = await runTailor(resumeText, job, language);
    const now = new Date().toISOString();
    const id = randomUUID();
    const title = [out.analysis.jobTitle, out.analysis.company].filter(Boolean).join(" · ") || "משרה";

    const store = getStore();
    await store.createDocument({
      id,
      userId: user.id,
      title,
      analysis: out.analysis,
      resume: out.resume,
      addOnlyIfTrue: out.addOnlyIfTrue,
      changeLog: out.changeLog,
      honestyFlags: checkHonesty(out.resume, resumeText),
      sourceResumeText: resumeText,
      coverLetter: null,
      createdAt: now,
      updatedAt: now,
    });
    await store.addUsage(user.id, "tailor");
    return Response.json({ ok: true, id });
  } catch (err) {
    return errorResponse(err);
  }
}
