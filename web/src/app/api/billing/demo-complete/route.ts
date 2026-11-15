import { completeDemoCheckout } from "@/lib/billing";
import { errorResponse, UserError } from "@/lib/errors";
import { requireUser } from "@/lib/guards";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const result = await completeDemoCheckout(String(body.token ?? ""), user.id);
    if (!result.ok) throw new UserError(result.error, 400);
    return Response.json({ ok: true, next: result.next });
  } catch (err) {
    return errorResponse(err);
  }
}
