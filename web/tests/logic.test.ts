import { describe, expect, it } from "vitest";
import { normalizeIsraeliMobile, maskPhone } from "../src/lib/phone";
import { computeScore, rankGaps } from "../src/lib/scoring";
import { checkHonesty } from "../src/lib/honesty";
import { canPurchase, computeEntitlement, periodFrom, usageWindowStart } from "../src/lib/entitlement";
import { safeNext } from "../src/lib/safe-next";
import type { Subscription, TailoredResume } from "../src/lib/types";

describe("phone", () => {
  it("normalizes Israeli mobiles in all common formats", () => {
    for (const v of ["050-123-4567", "0501234567", "+972 50 123 4567", "972501234567", "00972-50-1234567"]) {
      expect(normalizeIsraeliMobile(v)).toBe("+972501234567");
    }
  });
  it("rejects landlines, short numbers and foreign numbers", () => {
    for (const v of ["03-1234567", "05012345", "+1 415 555 1234", "abc"]) {
      expect(normalizeIsraeliMobile(v)).toBeNull();
    }
  });
  it("masks the middle digits", () => {
    expect(maskPhone("+972501234567")).toBe("050-***-4567");
  });
});

describe("scoring", () => {
  it("weighs must-haves double and partial as half", () => {
    expect(
      computeScore([
        { importance: "must", status: "met" },
        { importance: "must", status: "partial" },
        { importance: "nice", status: "missing" },
      ]),
    ).toBe(Math.round(((2 + 1 + 0) / 5) * 100));
  });
  it("is 0 with no requirements", () => {
    expect(computeScore([])).toBe(0);
  });
  it("ranks missing must-haves first and drops met", () => {
    const ranked = rankGaps([
      { importance: "nice" as const, status: "missing" as const, id: "a" },
      { importance: "must" as const, status: "partial" as const, id: "b" },
      { importance: "must" as const, status: "missing" as const, id: "c" },
      { importance: "must" as const, status: "met" as const, id: "d" },
    ]);
    expect(ranked.map((r) => r.id)).toEqual(["c", "b", "a"]);
  });
});

const SOURCE = `דנה כהן
מנהלת מוצר
ניסיון
2019-2024 מנהלת מוצר בחברת אקמה מערכות
הובלתי צוות של 5 מפתחים ושיפרתי המרה ב-12%
השכלה
תואר ראשון בכלכלה, אוניברסיטת תל אביב, 2015-2018
כישורים: SQL, Jira, Figma`;

const base: TailoredResume = {
  language: "he",
  fullName: "דנה כהן",
  headline: "מנהלת מוצר",
  contact: { email: "", phone: "", location: "", links: [] },
  summary: "מנהלת מוצר עם ניסיון בהובלת צוות של 5 מפתחים.",
  experience: [
    {
      title: "מנהלת מוצר",
      organization: "אקמה מערכות",
      location: "",
      start: "2019",
      end: "2024",
      bullets: ["הובלתי צוות של 5 מפתחים", "שיפור המרה ב-12%"],
    },
  ],
  education: [{ degree: "תואר ראשון בכלכלה", institution: "אוניברסיטת תל אביב", start: "2015", end: "2018", details: "" }],
  skills: ["SQL", "Jira", "Figma"],
  languages: [],
  certifications: [],
};

describe("honesty check", () => {
  it("passes a faithful rewrite", () => {
    expect(checkHonesty(base, SOURCE)).toEqual([]);
  });
  it("flags invented numbers, employers, skills and certifications", () => {
    const fake: TailoredResume = {
      ...base,
      summary: "מנהלת מוצר עם 8 שנות ניסיון",
      experience: [{ ...base.experience[0], organization: "גוגל ישראל", bullets: ["הגדלתי הכנסות ב-40%"] }],
      skills: ["SQL", "Kubernetes"],
      certifications: ["PMP"],
    };
    const values = checkHonesty(fake, SOURCE).map((f) => f.value);
    expect(values).toEqual(expect.arrayContaining(["8", "40", "גוגל ישראל", "Kubernetes", "PMP"]));
    expect(values).not.toContain("SQL");
  });
  it("tolerates Hebrew prefixes (ב/ה/ו/ל)", () => {
    const r = { ...base, experience: [{ ...base.experience[0], organization: "באקמה מערכות" }] };
    expect(checkHonesty(r, SOURCE)).toEqual([]);
  });
});

const sub = (over: Partial<Subscription> = {}): Subscription => ({
  userId: "u",
  plan: "monthly",
  status: "active",
  cancelAtPeriodEnd: false,
  providerRef: null,
  ...periodFrom(new Date("2026-11-01T00:00:00Z"), "monthly"),
  ...over,
});

describe("entitlement", () => {
  const now = new Date("2026-11-15T00:00:00Z");
  it("is active inside the period with remaining quota", () => {
    const e = computeEntitlement(sub(), now, 3);
    expect(e.active).toBe(true);
    expect(e.remaining).toBe(37);
  });
  it("stays active until period end after cancel", () => {
    expect(computeEntitlement(sub({ status: "canceled", cancelAtPeriodEnd: true }), now, 0).active).toBe(true);
  });
  it("is inactive after period end or when expired", () => {
    expect(computeEntitlement(sub(), new Date("2026-12-02T00:00:00Z"), 0).active).toBe(false);
    expect(computeEntitlement(sub({ status: "expired" }), now, 0).active).toBe(false);
  });
  it("counts usage from the later of period start or 30 days ago", () => {
    const quarterly = sub({ plan: "quarterly", ...periodFrom(new Date("2026-09-01T00:00:00Z"), "quarterly") });
    expect(usageWindowStart(quarterly, now)).toBe(new Date(now.getTime() - 30 * 864e5).toISOString());
    expect(usageWindowStart(sub(), now)).toBe("2026-11-01T00:00:00.000Z");
  });
  it("allows the trial only once and never on top of an active plan", () => {
    expect(canPurchase("trial", { trialUsed: false, hasActive: false }).ok).toBe(true);
    expect(canPurchase("trial", { trialUsed: true, hasActive: false }).ok).toBe(false);
    expect(canPurchase("monthly", { trialUsed: true, hasActive: false }).ok).toBe(true);
    expect(canPurchase("monthly", { trialUsed: false, hasActive: true }).ok).toBe(false);
  });
});

describe("safeNext", () => {
  it("only allows local paths", () => {
    expect(safeNext("/app/new")).toBe("/app/new");
    expect(safeNext("//evil.com")).toBe("/app");
    expect(safeNext("https://evil.com")).toBe("/app");
    expect(safeNext("/\\evil.com")).toBe("/app");
  });
});
