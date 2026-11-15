import "server-only";
import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { config } from "./config";
import { getStore } from "./store";
import type { User } from "./types";

export const SESSION_COOKIE = "jf_session";
export const DEVICE_COOKIE = "jf_did";
const SESSION_DAYS = 30;

const key = () => new TextEncoder().encode(config.sessionSecret);

export async function signToken(payload: Record<string, unknown>, expiresIn: string): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key());
}

export async function verifyToken<T>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    return payload as T;
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const token = await signToken({ sub: userId, typ: "session" }, `${SESSION_DAYS}d`);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: config.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = await verifyToken<{ sub?: string; typ?: string }>(token);
  if (!payload?.sub || payload.typ !== "session") return null;
  return getStore().getUser(payload.sub);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Device id cookie, set by proxy.ts on first visit. */
export async function getDeviceId(): Promise<string | null> {
  const value = (await cookies()).get(DEVICE_COOKIE)?.value;
  return value && UUID_RE.test(value) ? value : null;
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
