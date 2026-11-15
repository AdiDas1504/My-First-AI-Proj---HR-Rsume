import { z } from "zod";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { checkHonesty } from "@/lib/honesty";
import { getStore } from "@/lib/store";

type Ctx = { params: Promise<{ id: string }> };

const s = z.string().max(2000);
const resumeSchema = z.object({
  language: z.enum(["he", "en"]),
  fullName: s,
  headline: s,
  contact: z.object({ email: s, phone: s, location: s, links: z.array(s).max(10) }),
  summary: z.string().max(3000),
  experience: z
    .array(
      z.object({
        title: s,
        organization: s,
        location: s,
        start: s,
        end: s,
        bullets: z.array(s).max(15),
      }),
    )
    .max(20),
  education: z.array(z.object({ degree: s, institution: s, start: s, end: s, details: s })).max(10),
  skills: z.array(s).max(60),
  languages: z.array(s).max(15),
  certifications: z.array(s).max(30),
});

const patchSchema = z.object({
  resume: resumeSchema.optional(),
  coverLetter: z.string().max(6000).optional(),
});

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const store = getStore();
    const doc = await store.getDocument(user.id, id);
    if (!doc) throw new UserError("המסמך לא נמצא.", 404);
    const parsed = patchSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new UserError("הנתונים שנשלחו לא תקינים.");
    const next = { ...doc, updatedAt: new Date().toISOString() };
    if (parsed.data.resume) {
      next.resume = parsed.data.resume;
      next.honestyFlags = checkHonesty(parsed.data.resume, doc.sourceResumeText);
    }
    if (parsed.data.coverLetter !== undefined) next.coverLetter = parsed.data.coverLetter;
    await store.updateDocument(next);
    return Response.json({ ok: true, honestyFlags: next.honestyFlags, updatedAt: next.updatedAt });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { id } = await params;
    await getStore().deleteDocument(user.id, id);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
