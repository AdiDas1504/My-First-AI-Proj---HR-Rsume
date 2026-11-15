import { createBuilderCheckout, createCheckout } from "@/lib/billing";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";
import { isPlanId } from "@/lib/plans";

/** Body: { plan } for a subscription, or { product: "builder", draftId } for the one-time builder. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const result =
      body.product === "builder"
        ? await createBuilderCheckout(user, String(body.draftId ?? ""))
        : isPlanId(body.plan)
          ? await createCheckout(user, body.plan)
          : null;
    if (!result) throw new UserError("מסלול לא קיים.");
    if (!result.ok) throw new UserError(result.error, 409);
    return Response.json({ ok: true, url: result.url });
  } catch (err) {
    return errorResponse(err);
  }
}
