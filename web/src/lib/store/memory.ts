import "server-only";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { Store, FreeScanRecord, DocumentSummary, DraftSummary, PurgeCutoffs, AiUsageRecord, AnalyticsEvent, AdminUserRow } from "./types";
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

type Data = {
  users: User[];
  otps: OtpChallenge[];
  rateEvents: { key: string; createdAt: string }[];
  subscriptions: Subscription[];
  freeScans: FreeScanRecord[];
  usage: { userId: string; kind: UsageKind; createdAt: string }[];
  documents: TailorDocument[];
  drafts: BuilderDraft[];
  sessions: TailorSession[];
  payments: Payment[];
  events: AnalyticsEvent[];
  ai: AiUsageRecord[];
};

const empty = (): Data => ({
  users: [],
  otps: [],
  rateEvents: [],
  subscriptions: [],
  freeScans: [],
  usage: [],
  documents: [],
  drafts: [],
  sessions: [],
  payments: [],
  events: [],
  ai: [],
});

/**
 * Local JSON-file store for development and demos only.
 * Not safe for concurrent production traffic — use Supabase there.
 */
export class MemoryStore implements Store {
  private file: string;
  private data: Data;

  constructor(dir = path.join(process.cwd(), ".data")) {
    this.file = path.join(dir, "db.json");
    mkdirSync(dir, { recursive: true });
    this.data = existsSync(this.file)
      ? { ...empty(), ...JSON.parse(readFileSync(this.file, "utf8")) }
      : empty();
  }

  private save() {
    writeFileSync(this.file, JSON.stringify(this.data, null, 2));
  }

  async findUserByPhone(phone: string) {
    return this.data.users.find((u) => u.phone === phone) ?? null;
  }
  async getUser(id: string) {
    return this.data.users.find((u) => u.id === id) ?? null;
  }
  async createUser(phone: string) {
    const user: User = { id: randomUUID(), phone, createdAt: new Date().toISOString(), trialUsedAt: null };
    this.data.users.push(user);
    this.save();
    return user;
  }
  async markTrialUsed(userId: string) {
    const u = this.data.users.find((x) => x.id === userId);
    if (u && !u.trialUsedAt) u.trialUsedAt = new Date().toISOString();
    this.save();
  }
  async deleteUser(userId: string) {
    const d = this.data;
    d.users = d.users.filter((u) => u.id !== userId);
    d.subscriptions = d.subscriptions.filter((s) => s.userId !== userId);
    d.documents = d.documents.filter((x) => x.userId !== userId);
    d.drafts = d.drafts.filter((x) => x.userId !== userId);
    d.sessions = d.sessions.filter((x) => x.userId !== userId);
    d.usage = d.usage.filter((x) => x.userId !== userId);
    // Free-scan and payment records are kept (anti-abuse and accounting duties),
    // but detached from the deleted account.
    d.freeScans = d.freeScans.map((f) => (f.userId === userId ? { ...f, userId: "deleted" } : f));
    this.save();
  }

  async saveOtp(c: OtpChallenge) {
    this.data.otps = this.data.otps.filter((o) => o.phone !== c.phone).concat(c);
    this.save();
  }
  async getOtp(phone: string) {
    return this.data.otps.find((o) => o.phone === phone) ?? null;
  }
  async incrementOtpAttempts(phone: string) {
    const o = this.data.otps.find((x) => x.phone === phone);
    if (o) o.attempts += 1;
    this.save();
  }
  async deleteOtp(phone: string) {
    this.data.otps = this.data.otps.filter((o) => o.phone !== phone);
    this.save();
  }

  async addRateEvent(key: string) {
    const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 2;
    this.data.rateEvents = this.data.rateEvents
      .filter((e) => Date.parse(e.createdAt) > cutoff)
      .concat({ key, createdAt: new Date().toISOString() });
    this.save();
  }
  async countRateEvents(key: string, sinceIso: string) {
    return this.data.rateEvents.filter((e) => e.key === key && e.createdAt >= sinceIso).length;
  }

  async getSubscription(userId: string) {
    return this.data.subscriptions.find((s) => s.userId === userId) ?? null;
  }
  async upsertSubscription(sub: Subscription) {
    this.data.subscriptions = this.data.subscriptions.filter((s) => s.userId !== sub.userId).concat(sub);
    this.save();
  }

  async findFreeScan(by: { phones: string[]; deviceId: string }) {
    return this.data.freeScans.find((f) => by.phones.includes(f.phone) || f.deviceId === by.deviceId) ?? null;
  }
  async rekeyFreeScan(id: string, phone: string, ip: string) {
    const f = this.data.freeScans.find((x) => x.id === id);
    if (f) Object.assign(f, { phone, ip });
    this.save();
  }
  async addFreeScan(record: FreeScanRecord) {
    this.data.freeScans.push(record);
    this.save();
  }

  async addUsage(userId: string, kind: UsageKind) {
    this.data.usage.push({ userId, kind, createdAt: new Date().toISOString() });
    this.save();
  }
  async countUsage(userId: string, kind: UsageKind, sinceIso: string) {
    return this.data.usage.filter((u) => u.userId === userId && u.kind === kind && u.createdAt >= sinceIso).length;
  }

