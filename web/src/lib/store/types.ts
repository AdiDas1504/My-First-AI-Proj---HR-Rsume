import type {
  OtpChallenge,
  Payment,
  Subscription,
  TailorDocument,
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

  findFreeScan(by: { phone: string; deviceId: string }): Promise<FreeScanRecord | null>;
  addFreeScan(record: FreeScanRecord): Promise<void>;

  addUsage(userId: string, kind: UsageKind): Promise<void>;
  countUsage(userId: string, kind: UsageKind, sinceIso: string): Promise<number>;

  createDocument(doc: TailorDocument): Promise<void>;
  getDocument(userId: string, id: string): Promise<TailorDocument | null>;
  listDocuments(userId: string): Promise<DocumentSummary[]>;
  updateDocument(doc: TailorDocument): Promise<void>;
  deleteDocument(userId: string, id: string): Promise<void>;

  addPayment(payment: Payment): Promise<void>;
  listPayments(userId: string): Promise<Payment[]>;
}
