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

export type GapType = "phrasing" | "missing";

export type ScanResult = {
  jobTitle: string;
  company: string;
  score: number;
  /** Score if every gap that better wording can honestly close were closed. */
  potentialScore: number;
  verdict: string;
  strengths: string[];
  phrasingGapCount: number;
  missingGapCount: number;
  topGaps: { requirement: string; tip: string; gapType: GapType }[];
  hiddenGapCount: number;
  /** One real resume line, rewritten for the job with no new facts. */
  sampleRewrite: { before: string; after: string } | null;
};

export type ExperienceItem = {
  title: string;
  organization: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
  /** Military or national service (shown in its own section). */
  military?: boolean;
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
  /** A subscription plan, or "builder" for the one-time resume builder. */
  plan: PlanId | "builder";
  amountAgorot: number;
  status: "paid" | "refunded" | "failed";
  providerRef: string;
  createdAt: string;
};

/* ---------------- resume builder ---------------- */

export type ResumeTemplate = "classic" | "modern" | "minimal";

export type FollowUp = { question: string; answer: string };

export type BuilderRole = {
  title: string;
  organization: string;
  location: string;
  start: string;
  end: string;
  /** What the person did, in their own words. */
  description: string;
  followups: FollowUp[];
};

export type BuilderAnswers = {
  target: { role: string; field: string; seniority: string; language: "he" | "en" };
  personal: { fullName: string; phone: string; email: string; location: string; links: string };
  roles: BuilderRole[];
  education: EducationItem[];
  skills: string;
  languages: string;
  certifications: string;
  extra: string;
};

export type BuilderDraft = {
  id: string;
  userId: string;
  mode: "improve" | "scratch";
  answers: BuilderAnswers;
  /** Original resume text (improve mode). Facts may come from here or from answers. */
  sourceResumeText: string;
  /** Hebrew notes on what is weak in the original resume (improve mode). */
  diagnosis: string[];
  unlocked: boolean;
  resume: TailoredResume | null;
  /** Hebrew notes from the AI about the generated resume. */
  notes: string[];
  honestyFlags: HonestyFlag[];
  template: ResumeTemplate;
  createdAt: string;
  updatedAt: string;
};