  async createDocument(doc: TailorDocument) {
    this.data.documents.push(doc);
    this.save();
  }
  async getDocument(userId: string, id: string) {
    return this.data.documents.find((d) => d.id === id && d.userId === userId) ?? null;
  }
  async listDocuments(userId: string): Promise<DocumentSummary[]> {
    return this.data.documents
      .filter((d) => d.userId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((d) => ({
        id: d.id,
        title: d.title,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        score: d.analysis.score,
        company: d.analysis.company,
      }));
  }
  async updateDocument(doc: TailorDocument) {
    this.data.documents = this.data.documents.map((d) => (d.id === doc.id && d.userId === doc.userId ? doc : d));
    this.save();
  }
  async deleteDocument(userId: string, id: string) {
    this.data.documents = this.data.documents.filter((d) => !(d.id === id && d.userId === userId));
    this.save();
  }

  async createDraft(draft: BuilderDraft) {
    this.data.drafts.push(draft);
    this.save();
  }
  async getDraft(userId: string, id: string) {
    return this.data.drafts.find((d) => d.id === id && d.userId === userId) ?? null;
  }
  async listDrafts(userId: string): Promise<DraftSummary[]> {
    return this.data.drafts
      .filter((d) => d.userId === userId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((d) => ({
        id: d.id,
        mode: d.mode,
        unlocked: d.unlocked,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        title: d.answers.target.role || d.answers.personal.fullName || "קורות חיים",
        generated: Boolean(d.resume),
      }));
  }
  async updateDraft(draft: BuilderDraft) {
    this.data.drafts = this.data.drafts.map((d) => (d.id === draft.id && d.userId === draft.userId ? draft : d));
    this.save();
  }
  async deleteDraft(userId: string, id: string) {
    this.data.drafts = this.data.drafts.filter((d) => !(d.id === id && d.userId === userId));
    this.save();
  }

  async createSession(session: TailorSession) {
    this.data.sessions.push(session);
    this.save();
  }
  async getSession(userId: string, id: string) {
    return this.data.sessions.find((x) => x.id === id && x.userId === userId) ?? null;
  }
  async updateSession(session: TailorSession) {
    const i = this.data.sessions.findIndex((x) => x.id === session.id && x.userId === session.userId);
    if (i >= 0) this.data.sessions[i] = session;
    this.save();
  }

  async addEvent(e: AnalyticsEvent) {
    this.data.events.push(e);
    this.save();
  }
  async addAiUsage(r: AiUsageRecord) {
    this.data.ai.push(r);
    this.save();
  }
  async adminData(since: string) {
    const d = this.data;
    return {
      users: d.users.filter((u) => u.createdAt >= since).map((u) => ({ id: u.id, createdAt: u.createdAt })),
      payments: d.payments.filter((p) => p.createdAt >= since),
      usage: d.usage.filter((u) => u.createdAt >= since),
      events: d.events.filter((e) => e.createdAt >= since),
      ai: d.ai.filter((a) => a.createdAt >= since),
      drafts: d.drafts.filter((x) => x.createdAt >= since).map((x) => ({ createdAt: x.createdAt })),
    };
  }
  async adminUsers(opts: { limit: number; phoneContains?: string }): Promise<AdminUserRow[]> {
    const d = this.data;
    return d.users
      .filter((u) => !opts.phoneContains || u.phone.includes(opts.phoneContains))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, opts.limit)
      .map((u) => ({
        id: u.id,
        phone: u.phone,
        createdAt: u.createdAt,
        subscription: d.subscriptions.find((x) => x.userId === u.id) ?? null,
        documents: d.documents.filter((x) => x.userId === u.id).length,
        drafts: d.drafts.filter((x) => x.userId === u.id).length,
      }));
  }
  async deleteFreeScans(phones: string[]) {
    const before = this.data.freeScans.length;
    this.data.freeScans = this.data.freeScans.filter((f) => !phones.includes(f.phone));
    this.save();
    return before - this.data.freeScans.length;
  }

  async purgeExpired(c: PurgeCutoffs) {
    const d = this.data;
    const before = { documents: d.documents.length, drafts: d.drafts.length, sessions: d.sessions.length, otps: d.otps.length, rateEvents: d.rateEvents.length };
    d.documents = d.documents.filter((x) => x.updatedAt >= c.documents);
    d.drafts = d.drafts.filter((x) => x.updatedAt >= c.drafts);
    d.sessions = d.sessions.filter((x) => x.createdAt >= c.sessions);
    d.otps = d.otps.filter((x) => x.expiresAt >= c.otps);
    d.rateEvents = d.rateEvents.filter((x) => x.createdAt >= c.rateEvents);
    d.events = d.events.filter((x) => x.createdAt >= c.analytics);
    d.ai = d.ai.filter((x) => x.createdAt >= c.analytics);
    this.save();
    return {
      documents: before.documents - d.documents.length,
      drafts: before.drafts - d.drafts.length,
      sessions: before.sessions - d.sessions.length,
      otps: before.otps - d.otps.length,
      rateEvents: before.rateEvents - d.rateEvents.length,
    };
  }

  async addPayment(payment: Payment) {
    this.data.payments.push(payment);
    this.save();
  }
  async listPayments(userId: string) {
    return this.data.payments.filter((p) => p.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
