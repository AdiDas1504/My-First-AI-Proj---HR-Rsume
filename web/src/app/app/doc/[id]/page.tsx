import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DocWorkspace } from "@/components/doc-workspace";
import { getEntitlement } from "@/lib/billing";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "גרסה מותאמת" };

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/app/doc/${id}`);
  const doc = await getStore().getDocument(user.id, id);
  if (!doc) notFound();
  const ent = await getEntitlement(user.id);
  // The original text stays on the server; the client only needs the result.
  const { sourceResumeText: _omit, ...clientDoc } = doc;
  void _omit;
  return <DocWorkspace doc={clientDoc} canGenerate={ent.active} />;
}
