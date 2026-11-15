import { setCancelAtPeriodEnd } from "@/lib/billing";
import { errorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/guards";

/** Body: { cancel: true } to stop renewal, { cancel: false } to undo. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    await setCancelAtPeriodEnd(user.id, body.cancel !== false);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
