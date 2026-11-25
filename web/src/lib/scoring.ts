import type { Requirement, RequirementKind, RoleAlignment, Seniority } from "./types";

/**
 * Match score (v2). The AI never produces the number: it only assesses each
 * requirement (with a verified quote from the resume), the overall role
 * alignment and the seniority gap. The score is computed here, so it is
 * consistent, explainable, and clearly different for strong and weak fits.
 *
 * Why v2: in v1 every requirement weighed about the same, "partial" was worth
 * half, generic soft skills counted fully and a missing core must-have barely
 * hurt, so most resumes landed around 50-65 whatever the job.
 */

type Scored = Pick<Requirement, "importance" | "status"> & { kind?: RequirementKind };
export type FitContext = { roleAlignment?: RoleAlignment; seniority?: Seniority };

/** How much a requirement can move the score: the job's core counts most. */
const KIND_WEIGHT: Record<RequirementKind, number> = { core: 3, skill: 2, credential: 1.5, soft: 0.5 };
/** Partial evidence (related, smaller scope, transferable) is worth well under half. */
const CREDIT = { met: 1, partial: 0.4, missing: 0 } as const;
const ALIGNMENT: Record<RoleAlignment, number> = { same: 1, adjacent: 0.9, transferable: 0.72, unrelated: 0.45 };
// Mild on purpose: missing years are usually also a core requirement, so this must not double-punish.
const SENIORITY: Record<Seniority, number> = { fits: 1, above: 0.95, one_below: 0.95, far_below: 0.85 };
/**
 * Someone already working in the same profession is never scored like a
 * career changer: e.g. a recruiter with 3 years applying for an HR manager role
 * that asks for 5 gets about 30, not 20. Owner's calibration, Nov 2026.
 */
const SAME_FIELD_FLOOR = 30;

export function requirementWeight(r: Scored): number {
  return KIND_WEIGHT[r.kind ?? "skill"] * (r.importance === "must" ? 1 : 0.5);
}

export function computeScore(requirements: Scored[], ctx: FitContext = {}): number {
  if (requirements.length === 0) return 0;
  let total = 0;
  let got = 0;
  for (const r of requirements) {
    const w = requirementWeight(r);
    total += w;
    got += w * CREDIT[r.status];
  }
  let score = (got / total) * 100;
  score *= ALIGNMENT[ctx.roleAlignment ?? "same"] * SENIORITY[ctx.seniority ?? "fits"];

  // Knock-outs: a recruiter screens these out regardless of everything else.
  const missingCoreMust = requirements.filter((r) => r.kind === "core" && r.importance === "must" && r.status === "missing").length;
  const missingCredentialMust = requirements.some((r) => r.kind === "credential" && r.importance === "must" && r.status === "missing");
  if (missingCoreMust >= 2) score = Math.min(score, 35);
  else if (missingCoreMust === 1) score = Math.min(score, 55);
  if (missingCredentialMust) score = Math.min(score, 60);

  const sameField = ctx.roleAlignment === "same" || ctx.roleAlignment === "adjacent";
  if (sameField && got > 0) score = Math.max(score, SAME_FIELD_FLOOR);

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Honest upside: the score if every gap that is only a wording problem
 * (real experience, under-stated) were presented properly. Truly missing
 * requirements stay missing, so knock-outs still apply.
 */
export function potentialScore(
  requirements: (Scored & { gapType?: string })[],
  ctx: FitContext = {},
): number {
  return computeScore(
    requirements.map((r) => (r.gapType === "phrasing" ? { ...r, status: "met" as const } : r)),
    ctx,
  );
}

/** Gaps ordered by what hurts most: heavy missing requirements first. */
export function rankGaps<T extends Scored>(requirements: T[]): T[] {
  const lost = (r: T) => requirementWeight(r) * (1 - CREDIT[r.status]);
  return requirements.filter((r) => r.status !== "met").sort((a, b) => lost(b) - lost(a));
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "התאמה גבוהה";
  if (score >= 60) return "התאמה טובה, עם מה לחזק";
  if (score >= 40) return "התאמה חלקית";
  return "התאמה נמוכה";
}

export const ALIGNMENT_LABEL: Record<RoleAlignment, string> = {
  same: "אותו תפקיד",
  adjacent: "תפקיד קרוב",
  transferable: "מעבר מתחום אחר",
  unrelated: "תחום אחר",
};

export const SENIORITY_LABEL: Record<Seniority, string> = {
  fits: "רמת ניסיון מתאימה",
  above: "ניסיון מעל הנדרש",
  one_below: "דרגה אחת מתחת לנדרש",
  far_below: "רחוק מהניסיון הנדרש",
};

/** How many of the job's requirements the candidate already has, at least in part. */
export function coverage(requirements: Pick<Requirement, "status">[]) {
  return { covered: requirements.filter((r) => r.status !== "missing").length, total: requirements.length };
}
