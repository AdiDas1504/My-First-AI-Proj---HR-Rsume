import { cancelSubscriptionNow } from "@/lib/billing";
import { errorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/guards";

/** Cancels the subscription now: access ends and no further charges. */
export async function POST() {
  try {
    const user = await requireUser();
    await cancelSubscriptionNow(user.id);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
