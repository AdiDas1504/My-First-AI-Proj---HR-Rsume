import type { AdminData } from "./store/types";

/** Readable names for what each AI call was for. */
export const AI_PURPOSE: Record<string, string> = {
  report_fit_check: "בדיקה חינמית",
  report_analysis: "ניתוח ושאלות לפני כתיבה",
  deliver_tailored_resume: "כתיבת קורות חיים מותאמים",
  deliver_cover_letter: "מכתב מקדים",
  extract_and_diagnose: "בונה: אבחון קורות חיים",
  ask_followups: "בונה: שאלות המשך",
  deliver_resume: "בונה: כתיבת קורות חיים",
};

const dayKey = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : null);

export type DayRow = {
  day: string;
  visitors: number;
  signups: number;
  scans: number;
  trials: number;
  paid: number;
  revenueAgorot: number;
  aiCostMicros: number;
};

export function buildStats(data: AdminData, opts: { days: number; now?: Date }) {
  const now = opts.now ?? new Date();
  const paidPayments = data.payments.filter((p) => p.status === "paid");
  const subscriptions = paidPayments.filter((p) => p.plan === "monthly" || p.plan === "quarterly");
  const trials = paidPayments.filter((p) => p.plan === "trial");
  const builder = paidPayments.filter((p) => p.plan === "builder");
  const scans = data.usage.filter((u) => u.kind === "scan");
  const tailors = data.usage.filter((u) => u.kind === "tailor");

  const visitors = new Set(data.events.map((e) => e.visitor).filter(Boolean)).size;
  const scanPageVisitors = new Set(data.events.filter((e) => e.name === "scan").map((e) => e.visitor).filter(Boolean)).size;
  const scanUsers = new Set(scans.map((s) => s.userId)).size;
  const aiCost = data.ai.reduce((sum, a) => sum + a.costMicros, 0);
  const revenue = paidPayments.reduce((sum, p) => sum + p.amountAgorot, 0);

  const totals = {
    visitors,
    scanPageVisitors,
    signups: data.users.length,
    scans: scans.length,
    scanUsers,
    trials: trials.length,
    subscriptions: subscriptions.length,
    builder: builder.length,
    tailors: tailors.length,
    covers: data.usage.filter((u) => u.kind === "cover").length,
    builderDrafts: data.drafts.length,
    revenueAgorot: revenue,
    aiCostMicros: aiCost,
  };

  /** Each step of the funnel, as a share of the step before it. */
  const funnel = [
    { label: "ביקרו באתר", value: visitors, rate: null as number | null },
    { label: "נרשמו עם טלפון", value: totals.signups, rate: pct(totals.signups, visitors) },
    { label: "עשו בדיקה חינמית", value: scanUsers, rate: pct(scanUsers, totals.signups) },
    { label: "התחילו שבוע היכרות", value: totals.trials, rate: pct(totals.trials, scanUsers) },
    { label: "שילמו על מנוי", value: totals.subscriptions, rate: pct(totals.subscriptions, totals.trials) },
  ];

  const daily: DayRow[] = [];
  const n = Math.min(opts.days, 14);
  for (let i = n - 1; i >= 0; i--) {
    const day = dayKey(new Date(now.getTime() - i * 86_400_000).toISOString());
    const on = <T extends { createdAt: string }>(xs: T[]) => xs.filter((x) => dayKey(x.createdAt) === day);
    daily.push({
      day,
      visitors: new Set(on(data.events).map((e) => e.visitor).filter(Boolean)).size,
      signups: on(data.users).length,
      scans: on(scans).length,
      trials: on(trials).length,
      paid: on(subscriptions).length + on(builder).length,
      revenueAgorot: on(paidPayments).reduce((s, p) => s + p.amountAgorot, 0),
      aiCostMicros: on(data.ai).reduce((s, a) => s + a.costMicros, 0),
    });
  }

  const byPurpose = new Map<string, { calls: number; costMicros: number }>();
  for (const a of data.ai) {
    const x = byPurpose.get(a.purpose) ?? { calls: 0, costMicros: 0 };
    x.calls += 1;
    x.costMicros += a.costMicros;
    byPurpose.set(a.purpose, x);
  }
  const aiByPurpose = [...byPurpose.entries()]
    .map(([purpose, x]) => ({ purpose, label: AI_PURPOSE[purpose] ?? purpose, ...x, avgMicros: Math.round(x.costMicros / x.calls) }))
    .sort((a, b) => b.costMicros - a.costMicros);

  return { totals, funnel, daily, aiByPurpose };
}

/** Dollars to shekels for display only (approximate, owner's dashboard). */
export const USD_TO_ILS = 3.7;
export const ils = (agorot: number) => `₪${(agorot / 100).toLocaleString("he-IL", { maximumFractionDigits: 0 })}`;
export const ilsFromMicros = (micros: number) => {
  const v = (micros / 1_000_000) * USD_TO_ILS;
  // Single calls cost fractions of an agora: show 3 decimals so they don't read as zero.
  const digits = v > 0 && v < 0.1 ? 3 : 2;
  return `₪${v.toLocaleString("he-IL", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};
