import type {
  BuilderDraft,
  OtpChallenge,
  Payment,
  Subscription,
  TailorDocument,
  TailorSession,
  UsageKind,
  User,
} from "../types";

export type FreeScanRecord = {
  id: string;
  userId: string;
  phone: string;
  deviceId: string;
  ip: string;
  createdAt: string;
};

export type DocumentSummary = Pick<TailorDocument, "id" | "title" | "createdAt" | "updatedAt"> & {
  score: number;
  company: string;
};

export type DraftSummary = Pick<BuilderDraft, "id" | "mode" | "unlocked" | "createdAt" | "updatedAt"> & {
  title: string;
  generated: boolean;
};

/** ISO timestamps: rows last updated (or created) before these are deleted. */
export type PurgeCutoffs = {
  documents: string;
  drafts: string;
  sessions: string;
  otps: string;
  rateEvents: string;
  /** Anonymous page views and AI cost records. */
  analytics: string;
};

/** One AI call: which model, what for, tokens and cost (millionths of a dollar). */
export type AiUsageRecord = {
  model: string;
  purpose: string;
  inputTokens: number;
  outputTokens: number;
  costMicros: number;
  createdAt: string;
};

/** Anonymous page view: page name and a one-way key of the browser (no personal data). */
export type AnalyticsEvent = { name: string; visitor: string | null; createdAt: string };

/** Everything the owner dashboard needs for a period. */
export type AdminData = {
  users: { id: string; createdAt: string }[];
  payments: Pick<Payment, "userId" | "plan" | "amountAgorot" | "status" | "providerRef" | "createdAt">[];
  usage: { userId: string; kind: UsageKind; createdAt: string }[];
  events: AnalyticsEvent[];
  ai: AiUsageRecord[];
  drafts: { createdAt: string }[];
};

export type AdminUserRow = {
  id: string;
  phone: string;
  createdAt: string;
  subscription: Subscription | null;
  documents: number;
  drafts: number;
};

/** Persistence contract. Implemented by a local JSON store (demo) and Supabase. */
export interface Store {
  findUserByPhone(phone: string): Promise<User | null>;
  getUser(id: string): Promise<User | null>;
  createUser(phone: string): Promise<User>;
  markTrialUsed(userId: string): Promise<void>;
  deleteUser(userId: string): Promise<void>;

  saveOtp(challenge: OtpChallenge): Promise<void>;
  getOtp(phone: string): Promise<OtpChallenge | null>;
  incrementOtpAttempts(phone: string): Promise<void>;
  deleteOtp(phone: string): Promise<void>;

  /** Generic sliding-window counters used for rate limits. */
  addRateEvent(key: string): Promise<void>;
  countRateEvents(key: string, sinceIso: string): Promise<number>;

  getSubscription(userId: string): Promise<Subscription | null>;
  upsertSubscription(sub: Subscription): Promise<void>;

  /** phones: the hashed key, plus the plain number to find rows saved before hashing. */
  findFreeScan(by: { phones: string[]; deviceId: string }): Promise<FreeScanRecord | null>;
  addFreeScan(record: FreeScanRecord): Promise<void>;
  /** Replace a legacy plain phone / IP with their hashes. */
  rekeyFreeScan(id: string, phone: string, ip: string): Promise<void>;

  addUsage(userId: string, kind: UsageKind): Promise<void>;
  countUsage(userId: string, kind: UsageKind, sinceIso: string): Promise<number>;

  createDocument(doc: TailorDocument): Promise<void>;
  getDocument(userId: string, id: string): Promise<TailorDocument | null>;
  listDocuments(userId: string): Promise<DocumentSummary[]>;
  updateDocument(doc: TailorDocument): Promise<void>;
  deleteDocument(userId: string, id: string): Promise<void>;

  createDraft(draft: BuilderDraft): Promise<void>;
  getDraft(userId: string, id: string): Promise<BuilderDraft | null>;
  listDrafts(userId: string): Promise<DraftSummary[]>;
  updateDraft(draft: BuilderDraft): Promise<void>;
  deleteDraft(userId: string, id: string): Promise<void>;

  createSession(session: TailorSession): Promise<void>;
  getSession(userId: string, id: string): Promise<TailorSession | null>;
  updateSession(session: TailorSession): Promise<void>;

  addEvent(event: AnalyticsEvent): Promise<void>;
  addAiUsage(record: AiUsageRecord): Promise<void>;
  /** Owner dashboard: raw rows since a date (small volumes; aggregated in code). */
  adminData(sinceIso: string): Promise<AdminData>;
  /** Owner dashboard: latest users, or those whose phone contains the search. */
  adminUsers(opts: { limit: number; phoneContains?: string }): Promise<AdminUserRow[]>;
  /** Owner tool: forget free checks for these phone keys, so the person can check again. */
  deleteFreeScans(phones: string[]): Promise<number>;

  /** Delete data past its retention period (privacy policy). Returns counts. */
  purgeExpired(cutoffs: PurgeCutoffs): Promise<Record<string, number>>;

  addPayment(payment: Payment): Promise<void>;
  listPayments(userId: string): Promise<Payment[]>;
}
