import type { Requirement } from "./types";

/**
 * The AI must back every "met" / "partial" with a short exact quote from the
 * resume. If the quote is not really there, the claim is not trusted and the
 * status drops one level. This is what keeps the score tied to the resume.
 */

const PREFIX = /^(?:וכש|וש|וה|וב|ול|ומ|שה|שב|של|מה|כש|לה|בה|ו|ה|ב|ל|מ|ש|כ)(?=[א-ת]{2,})/;

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[״"׳']/g, "")
    .split(/[^\p{L}\p{N}+#.]+/u)
    .map((t) => t.replace(/^\.+|\.+$/g, ""))
    .filter((t) => t.length >= 2);
}

function stem(t: string): string {
  return t.replace(PREFIX, "");
}

export function resumeIndex(resumeText: string): Set<string> {
  const set = new Set<string>();
  for (const t of tokens(resumeText)) {
    set.add(t);
    set.add(stem(t));
  }
  return set;
}

/** True when (almost) every word of the quote appears in the resume. */
export function evidenceInResume(evidence: string, index: Set<string>, resumeText: string): boolean {
  const quote = evidence.trim();
  if (!quote) return false;
  const words = tokens(quote);
  if (words.length < 2) return resumeText.toLowerCase().includes(quote.toLowerCase());
  const found = words.filter((w) => index.has(w) || index.has(stem(w))).length;
  return found / words.length >= 0.75;
}

export function verifyRequirements<T extends Requirement>(requirements: T[], resumeText: string): (T & { verified: boolean })[] {
  const index = resumeIndex(resumeText);
  return requirements.map((r) => {
    if (r.status === "missing") return { ...r, evidence: "", verified: true };
    if (evidenceInResume(r.evidence, index, resumeText)) return { ...r, verified: true };
    return { ...r, status: r.status === "met" ? "partial" : "missing", verified: false };
  });
}
