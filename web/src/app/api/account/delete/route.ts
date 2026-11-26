import { cancelSubscriptionNow } from "@/lib/billing";
import { errorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { destroySession } from "@/lib/session";
import { getStore } from "@/lib/store";

export async function POST() {
  try {
    const user = await requireUser();
    await cancelSubscriptionNow(user.id);
    await getStore().deleteUser(user.id);
    await destroySession();
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
