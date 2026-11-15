import { normalizeIsraeliMobile } from "@/lib/phone";
import { verifyLoginCode } from "@/lib/otp";
import { createSession } from "@/lib/session";
import { errorResponse, UserError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = normalizeIsraeliMobile(String(body.phone ?? ""));
    const code = String(body.code ?? "").replace(/\D/g, "");
    if (!phone || code.length !== 6) throw new UserError("צריך להקליד את 6 הספרות שקיבלתם ב-SMS.");
    const result = await verifyLoginCode(phone, code);
    if (!result.ok) throw new UserError(result.error, 401);
    await createSession(result.user.id);
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
