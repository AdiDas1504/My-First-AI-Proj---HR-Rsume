import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { errorResponse, UserError } from "@/lib/errors";
import { normalizeIsraeliMobile } from "@/lib/phone";
import { privateKey } from "@/lib/privacy";
import { getStore } from "@/lib/store";

const bodySchema = z.object({ phone: z.string().max(30) });

/** Owner tool: let this phone number run the free check again (once). */
export async function POST(req: Request) {
  try {
    await requireAdmin();
    const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
    const phone = parsed.success ? normalizeIsraeliMobile(parsed.data.phone) : null;
    if (!phone) throw new UserError("מספר הטלפון לא תקין. כתבו מספר נייד, למשל 050-1234567.");
    const deleted = await getStore().deleteFreeScans([privateKey(phone), phone]);
    return Response.json({ ok: true, deleted });
  } catch (err) {
    return errorResponse(err);
  }
}
