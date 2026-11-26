/** Pages counted in the owner's funnel. Anything else is not tracked. */
export const TRACKED_PAGES: Record<string, string> = {
  "/": "home",
  "/scan": "scan",
  "/pricing": "pricing",
  "/login": "login",
  "/checkout": "checkout",
  "/builder": "builder",
  "/app/new": "tailor_new",
};
export const TRACKED_NAMES = new Set(Object.values(TRACKED_PAGES));
