import type { Requirement } from "./types";

/**
 * Match score from the requirement list, so the number is consistent and
 * explainable: must-haves weigh twice as much, partial matches count half.
 */
export function computeScore(requirements: Pick<Requirement, "importance" | "status">[]): number {
  if (requirements.length === 0) return 0;
  let total = 0;
  let got = 0;
  for (const r of requirements) {
    const weight = r.importance === "must" ? 2 : 1;
    total += weight;
    got += weight * (r.status === "met" ? 1 : r.status === "partial" ? 0.5 : 0);
  }
  return Math.round((got / total) * 100);
}

/**
 * Honest upside: the score if every gap that is only a wording problem
 * (real experience, under-stated) were presented properly. Truly missing
 * requirements stay missing.
 */
export function potentialScore(
  requirements: (Pick<Requirement, "importance" | "status"> & { gapType?: string })[],
): number {
  return computeScore(
    requirements.map((r) => (r.gapType === "phrasing" ? { ...r, status: "met" as const } : r)),
  );
}

/** Gaps ordered by what hurts most: missing must-haves first. */
export function rankGaps<T extends Pick<Requirement, "importance" | "status">>(requirements: T[]): T[] {
  const rank = (r: T) => (r.importance === "must" ? 0 : 2) + (r.status === "missing" ? 0 : 1);
  return requirements.filter((r) => r.status !== "met").sort((a, b) => rank(a) - rank(b));
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "התאמה גבוהה";
  if (score >= 60) return "התאמה טובה, עם מה לחזק";
  if (score >= 40) return "התאמה חלקית";
  return "התאמה נמוכה";
}
