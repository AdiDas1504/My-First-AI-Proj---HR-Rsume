import "server-only";
import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import type { Store, FreeScanRecord, DocumentSummary } from "./types";
import type {
  OtpChallenge,
  Payment,
  Subscription,
  TailorDocument,
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
  payments: Payment[];
};

const empty = (): Data => ({
  users: [],
  otps: [],
  rateEvents: [],
  subscriptions: [],
  freeScans: [],
  usage: [],
  documents: [],
  payments: [],
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

  async findFreeScan(by: { phone: string; deviceId: string }) {
    return this.data.freeScans.find((f) => f.phone === by.phone || f.deviceId === by.deviceId) ?? null;
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

  async addPayment(payment: Payment) {
    this.data.payments.push(payment);
    this.save();
  }
  async listPayments(userId: string) {
    return this.data.payments.filter((p) => p.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
