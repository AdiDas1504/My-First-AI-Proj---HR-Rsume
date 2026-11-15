import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Store, FreeScanRecord, DocumentSummary, DraftSummary } from "./types";
import type {
  BuilderDraft,
  OtpChallenge,
  Payment,
  Subscription,
  TailorDocument,
  UsageKind,
  User,
} from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */

const userFromRow = (r: any): User => ({
  id: r.id,
  phone: r.phone,
  createdAt: r.created_at,
  trialUsedAt: r.trial_used_at,
});

const subFromRow = (r: any): Subscription => ({
  userId: r.user_id,
  plan: r.plan,
  status: r.status,
  currentPeriodStart: r.current_period_start,
  currentPeriodEnd: r.current_period_end,
  cancelAtPeriodEnd: r.cancel_at_period_end,
  providerRef: r.provider_ref,
});

const docFromRow = (r: any): TailorDocument => ({
  id: r.id,
  userId: r.user_id,
  title: r.title,
  analysis: r.analysis,
  resume: r.resume,
  addOnlyIfTrue: r.add_only_if_true ?? [],
  changeLog: r.change_log ?? [],
  honestyFlags: r.honesty_flags ?? [],
  sourceResumeText: r.source_resume_text ?? "",
  coverLetter: r.cover_letter,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const docToRow = (d: TailorDocument) => ({
  id: d.id,
  user_id: d.userId,
  title: d.title,
  analysis: d.analysis,
  resume: d.resume,
  add_only_if_true: d.addOnlyIfTrue,
  change_log: d.changeLog,
  honesty_flags: d.honestyFlags,
  source_resume_text: d.sourceResumeText,
  cover_letter: d.coverLetter,
  created_at: d.createdAt,
  updated_at: d.updatedAt,
});

const draftFromRow = (r: any): BuilderDraft => ({
  id: r.id,
  userId: r.user_id,
  mode: r.mode,
  answers: r.answers,
  sourceResumeText: r.source_resume_text ?? "",
  diagnosis: r.diagnosis ?? [],
  unlocked: r.unlocked,
  resume: r.resume,
  notes: r.notes ?? [],
  honestyFlags: r.honesty_flags ?? [],
  template: r.template,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const draftToRow = (d: BuilderDraft) => ({
  id: d.id,
  user_id: d.userId,
  mode: d.mode,
  answers: d.answers,
  source_resume_text: d.sourceResumeText,
  diagnosis: d.diagnosis,
  unlocked: d.unlocked,
  resume: d.resume,
  notes: d.notes,
  honesty_flags: d.honestyFlags,
  template: d.template,
  created_at: d.createdAt,
  updated_at: d.updatedAt,
});

function check<T>(res: { data: T; error: any }): T {
  if (res.error) throw new Error(`Database error: ${res.error.message}`);
  return res.data;
}

/**
 * Supabase (Postgres) store. Uses the service-role key from the server only;
 * every table has RLS enabled with no public policies (see supabase/schema.sql),
 * so the browser can never read these tables directly.
 */
export class SupabaseStore implements Store {
  private db: SupabaseClient;

  constructor(url: string, serviceKey: string) {
    this.db = createClient(url, serviceKey, { auth: { persistSession: false } });
  }

  async findUserByPhone(phone: string) {
    const r = check(await this.db.from("users").select("*").eq("phone", phone).maybeSingle());
    return r ? userFromRow(r) : null;
  }
  async getUser(id: string) {
    const r = check(await this.db.from("users").select("*").eq("id", id).maybeSingle());
    return r ? userFromRow(r) : null;
  }
  async createUser(phone: string) {
    return userFromRow(check(await this.db.from("users").insert({ phone }).select("*").single()));
  }
  async markTrialUsed(userId: string) {
    check(
      await this.db
        .from("users")
        .update({ trial_used_at: new Date().toISOString() })
        .eq("id", userId)
        .is("trial_used_at", null),
    );
  }
  async deleteUser(userId: string) {
    check(await this.db.from("free_scans").update({ user_id: null }).eq("user_id", userId));
    check(await this.db.from("users").delete().eq("id", userId));
  }

  async saveOtp(c: OtpChallenge) {
    check(
      await this.db.from("otp_challenges").upsert({
        phone: c.phone,
        code_hash: c.codeHash,
        expires_at: c.expiresAt,
        attempts: c.attempts,
      }),
    );
  }
  async getOtp(phone: string) {
    const r = check(await this.db.from("otp_challenges").select("*").eq("phone", phone).maybeSingle());
    return r ? { phone: r.phone, codeHash: r.code_hash, expiresAt: r.expires_at, attempts: r.attempts } : null;
  }
  async incrementOtpAttempts(phone: string) {
    check(await this.db.rpc("increment_otp_attempts", { p_phone: phone }));
  }
  async deleteOtp(phone: string) {
    check(await this.db.from("otp_challenges").delete().eq("phone", phone));
  }

  async addRateEvent(key: string) {
    check(await this.db.from("rate_events").insert({ key }));
  }
  async countRateEvents(key: string, sinceIso: string) {
    const res = await this.db
      .from("rate_events")
      .select("id", { count: "exact", head: true })
      .eq("key", key)
      .gte("created_at", sinceIso);
    if (res.error) throw new Error(res.error.message);
    return res.count ?? 0;
  }

  async getSubscription(userId: string) {
    const r = check(await this.db.from("subscriptions").select("*").eq("user_id", userId).maybeSingle());
    return r ? subFromRow(r) : null;
  }
  async upsertSubscription(s: Subscription) {
    check(
      await this.db.from("subscriptions").upsert({
        user_id: s.userId,
        plan: s.plan,
        status: s.status,
        current_period_start: s.currentPeriodStart,
        current_period_end: s.currentPeriodEnd,
        cancel_at_period_end: s.cancelAtPeriodEnd,
        provider_ref: s.providerRef,
      }),
    );
  }

  async findFreeScan(by: { phone: string; deviceId: string }) {
    const r = check(
      await this.db
        .from("free_scans")
        .select("*")
        // Values are quoted for PostgREST; callers validate both formats first.
        .or(`phone.eq."${by.phone}",device_id.eq."${by.deviceId}"`)
        .limit(1)
        .maybeSingle(),
    );
    return r
      ? { id: r.id, userId: r.user_id, phone: r.phone, deviceId: r.device_id, ip: r.ip, createdAt: r.created_at }
      : null;
  }
  async addFreeScan(f: FreeScanRecord) {
    check(
      await this.db.from("free_scans").insert({
        id: f.id,
        user_id: f.userId,
        phone: f.phone,
        device_id: f.deviceId,
        ip: f.ip,
      }),
    );
  }

  async addUsage(userId: string, kind: UsageKind) {
    check(await this.db.from("usage_events").insert({ user_id: userId, kind }));
  }
  async countUsage(userId: string, kind: UsageKind, sinceIso: string) {
    const res = await this.db
      .from("usage_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("kind", kind)
      .gte("created_at", sinceIso);
    if (res.error) throw new Error(res.error.message);
    return res.count ?? 0;
  }

  async createDocument(doc: TailorDocument) {
    check(await this.db.from("documents").insert(docToRow(doc)));
  }
  async getDocument(userId: string, id: string) {
    const r = check(
      await this.db.from("documents").select("*").eq("id", id).eq("user_id", userId).maybeSingle(),
    );
    return r ? docFromRow(r) : null;
  }
  async listDocuments(userId: string): Promise<DocumentSummary[]> {
    const rows = check(
      await this.db
        .from("documents")
        .select("id,title,created_at,updated_at,analysis->score,analysis->company")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ) as any[];
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      score: Number(r.score ?? 0),
      company: r.company ?? "",
    }));
  }
  async updateDocument(doc: TailorDocument) {
    check(
      await this.db.from("documents").update(docToRow(doc)).eq("id", doc.id).eq("user_id", doc.userId),
    );
  }
  async deleteDocument(userId: string, id: string) {
    check(await this.db.from("documents").delete().eq("id", id).eq("user_id", userId));
  }

  async createDraft(draft: BuilderDraft) {
    check(await this.db.from("builder_drafts").insert(draftToRow(draft)));
  }
  async getDraft(userId: string, id: string) {
    const r = check(
      await this.db.from("builder_drafts").select("*").eq("id", id).eq("user_id", userId).maybeSingle(),
    );
    return r ? draftFromRow(r) : null;
  }
  async listDrafts(userId: string): Promise<DraftSummary[]> {
    const rows = check(
      await this.db
        .from("builder_drafts")
        .select("id,mode,unlocked,created_at,updated_at,resume,answers->target->>role,answers->personal->>fullName")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false }),
    ) as any[];
    return rows.map((r) => ({
      id: r.id,
      mode: r.mode,
      unlocked: r.unlocked,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      title: r.role || r.fullName || "קורות חיים",
      generated: Boolean(r.resume),
    }));
  }
  async updateDraft(draft: BuilderDraft) {
    check(
      await this.db.from("builder_drafts").update(draftToRow(draft)).eq("id", draft.id).eq("user_id", draft.userId),
    );
  }
  async deleteDraft(userId: string, id: string) {
    check(await this.db.from("builder_drafts").delete().eq("id", id).eq("user_id", userId));
  }

  async addPayment(p: Payment) {
    check(
      await this.db.from("payments").insert({
        id: p.id,
        user_id: p.userId,
        plan: p.plan,
        amount_agorot: p.amountAgorot,
        status: p.status,
        provider_ref: p.providerRef,
      }),
    );
  }
  async listPayments(userId: string) {
    const rows = check(
      await this.db.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ) as any[];
    return rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      plan: r.plan,
      amountAgorot: r.amount_agorot,
      status: r.status,
      providerRef: r.provider_ref,
      createdAt: r.created_at,
    }));
  }
}
