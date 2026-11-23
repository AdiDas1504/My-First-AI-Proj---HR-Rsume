import { randomUUID } from "node:crypto";
import { runScan } from "@/lib/ai";
import { getEntitlement } from "@/lib/billing";
import { errorResponse, UserError } from "@/lib/errors";
import { extractJob, extractResumeText } from "@/lib/extract";
import { requireUser } from "@/lib/guards";
import { takeRateLimit } from "@/lib/rate-limit";
import { getClientIp, getDeviceId } from "@/lib/session";
import { getStore } from "@/lib/store";
import { config } from "@/lib/config";

export const maxDuration = 60;

/**
 * Free fit check: one per phone number AND one per device (lifetime), max 3
 * per network per day. Subscribers can run it without limits.
 */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const store = getStore();
    const ent = await getEntitlement(user.id);
    const deviceId = await getDeviceId();
    const ip = await getClientIp();

    let previous = null;
    if (!ent.active) {
      if (!deviceId) throw new UserError("הדפדפן חוסם עוגיות. אפשרו עוגיות ונסו שוב.");
      previous = await store.findFreeScan({ phone: user.phone, deviceId });
      if (config.freeScanLimits) {
        if (previous) {
          throw new UserError("הבדיקה החינמית כבר נוצלה. כדי לקבל את הדוח המלא וגרסה מותאמת, אפשר להתחיל בשבוע היכרות.", 402);
        }
        if (!(await takeRateLimit(`scan:ip:${ip}`, 3, 24 * 60))) {
          throw new UserError("הגעתם למספר הבדיקות החינמיות מהרשת הזו היום.", 429);
        }
      } else if (!(await takeRateLimit(`scan:user:${user.id}`, 10, 24 * 60))) {
        // Limits are open; this only stops runaway AI costs.
        throw new UserError("עשיתם היום הרבה בדיקות. אפשר להמשיך מחר.", 429);
      }
    }

    const form = await req.formData();
    const resumeText = await extractResumeText(form.get("resume") as File | null);
    const job = await extractJob({
      text: String(form.get("jobText") ?? ""),
      url: String(form.get("jobUrl") ?? ""),
      file: form.get("jobFile") as File | null,
    });

    const result = await runScan(resumeText, job);

    if (!ent.active && !previous) {
      await store.addFreeScan({
        id: randomUUID(),
        userId: user.id,
        phone: user.phone,
        deviceId: deviceId!,
        ip,
        createdAt: new Date().toISOString(),
      });
    }
    await store.addUsage(user.id, "scan");
    return Response.json({ ok: true, result, subscriber: ent.active });
  } catch (err) {
    return errorResponse(err);
  }
}
