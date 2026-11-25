import "server-only";
import { UserError } from "./errors";
import type { JobInput } from "./extract";
import { hebrewRatio } from "./honesty";
import { computeScore, coverage, potentialScore, rankGaps } from "./scoring";
import type { Analysis, Requirement, ScanResult, TailoredResume } from "./types";
import type { AnalyzeOutput, CandidateAnswer, TailorOutput } from "./ai";

/**
 * Offline fallback used when no ANTHROPIC_API_KEY is configured, so the whole
 * product can be clicked through locally. Keyword overlap only: clearly worse
 * than the real model, and labelled as demo in the UI.
 */

const STOP = new Set(
  "the and or a an to of in for with on at by from is are be as this that you your we our will can must should experience years year strong ability skills knowledge team work job role של על עם את או זה הוא היא יש אין לא כל גם כמו אם כי אבל ניסיון שנים שנות יכולת ידע עבודה משרה תפקיד דרישות חובה יתרון בעל בעלת לפחות היכרות".split(" "),
);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#]+/gu, " ")
    .split(" ")
    .map((w) => w.replace(/^[והבכלמש](?=[א-ת]{3,})/, ""))
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function jobText(job: JobInput): string {
  if (job.kind === "image") {
    throw new UserError("קריאת צילום מסך דורשת חיבור ל-AI. במצב ההדגמה הדביקו את טקסט המשרה.");
  }
  return job.text;
}

function extractRequirements(job: string, resume: string): Requirement[] {
  const resumeWords = new Set(words(resume));
  const lines = job
    .split(/\n|•|·|;/)
    .map((l) => l.replace(/^[\s\-*\d.)]+/, "").trim())
    .filter((l) => l.length > 12 && l.length < 220 && words(l).length >= 2);
  const picked = lines.slice(0, 10);
  return picked.map((text, i) => {
    const w = words(text);
    const hit = w.filter((x) => resumeWords.has(x));
    const ratio = hit.length / w.length;
    const status = ratio >= 0.5 ? "met" : ratio >= 0.25 ? "partial" : "missing";
    return {
      text,
      importance: i < Math.ceil(picked.length / 2) || /חובה|must|required/i.test(text) ? "must" : "nice",
      status,
      evidence: hit.length ? `מופיע בקורות החיים: ${hit.slice(0, 4).join(", ")}` : "",
    } satisfies Requirement;
  });
}

function titleOf(job: string): string {
  const first = job.split("\n").map((l) => l.trim()).find((l) => l.length > 2) ?? "משרה";
  return first.slice(0, 70);
}

export function demoScan(resumeText: string, job: JobInput): ScanResult {
  const text = jobText(job);
  // Demo heuristic: partial keyword overlap is treated as a wording gap.
  const reqs = extractRequirements(text, resumeText).map((r) => ({
    ...r,
    gapType: r.status === "met" ? "none" : r.status === "partial" ? "phrasing" : "missing",
  }));
  const gaps = rankGaps(reqs);
  return {
    jobTitle: titleOf(text),
    company: "",
    score: computeScore(reqs),
    potentialScore: potentialScore(reqs),
    verdict: "מצב הדגמה: הציון מחושב לפי חפיפת מילים בלבד. עם חיבור ל-AI הניתוח מבין הקשר ומשמעות.",
    strengths: reqs.filter((r) => r.status === "met").slice(0, 3).map((r) => `יש לך התאמה ל: ${r.text}`),
    phrasingGapCount: gaps.filter((g) => g.gapType === "phrasing").length,
    missingGapCount: gaps.filter((g) => g.gapType === "missing").length,
    topGaps: gaps.slice(0, 3).map((g) => ({
      requirement: g.text,
      gapType: g.gapType as "phrasing" | "missing",
      tip: g.status === "partial" ? "יש לך ניסיון קרוב. כדאי לנסח אותו במפורש בשפה של המשרה." : "אם יש לך ניסיון כזה, הוסיפו אותו. אם לא, אל תוסיפו.",
    })),
    hiddenGapCount: Math.max(0, gaps.length - 3),
    coveredCount: coverage(reqs).covered,
    requirementCount: coverage(reqs).total,
    sampleRewrite: null,
  };
}

