import { describe, expect, it } from "vitest";
import { normalizeIsraeliMobile, maskPhone } from "../src/lib/phone";
import { computeScore, potentialScore, rankGaps } from "../src/lib/scoring";
import { checkHonesty, newNumbers } from "../src/lib/honesty";
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
  it("potential score only lifts wording gaps, never missing ones", () => {
    const reqs = [
      { importance: "must" as const, status: "met" as const, gapType: "none" },
      { importance: "must" as const, status: "partial" as const, gapType: "phrasing" },
      { importance: "must" as const, status: "missing" as const, gapType: "missing" },
    ];
    expect(computeScore(reqs)).toBe(50);
    expect(potentialScore(reqs)).toBe(67);
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
  it("vets a rewritten line for invented numbers", () => {
    expect(newNumbers("הובלתי צוות של 5 מפתחים", "ניהלתי 5 מפתחים")).toEqual([]);
    expect(newNumbers("הובלתי צוות של 8 מפתחים ושיפרתי ב-30%", "ניהלתי 5 מפתחים")).toEqual(["8", "30"]);
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

import { answersToText, assembleResume, emptyAnswers, readiness, resumeToText } from "../src/lib/builder";

describe("resume builder", () => {
  const filled = () => {
    const a = emptyAnswers();
    a.personal.fullName = "יוסי כהן";
    a.personal.phone = "050-1234567";
    a.target.role = "רכז לוגיסטיקה";
    a.roles[0] = {
      title: "אחראי משמרת",
      organization: "מחסני השרון",
      location: "",
      start: "2022",
      end: "",
      description: "ניהלתי משמרת במחסן",
      followups: [{ question: "כמה עובדים?", answer: "צוות של 7 עובדים" }],
    };
    a.skills = "Excel, מלגזה";
    return a;
  };

  it("requires a name, a contact and one described role", () => {
    const r = readiness(emptyAnswers());
    expect(r.ok).toBe(false);
    expect(r.missing).toHaveLength(3);
    expect(readiness(filled()).ok).toBe(true);
  });

  it("uses follow-up answers as facts for the honesty check", () => {
    const a = filled();
    const source = answersToText(a);
    const built = { ...assembleResume(a), summary: "אחראי משמרת עם צוות של 7 עובדים" };
    expect(checkHonesty(built, source)).toEqual([]);
    const inflated = { ...built, summary: "ניהלתי צוות של 20 עובדים" };
    expect(checkHonesty(inflated, source).map((f) => f.value)).toContain("20");
  });

  it("renders a built resume to text for tailoring", () => {
    const text = resumeToText(assembleResume(filled()));
    expect(text).toContain("יוסי כהן");
    expect(text).toContain("- צוות של 7 עובדים");
    expect(text).toContain("Excel");
  });
});

import { describeAiError } from "../src/lib/ai-errors";

describe("AI error messages", () => {
  it("names the cause with a code the owner can act on", () => {
    expect(describeAiError(401, "invalid x-api-key").text).toContain("AI-401");
    expect(describeAiError(404, "model: not found").text).toContain("AI-404");
    expect(describeAiError(429, "rate_limit_error").text).toContain("AI-429");
    expect(describeAiError(400, "Your credit balance is too low").text).toContain("AI-CREDIT");
    expect(describeAiError(400, "You have reached your specified workspace API usage limits").text).toContain("AI-SPEND");
    expect(describeAiError(undefined, "Request timed out.").text).toContain("AI-TIMEOUT");
  });
});

import { rejectsForcedToolUse, thinkingFor, toStrictSchema } from "../src/lib/ai-request";

describe("AI request shaping", () => {
  it("knows which models reject forced tool use", () => {
    expect(rejectsForcedToolUse("claude-sonnet-5-5")).toBe(true);
    expect(rejectsForcedToolUse("claude-opus-5-5")).toBe(true);
    expect(rejectsForcedToolUse("claude-haiku-5-5")).toBe(false);
    expect(rejectsForcedToolUse("claude-sonnet-4-6")).toBe(false);
  });
  it("turns off up-front thinking only on Sonnet 5.5", () => {
    expect(thinkingFor("claude-sonnet-5-5")).toEqual({ type: "between_tools" });
    expect(thinkingFor("claude-haiku-5-5")).toBeUndefined();
  });
  it("adds additionalProperties:false to every object, nested and in arrays", () => {
    const strict = toStrictSchema({
      type: "object",
      properties: {
        a: { type: "object", properties: { b: { type: "string" } } },
        list: { type: "array", items: { type: "object", properties: { c: { type: "string" } } } },
        maybe: { anyOf: [{ type: "object", properties: {} }, { type: "null" }] },
      },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as Record<string, any>;
    expect(strict.additionalProperties).toBe(false);
    expect(strict.properties.a.additionalProperties).toBe(false);
    expect(strict.properties.list.items.additionalProperties).toBe(false);
    expect(strict.properties.maybe.anyOf[0].additionalProperties).toBe(false);
    expect(strict.properties.list.additionalProperties).toBeUndefined();
  });
});
