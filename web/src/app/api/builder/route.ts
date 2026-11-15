import { randomUUID } from "node:crypto";
import { runDiagnose } from "@/lib/ai-builder";
import { emptyAnswers } from "@/lib/builder";
import { errorResponse, UserError } from "@/lib/errors";
import { extractResumeText } from "@/lib/extract";
import { requireUser } from "@/lib/guards";
import { takeRateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";
import type { BuilderDraft } from "@/lib/types";

export const maxDuration = 90;

/**
 * Start a builder draft. Free after phone login (the interview is free; the
 * finished resume is the paid part). Limited to 5 new drafts a day.
 * - scratch: JSON { mode: "scratch" }
 * - improve: multipart { mode: "improve", resume: File }
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!(await takeRateLimit(`builder:new:${user.id}`, 5, 24 * 60))) {
      throw new UserError("פתחת היום כבר כמה טיוטות. אפשר להמשיך את הקיימות מהאזור האישי.", 429);
    }

    const isMultipart = (req.headers.get("content-type") ?? "").includes("multipart/form-data");
    const form = isMultipart ? await req.formData() : null;
    const json = isMultipart ? null : await req.json().catch(() => ({}));
    const mode = (form?.get("mode") ?? json?.mode) === "improve" ? "improve" : "scratch";

    let answers = emptyAnswers();
    let diagnosis: string[] = [];
    let sourceResumeText = "";
    if (mode === "improve") {
      sourceResumeText = await extractResumeText(form?.get("resume") as File | null);
      ({ answers, diagnosis } = await runDiagnose(sourceResumeText));
    }

    const now = new Date().toISOString();
    const draft: BuilderDraft = {
      id: randomUUID(),
      userId: user.id,
      mode,
      answers,
      sourceResumeText,
      diagnosis,
      unlocked: false,
      resume: null,
      notes: [],
      honestyFlags: [],
      template: "classic",
      createdAt: now,
      updatedAt: now,
    };
    await getStore().createDraft(draft);
    return Response.json({ ok: true, id: draft.id });
  } catch (err) {
    return errorResponse(err);
  }
}
