import "server-only";
import { getStore } from "./store";

/**
 * Sliding-window limit. Returns true when the action is allowed, and records it.
 * Counting happens before recording, so concurrent bursts may overshoot by a few;
 * that is acceptable for these limits.
 */
export async function takeRateLimit(key: string, limit: number, windowMinutes: number): Promise<boolean> {
  const store = getStore();
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
  const count = await store.countRateEvents(key, since);
  if (count >= limit) return false;
  await store.addRateEvent(key);
  return true;
}
