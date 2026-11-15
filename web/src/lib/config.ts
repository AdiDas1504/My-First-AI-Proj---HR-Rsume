import "server-only";

const isProd = process.env.NODE_ENV === "production";

function sessionSecret(): string {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 32) return value;
  if (isProd && process.env.DEMO_MODE !== "1") {
    throw new Error("SESSION_SECRET must be set (32+ characters) in production.");
  }
  return "dev-only-insecure-session-secret-change-me-0123456789";
}

export const config = {
  appUrl: (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  get sessionSecret() {
    return sessionSecret();
  },
  anthropicKey: process.env.ANTHROPIC_API_KEY || undefined,
  modelTailor: process.env.CLAUDE_MODEL_TAILOR || "claude-sonnet-5-5",
  modelScan: process.env.CLAUDE_MODEL_SCAN || "claude-haiku-5-5",
  supabaseUrl: process.env.SUPABASE_URL || undefined,
  // New Supabase secret key (sb_secret_...); the legacy service_role key is a fallback.
  supabaseServiceKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || undefined,
  smsProvider: (process.env.SMS_PROVIDER || "console") as "console" | "twilio",
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_FROM,
  },
  paymentProvider: (process.env.PAYMENT_PROVIDER || "demo") as "demo",
  isProd,
};

/** Which subsystems are running in local demo mode (no external service). */
export const demo = {
  ai: !config.anthropicKey,
  db: !(config.supabaseUrl && config.supabaseServiceKey),
  sms: config.smsProvider === "console",
  payments: config.paymentProvider === "demo",
};

export const anyDemo = demo.ai || demo.db || demo.sms || demo.payments;

/**
 * Demo SMS (code shown on screen) and demo payments (free subscription) are only
 * safe locally. In production they require an explicit DEMO_MODE=1, e.g. for a
 * private preview; otherwise login and checkout refuse to run.
 */
export const demoShortcutsAllowed = !isProd || process.env.DEMO_MODE === "1";
