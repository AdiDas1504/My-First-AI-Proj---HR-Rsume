import { z } from "zod";
import { runFollowups } from "@/lib/ai-builder";
import { builderRoleSchema } from "@/lib/builder-schema";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { takeRateLimit } from "@/lib/rate-limit";
import { getStore } from "@/lib/store";

export const maxDuration = 45;

const bodySchema = z.object({
  role: builderRoleSchema,
  target: z.object({ role: z.string().max(300), field: z.string().max(300), seniority: z.string().max(80), language: z.enum(["he", "en"]) }),
});

/** 2-3 follow-up questions for one role. Free, limited to 40 a day per user. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    if (!(await getStore().getDraft(user.id, id))) throw new UserError("הטיוטה לא נמצאה.", 404);
    const parsed = bodySchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new UserError("הנתונים שנשלחו לא תקינים.");
    if (!parsed.data.role.title.trim()) throw new UserError("כתבו קודם את שם התפקיד.");
    if (!(await takeRateLimit(`builder:followups:${user.id}`, 40, 24 * 60))) {
      throw new UserError("הגעתם למספר שאלות ההמשך להיום. אפשר להמשיך מחר, או לכתוב בעצמכם.", 429);
    }
    const questions = await runFollowups(parsed.data.role, parsed.data.target);
    return Response.json({ ok: true, questions });
  } catch (err) {
    return errorResponse(err);
  }
}
