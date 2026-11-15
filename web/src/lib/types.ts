import type { PlanId } from "./plans";

export type User = {
  id: string;
  phone: string;
  createdAt: string;
  trialUsedAt: string | null;
};

export type SubscriptionStatus = "active" | "canceled" | "expired";

export type Subscription = {
  userId: string;
  plan: PlanId;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  providerRef: string | null;
};

export type OtpChallenge = {
  phone: string;
  codeHash: string;
  expiresAt: string;
  attempts: number;
};

export type UsageKind = "scan" | "tailor" | "cover";

export type RequirementStatus = "met" | "partial" | "missing";

export type Requirement = {
  text: string;
  importance: "must" | "nice";
  status: RequirementStatus;
  /** Short quote or paraphrase from the resume that supports the status. */
  evidence: string;
};

export type Analysis = {
  jobTitle: string;
  company: string;
  language: "he" | "en";
  score: number;
  summary: string;
  requirements: Requirement[];
  strengths: string[];
};

export type ScanResult = {
  jobTitle: string;
  company: string;
  score: number;
  verdict: string;
  topGaps: { requirement: string; tip: string }[];
  hiddenGapCount: number;
};

export type ExperienceItem = {
  title: string;
  organization: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
};

export type EducationItem = {
  degree: string;
  institution: string;
  start: string;
  end: string;
  details: string;
};

export type TailoredResume = {
  language: "he" | "en";
  fullName: string;
  headline: string;
  contact: { email: string; phone: string; location: string; links: string[] };
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  languages: string[];
  certifications: string[];
};

export type AddOnlyIfTrue = { requirement: string; suggestion: string };

export type HonestyFlag = { field: string; value: string; reason: string };

export type TailorDocument = {
  id: string;
  userId: string;
  title: string;
  analysis: Analysis;
  resume: TailoredResume;
  addOnlyIfTrue: AddOnlyIfTrue[];
  changeLog: string[];
  honestyFlags: HonestyFlag[];
  /** Original resume text, kept so the honesty check can run again after edits. */
  sourceResumeText: string;
  coverLetter: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Payment = {
  id: string;
  userId: string;
  plan: PlanId;
  amountAgorot: number;
  status: "paid" | "refunded" | "failed";
  providerRef: string;
  createdAt: string;
};
