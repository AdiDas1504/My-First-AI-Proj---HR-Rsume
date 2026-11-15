import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BuilderResult } from "@/components/builder-result";
import { BuilderWizard } from "@/components/builder-wizard";
import { getEntitlement } from "@/lib/billing";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "בניית קורות חיים" };

export default async function BuilderDraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string; edit?: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/builder/${id}`);
  const draft = await getStore().getDraft(user.id, id);
  if (!draft) notFound();
  const { paid, edit } = await searchParams;
  // The original resume text stays on the server.
  const { sourceResumeText: _omit, ...clientDraft } = draft;
  void _omit;

  if (draft.resume && edit !== "1") {
    const ent = await getEntitlement(user.id);
    return <BuilderResult draft={clientDraft} hasSubscription={ent.active} trialAvailable={!user.trialUsedAt} />;
  }
  return <BuilderWizard draft={clientDraft} autoGenerate={paid === "1" && draft.unlocked && !draft.resume} />;
}
