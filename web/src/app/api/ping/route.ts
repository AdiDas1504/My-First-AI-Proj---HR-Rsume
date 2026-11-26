import { cookies } from "next/headers";
import { TRACKED_NAMES } from "@/lib/analytics";
import { privateKey } from "@/lib/privacy";
import { takeRateLimit } from "@/lib/rate-limit";
import { DEVICE_COOKIE } from "@/lib/session";
import { getStore } from "@/lib/store";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|vercel/i;

/** Anonymous page view for the owner's funnel. Always answers 204. */
export async function POST(req: Request) {
  try {
    if (BOT.test(req.headers.get("user-agent") ?? "")) return new Response(null, { status: 204 });
    const body = (await req.json().catch(() => null)) as { name?: unknown } | null;
    const name = typeof body?.name === "string" ? body.name : "";
    if (!TRACKED_NAMES.has(name)) return new Response(null, { status: 204 });
    const device = (await cookies()).get(DEVICE_COOKIE)?.value;
    const visitor = device ? privateKey(device) : null;
    if (visitor && !(await takeRateLimit(`ping:${visitor}`, 120, 60))) return new Response(null, { status: 204 });
    await getStore().addEvent({ name, visitor, createdAt: new Date().toISOString() });
  } catch (err) {
    console.error("ping failed", err);
  }
  return new Response(null, { status: 204 });
}