export function demoAnalyze(resumeText: string, job: JobInput): AnalyzeOutput {
  const text = jobText(job);
  const requirements = extractRequirements(text, resumeText).map((r) => ({ ...r, kind: "skill" as const }));
  const gaps = rankGaps(requirements);
  return {
    analysis: {
      jobTitle: titleOf(text),
      company: "",
      language: "he",
      score: computeScore(requirements),
      summary: "מצב הדגמה: הניתוח מבוסס על חפיפת מילים בלבד. עם חיבור ל-AI המנוע גם בודק מה נדרש בתפקיד כזה מעבר למודעה.",
      requirements,
      strengths: requirements.filter((r) => r.status === "met").map((r) => r.text).slice(0, 4),
      insights: gaps.slice(0, 4).map((g) => ({
        topic: g.text.slice(0, 60),
        source: "posting" as const,
        resumeStatus: g.status === "partial" ? ("hidden" as const) : ("absent" as const),
        evidence: "",
        why: "מופיע בדרישות המשרה.",
      })),
      scoreVersion: 2,
    },
    questions: gaps.slice(0, 3).map((g, i) => ({
      id: `q${i + 1}`,
      topic: g.text.slice(0, 40),
      question: `יש לך ניסיון שקשור ל"${g.text.slice(0, 80)}"? אם כן, ספרו במשפט או שניים מה עשית ובאיזה היקף.`,
      why: "אם זה נכון, נוכל להבליט את זה בקורות החיים.",
    })),
  };
}

export function demoTailor(
  resumeText: string,
  job: JobInput,
  language: "auto" | "he" | "en",
  prep: { analysis: Analysis; answers: CandidateAnswer[] },
): TailorOutput {
  jobText(job);
  const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);
  const lang: "he" | "en" = language === "auto" ? (hebrewRatio(resumeText) > 0.3 ? "he" : "en") : language;
  const email = resumeText.match(/[\w.+-]+@[\w-]+\.[\w.]+/)?.[0] ?? "";
  const phone = resumeText.match(/(?:\+972|0)5\d[- ]?\d{3}[- ]?\d{4}/)?.[0] ?? "";
  const bullets = lines.filter((l) => l.length > 40).slice(0, 6);
  const answered = prep.answers.filter((a) => a.answer.trim());

  const resume: TailoredResume = {
    language: lang,
    fullName: lines[0]?.slice(0, 60) ?? "",
    headline: "",
    contact: { email, phone, location: "", links: [] },
    summary: bullets[0] ?? "",
    experience: [
      {
        title: lines[1]?.slice(0, 80) ?? "",
        organization: "",
        location: "",
        start: "",
        end: "",
        bullets: [...bullets.slice(1), ...answered.map((a) => a.answer.trim().slice(0, 140))],
      },
    ],
    education: [],
    skills: [],
    languages: [],
    certifications: [],
  };

  return {
    resume,
    addOnlyIfTrue: prep.analysis.requirements
      .filter((r) => r.status === "missing")
      .map((r) => ({ requirement: r.text, suggestion: "אם יש לך ניסיון כזה, תארו אותו בשורה אחת עם הקשר ותוצאה." })),
    changeLog: [
      "מצב הדגמה: התוכן הועתק מקורות החיים המקוריים ללא שכתוב.",
      ...(answered.length ? [`נוספו ${answered.length} פרטים מהתשובות שלך.`] : []),
    ],
  };
}

export function demoCoverLetter(resume: TailoredResume, analysis: Analysis): string {
  return resume.language === "he"
    ? `שלום,\n\nראיתי את המשרה "${analysis.jobTitle}" ואשמח להגיש מועמדות.\n\n(מצב הדגמה: עם חיבור ל-AI כאן ייכתב מכתב מקדים קצר ומדויק שמבוסס רק על הניסיון שלך.)\n\nבברכה,\n${resume.fullName}`
    : `Hello,\n\nI'd like to apply for the "${analysis.jobTitle}" role.\n\n(Demo mode: with AI connected, a short, specific cover letter based only on your real experience is written here.)\n\nBest regards,\n${resume.fullName}`;
}
