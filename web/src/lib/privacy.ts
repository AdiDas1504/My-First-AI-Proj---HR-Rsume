import "server-only";
import { createHmac } from "node:crypto";
import { after } from "next/server";
import { config } from "./config";
import { takeRateLimit } from "./rate-limit";
import { getStore } from "./store";

/** How long data is kept (must match the privacy policy page). */
export const RETENTION_DAYS = {
  /** Tailored versions and built resumes, from their last update. */
  documents: 180,
  /** Analysis + answers kept between "analyze" and "write". */
  sessions: 7,
  /** Rate-limit counters (longest window is a day). */
  rateEvents: 2,
  /** Expired login codes. */
  otps: 1,
  /** Anonymous page views and AI cost records (year-over-year comparison). */
  analytics: 400,
};

/**
 * One-way key for phone numbers and IPs kept in the free-scan list, so the
 * list can stop repeat free checks without storing the numbers themselves.
 * PHONE_HASH_SECRET keeps keys stable if SESSION_SECRET is ever rotated.
 */
export function privateKey(value: string): string {
  const secret = process.env.PHONE_HASH_SECRET || config.sessionSecret;
  return "h1:" + createHmac("sha256", secret).update(value).digest("hex").slice(0, 40);
}

const DAY = 24 * 60 * 60 * 1000;
let lastAttempt = 0;

/** Deletes expired data at most once a day, after the response is sent. */
export function schedulePurge() {
  if (Date.now() - lastAttempt < 6 * 60 * 60 * 1000) return;
  lastAttempt = Date.now();
  after(async () => {
    try {
      if (!(await takeRateLimit("purge:daily", 1, 24 * 60))) return;
      const now = Date.now();
      const iso = (days: number) => new Date(now - days * DAY).toISOString();
      const counts = await getStore().purgeExpired({
        documents: iso(RETENTION_DAYS.documents),
        drafts: iso(RETENTION_DAYS.documents),
        sessions: iso(RETENTION_DAYS.sessions),
        otps: iso(RETENTION_DAYS.otps),
        rateEvents: iso(RETENTION_DAYS.rateEvents),
        analytics: iso(RETENTION_DAYS.analytics),
      });
      console.info("purge: deleted expired data", counts);
    } catch (err) {
      console.error("purge failed", err);
    }
  });
}
