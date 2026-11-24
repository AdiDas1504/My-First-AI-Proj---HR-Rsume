import "server-only";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { config, demo, demoShortcutsAllowed } from "./config";
import { getStore } from "./store";
import { sendLoginCode } from "./sms";
import { takeRateLimit } from "./rate-limit";
import { privateKey } from "./privacy";
import type { User } from "./types";

const CODE_TTL_MIN = 5;
const MAX_ATTEMPTS = 5;

function hashCode(phone: string, code: string) {
  return createHmac("sha256", config.sessionSecret).update(`${phone}:${code}`).digest("hex");
}

export type SendResult =
  | { ok: true; devCode?: string }
  | { ok: false; error: string };

export async function requestLoginCode(phone: string, ip: string): Promise<SendResult> {
  if (demo.sms && !demoShortcutsAllowed) {
    console.error("SMS provider is not configured in production; refusing to issue login codes.");
    return { ok: false, error: "הכניסה זמנית לא זמינה. נסו שוב מאוחר יותר." };
  }
  if (!(await takeRateLimit(`otp:phone:${privateKey(phone)}`, 3, 15))) {
    return { ok: false, error: "נשלחו כבר כמה קודים למספר הזה. נסו שוב בעוד רבע שעה." };
  }
  if (!(await takeRateLimit(`otp:ip:${privateKey(ip)}`, 10, 60))) {
    return { ok: false, error: "יותר מדי בקשות מהרשת הזו. נסו שוב מאוחר יותר." };
  }
  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await getStore().saveOtp({
    phone,
    codeHash: hashCode(phone, code),
    expiresAt: new Date(Date.now() + CODE_TTL_MIN * 60_000).toISOString(),
    attempts: 0,
  });
  await sendLoginCode(phone, code);
  // In demo mode there is no SMS, so the code is shown on screen.
  return demo.sms ? { ok: true, devCode: code } : { ok: true };
}

export type VerifyResult = { ok: true; user: User } | { ok: false; error: string };

export async function verifyLoginCode(phone: string, code: string): Promise<VerifyResult> {
  const store = getStore();
  const challenge = await store.getOtp(phone);
  if (!challenge || Date.parse(challenge.expiresAt) < Date.now()) {
    return { ok: false, error: "הקוד פג תוקף. בקשו קוד חדש." };
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    await store.deleteOtp(phone);
    return { ok: false, error: "יותר מדי ניסיונות. בקשו קוד חדש." };
  }
  const expected = Buffer.from(challenge.codeHash, "hex");
  const actual = Buffer.from(hashCode(phone, code.trim()), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    await store.incrementOtpAttempts(phone);
    return { ok: false, error: "הקוד שגוי. בדקו את ההודעה ונסו שוב." };
  }
  await store.deleteOtp(phone);
  const user = (await store.findUserByPhone(phone)) ?? (await store.createUser(phone));
  return { ok: true, user };
}
