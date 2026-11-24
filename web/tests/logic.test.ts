import { describe, expect, it } from "vitest";
import { normalizeIsraeliMobile, maskPhone } from "../src/lib/phone";
import { computeScore, potentialScore, rankGaps } from "../src/lib/scoring";
import { checkHonesty, newNumbers } from "../src/lib/honesty";
import { verifyRequirements } from "../src/lib/evidence";
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

type R = { importance: "must" | "nice"; status: "met" | "partial" | "missing"; kind?: "core" | "skill" | "credential" | "soft" };
const req = (kind: R["kind"], importance: R["importance"], status: R["status"]): R => ({ kind, importance, status });

describe("scoring v2", () => {
  it("weighs the role's core most and partial well under half", () => {
    // core must met (3) + skill must partial (2 x 0.4) + soft nice missing (0.25 x 0)
    expect(computeScore([req("core", "must", "met"), req("skill", "must", "partial"), req("soft", "nice", "missing")])).toBe(
      Math.round(((3 + 0.8) / (3 + 2 + 0.25)) * 100),
    );
  });
  it("is 0 with no requirements", () => {
    expect(computeScore([])).toBe(0);
  });
  it("caps the score when a core must-have is missing", () => {
    const one = [req("core", "must", "missing"), ...Array(6).fill(req("skill", "must", "met"))];
    expect(computeScore(one)).toBeLessThanOrEqual(55);
    const two = [req("core", "must", "missing"), req("core", "must", "missing"), ...Array(8).fill(req("skill", "must", "met"))];
    expect(computeScore(two)).toBeLessThanOrEqual(35);
  });
  it("caps the score when a required credential is missing", () => {
    expect(computeScore([req("credential", "must", "missing"), ...Array(6).fill(req("core", "must", "met"))])).toBeLessThanOrEqual(60);
  });
  it("lowers the score for a different role or a big seniority gap", () => {
    const reqs = [req("core", "must", "met"), req("skill", "must", "met"), req("skill", "nice", "partial")];
    const same = computeScore(reqs, { roleAlignment: "same", seniority: "fits" });
    expect(computeScore(reqs, { roleAlignment: "adjacent", seniority: "one_below" })).toBeLessThan(same);
    expect(computeScore(reqs, { roleAlignment: "unrelated", seniority: "far_below" })).toBeLessThan(40);
  });
  it("spreads realistic candidates for an HR manager job far apart", () => {
    const hrManager = computeScore(
      [
        req("core", "must", "met"), // people management
        req("core", "must", "met"), // HR strategy / business partnering
        req("core", "must", "met"), // 5+ years in HR management
        req("skill", "must", "met"), // labor law
        req("skill", "nice", "partial"), // HRIS
        req("credential", "nice", "met"), // degree in behavioral sciences
      ],
      { roleAlignment: "same", seniority: "fits" },
    );
    const hrGeneralist = computeScore(
      [
        req("core", "must", "partial"),
        req("core", "must", "partial"),
        req("core", "must", "missing"),
        req("skill", "must", "met"),
        req("skill", "nice", "met"),
        req("credential", "nice", "met"),
      ],
      { roleAlignment: "adjacent", seniority: "one_below" },
    );
    const accountant = computeScore(
      [
        req("core", "must", "missing"),
        req("core", "must", "missing"),
        req("core", "must", "missing"),
        req("skill", "must", "missing"),
        req("skill", "nice", "partial"),
        req("credential", "nice", "missing"),
        req("soft", "must", "met"),
      ],
      { roleAlignment: "unrelated", seniority: "fits" },
    );
    expect(hrManager).toBeGreaterThanOrEqual(85);
    expect(hrGeneralist).toBeGreaterThan(25);
    expect(hrGeneralist).toBeLessThan(60);
    expect(accountant).toBeLessThanOrEqual(15);
    expect(hrManager - accountant).toBeGreaterThan(65);
  });
  it("potential score only lifts wording gaps, never missing ones", () => {
    const reqs = [
      { ...req("skill", "must", "met"), gapType: "none" },
      { ...req("skill", "must", "partial"), gapType: "phrasing" },
      { ...req("skill", "must", "missing"), gapType: "missing" },
    ];
    expect(computeScore(reqs)).toBe(47);
    expect(potentialScore(reqs)).toBe(67);
  });
  it("ranks the heaviest gaps first and drops met", () => {
    const ranked = rankGaps([
      { ...req("skill", "nice", "missing"), id: "a" },
      { ...req("skill", "must", "partial"), id: "b" },
      { ...req("core", "must", "missing"), id: "c" },
      { ...req("core", "must", "met"), id: "d" },
    ]);
    expect(ranked.map((r) => r.id)).toEqual(["c", "b", "a"]);
  });
});

describe("evidence check", () => {
  const resume = `נועה לוי
מנהלת משאבי אנוש, חברת אופק בע"מ, 2019-2024
- ניהלתי צוות של 4 רכזות גיוס ושכר
- הובלתי את תהליך הקליטה וההכשרה לעובדים חדשים
- Built HR dashboards in Power BI`;

  it("keeps requirements whose quote is really in the resume", () => {
    const [r] = verifyRequirements([{ text: "ניהול צוות", importance: "must", status: "met", evidence: "ניהלתי צוות של 4 רכזות גיוס" }], resume);
    expect(r.status).toBe("met");
    expect(r.verified).toBe(true);
  });
  it("tolerates Hebrew prefixes and small wording differences", () => {
    const [r] = verifyRequirements([{ text: "קליטה", importance: "must", status: "met", evidence: "הובלתי תהליך קליטה והכשרה של עובדים חדשים" }], resume);
    expect(r.verified).toBe(true);
  });
  it("lowers the status when the quote is invented", () => {
    const out = verifyRequirements(
      [
        { text: "ROI", importance: "must", status: "met", evidence: "מדדתי ROI של תוכניות רווחה וחסכתי 2 מיליון" },
        { text: "BP", importance: "nice", status: "partial", evidence: "שותפה עסקית להנהלה הבכירה" },
        { text: "none", importance: "nice", status: "missing", evidence: "something" },
      ],
      resume,
    );
    expect(out.map((r) => r.status)).toEqual(["partial", "missing", "missing"]);
    expect(out[2].evidence).toBe("");
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

import { isMilitary, splitSkills } from "../src/lib/resume-layout";

describe("resume layout", () => {
  it("puts military and national service in its own section", () => {
    expect(isMilitary({ title: "קצין מדריך", organization: "שירות צבאי" })).toBe(true);
    expect(isMilitary({ title: 'סמ"פ', organization: 'צה"ל' })).toBe(true);
    expect(isMilitary({ title: "רכזת", organization: "שירות לאומי" })).toBe(true);
    expect(isMilitary({ title: "מנהל פרויקטים", organization: "שופרסל" })).toBe(false);
    expect(isMilitary({ title: "x", organization: "y", military: true })).toBe(true);
  });
  it("splits Hebrew skills from Latin-script tools", () => {
    const r = splitSkills(["אפיון צרכים", "Excel", "Power BI", "חשיבה אנליטית", "כלי בינה מלאכותית (AI)"], "he");
    expect(r.skills).toEqual(["אפיון צרכים", "חשיבה אנליטית"]);
    expect(r.tools).toEqual(["Excel", "Power BI", "כלי בינה מלאכותית (AI)"]);
  });
});
