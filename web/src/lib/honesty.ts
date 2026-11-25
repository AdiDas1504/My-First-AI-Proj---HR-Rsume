import type { HonestyFlag, TailoredResume } from "./types";

/**
 * Deterministic honesty check: everything verifiable in the tailored resume
 * (numbers, dates, employers, titles, institutions, skills, certifications)
 * must be traceable to the original resume text. This runs after the AI and
 * again after every user edit. It flags; the user decides.
 */

/**
 * Forms of a word to match on: as written, without a 1- or 2-letter prefix
 * ("והשמה" -> "השמה", "שמה"), and with a common ending dropped
 * ("רווחה" / "רווחת" -> "רווח", "עובדים" -> "עובד").
 */
function forms(t: string): string[] {
  const out = new Set([t]);
  if (/^[א-ת]+$/.test(t)) {
    for (const n of [1, 2]) {
      if (t.length - n >= 2 && /^[והבכלמש]+$/.test(t.slice(0, n))) out.add(t.slice(n));
    }
    for (const f of [...out]) if (f.length >= 4) out.add(f.replace(/(ים|ות|ת|ה|י)$/, ""));
  }
  return [...out];
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[֑-ׇ]/g, "") // niqqud
    .replace(/["'`׳״]/g, "")
    .replace(/[^\p{L}\p{N}+#.%]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .map((t) => t.replace(/\.$/, ""))
    .filter((t) => t.length > 1);
}

export function hebrewRatio(text: string): number {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return 0;
  return letters.filter((c) => /[א-ת]/.test(c)).length / letters.length;
}

function makeSourceIndex(source: string) {
  const norm = normalize(source);
  const tokenSet = new Set<string>();
  for (const t of tokens(source)) for (const f of forms(t)) tokenSet.add(f);
  const numbers = new Set((source.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", ".")));
  return { norm, tokenSet, numbers };
}

type SourceIndex = ReturnType<typeof makeSourceIndex>;

function phraseSupported(phrase: string, idx: SourceIndex): boolean {
  const norm = normalize(phrase);
  if (!norm) return true;
  if (idx.norm.includes(norm)) return true;
  const toks = tokens(phrase);
  if (toks.length === 0) return true;
  const found = toks.filter((t) => forms(t).some((f) => idx.tokenSet.has(f))).length;
  return found / toks.length >= 0.6;
}

function numbersIn(text: string): string[] {
  return (text.match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(",", "."));
}

/** Numbers in `text` that do not appear in `source` (used to vet rewritten lines). */
export function newNumbers(text: string, source: string): string[] {
  const known = new Set(numbersIn(source));
  return numbersIn(text).filter((n) => !known.has(n));
}

export function checkHonesty(resume: TailoredResume, sourceText: string): HonestyFlag[] {
  const idx = makeSourceIndex(sourceText);
  const flags: HonestyFlag[] = [];
  const sameLanguage = (hebrewRatio(sourceText) > 0.3) === (resume.language === "he");

  const checkNumbers = (field: string, text: string) => {
    for (const n of numbersIn(text)) {
      if (!idx.numbers.has(n)) {
        flags.push({ field, value: n, reason: "המספר הזה לא מופיע בקורות החיים המקוריים" });
      }
    }
  };

  const checkPhrase = (field: string, value: string, reason: string) => {
    if (value.trim() && !phraseSupported(value, idx)) flags.push({ field, value, reason });
  };

  checkNumbers("תקציר", resume.summary);
  checkNumbers("כותרת", resume.headline);

  resume.experience.forEach((e, i) => {
    const where = `ניסיון ${i + 1}`;
    if (sameLanguage) {
      checkPhrase(`${where} · ארגון`, e.organization, "הארגון הזה לא מופיע בקורות החיים המקוריים");
      checkPhrase(`${where} · תפקיד`, e.title, "התפקיד הזה לא מופיע בקורות החיים המקוריים");
    }
    checkNumbers(`${where} · תאריכים`, `${e.start} ${e.end}`);
    e.bullets.forEach((b, j) => checkNumbers(`${where} · שורה ${j + 1}`, b));
  });

  resume.education.forEach((e, i) => {
    const where = `השכלה ${i + 1}`;
    if (sameLanguage) {
      checkPhrase(`${where} · מוסד`, e.institution, "המוסד הזה לא מופיע בקורות החיים המקוריים");
      checkPhrase(`${where} · תואר`, e.degree, "התואר הזה לא מופיע בקורות החיים המקוריים");
    }
    checkNumbers(`${where} · תאריכים`, `${e.start} ${e.end} ${e.details}`);
  });

  for (const skill of resume.skills) {
    // Latin-script skill names (tools, technologies) stay in English in Hebrew
    // resumes, so they can always be checked.
    if (sameLanguage || /[a-z]/i.test(skill)) {
      checkPhrase("מיומנויות", skill, "המיומנות הזו לא מופיעה בקורות החיים המקוריים");
    }
  }
  for (const cert of resume.certifications) {
    if (sameLanguage || /[a-z]/i.test(cert)) {
      checkPhrase("הסמכות", cert, "ההסמכה הזו לא מופיעה בקורות החיים המקוריים");
    }
  }

  const seen = new Set<string>();
  return flags.filter((f) => {
    const k = `${f.field}|${f.value}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/**
 * Skills the source does not support are taken out of the resume and offered
 * as "add only if true" instead, so a skills list never claims more than the
 * candidate told us.
 */
export function dropUnsupportedSkills(resume: TailoredResume, sourceText: string): { resume: TailoredResume; dropped: string[] } {
  const idx = makeSourceIndex(sourceText);
  const sameLanguage = (hebrewRatio(sourceText) > 0.3) === (resume.language === "he");
  const checkable = (s: string) => sameLanguage || /[a-z]/i.test(s);
  const dropped = resume.skills.filter((s) => checkable(s) && !phraseSupported(s, idx));
  return { resume: { ...resume, skills: resume.skills.filter((s) => !dropped.includes(s)) }, dropped };
}
