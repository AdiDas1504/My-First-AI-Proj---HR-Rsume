import { normalizeIsraeliMobile } from "@/lib/phone";
import { requestLoginCode } from "@/lib/otp";
import { getClientIp } from "@/lib/session";
import { errorResponse, UserError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const phone = normalizeIsraeliMobile(String(body.phone ?? ""));
    if (!phone) throw new UserError("צריך מספר נייד ישראלי תקין, למשל 050-1234567.");
    const result = await requestLoginCode(phone, await getClientIp());
    if (!result.ok) throw new UserError(result.error, 429);
    return Response.json({ ok: true, devCode: result.devCode });
  } catch (err) {
    return errorResponse(err);
  }
}
