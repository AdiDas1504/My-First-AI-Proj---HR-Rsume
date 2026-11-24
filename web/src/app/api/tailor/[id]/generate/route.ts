import { randomUUID } from "node:crypto";
import { z } from "zod";
import { answersToSource, runTailor } from "@/lib/ai";
import { errorResponse, UserError } from "@/lib/errors";
import { requireActivePlan } from "@/lib/guards";
import { checkHonesty } from "@/lib/honesty";
import { takeRateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";

export const maxDuration = 180;

const bodySchema = z.object({ answers: z.record(z.string(), z.string().max(1500)).default({}) });

/** Step 2 of tailoring: write the resume using the analysis and the candidate's answers. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, ent } = await requireActivePlan();
    const { id } = await params;
    const store = getStore();
    const session = await store.getSession(user.id, id);
    if (!session) throw new UserError("הבדיקה לא נמצאה. אפשר להתחיל התאמה חדשה.", 404);
    // A second click must not use a second credit.
    if (session.documentId) return Response.json({ ok: true, id: session.documentId });

    if (ent.remaining <= 0) {
      throw new UserError(`ניצלתם את ${ent.quota} ההתאמות של התקופה הנוכחית. המכסה מתחדשת בתחילת התקופה הבאה.`, 429);
    }
    if (!(await takeRateLimit(`tailor:user:${user.id}`, 5, 10))) {
      throw new UserError("רגע, יותר מדי בקשות ברצף. נסו שוב בעוד כמה דקות.", 429);
    }

    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    if (!parsed.success) throw new UserError("התשובות שנשלחו לא תקינות.");
    const known = new Map(session.questions.map((q) => [q.id, q]));
    const answered = Object.entries(parsed.data.answers).filter(([qid, a]) => known.has(qid) && a.trim());
    const answers = answered.map(([qid, a]) => ({ topic: known.get(qid)!.topic, question: known.get(qid)!.question, answer: a.trim() }));

    const out = await runTailor(session.resumeText, session.job, session.language, { analysis: session.analysis, answers });
    // The honesty check accepts facts from the resume AND from the candidate's own answers.
    const source = [session.resumeText, answersToSource(answers)].filter(Boolean).join("\n\n");
    const now = new Date().toISOString();
    const docId = randomUUID();
    const a = session.analysis;
    await store.createDocument({
      id: docId,
      userId: user.id,
      title: [a.jobTitle, a.company].filter(Boolean).join(" · ") || "משרה",
      analysis: { ...a, language: out.resume.language },
      resume: out.resume,
      addOnlyIfTrue: out.addOnlyIfTrue,
      changeLog: out.changeLog,
      honestyFlags: checkHonesty(out.resume, source),
      sourceResumeText: source,
      coverLetter: null,
      createdAt: now,
      updatedAt: now,
    });
    await store.addUsage(user.id, "tailor");
    await store.updateSession({
      ...session,
      answers: Object.fromEntries(answered.map(([qid, a]) => [qid, a.trim()])),
      documentId: docId,
      updatedAt: now,
    });
    return Response.json({ ok: true, id: docId });
  } catch (err) {
    return errorResponse(err);
  }
}
