import { createCheckout } from "@/lib/billing";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { isPlanId } from "@/lib/plans";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    if (!isPlanId(body.plan)) throw new UserError("מסלול לא קיים.");
    const result = await createCheckout(user, body.plan);
    if (!result.ok) throw new UserError(result.error, 409);
    return Response.json({ ok: true, url: result.url });
  } catch (err) {
    return errorResponse(err);
  }
}
