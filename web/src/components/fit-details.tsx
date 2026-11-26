import type { Analysis, RequirementKind, RoleInsight } from "@/lib/types";
import { ALIGNMENT_LABEL, SENIORITY_LABEL } from "@/lib/scoring";

const STATUS = {
  met: { label: "יש", cls: "bg-mint text-forest" },
  partial: { label: "חלקי", cls: "bg-amber-soft text-amber-ink" },
  missing: { label: "חסר", cls: "bg-danger-soft text-danger" },
} as const;

const KIND: Record<RequirementKind, string> = {
  core: "ליבת התפקיד",
  skill: "ידע מקצועי",
  credential: "השכלה / הסמכה",
  soft: "כישור אישי",
};

const INSIGHT_STATUS: Record<RoleInsight["resumeStatus"], { label: string; cls: string }> = {
  shown: { label: "מופיע אצלך", cls: "bg-mint text-forest" },
  hidden: { label: "קיים אבל לא בולט", cls: "bg-amber-soft text-amber-ink" },
  absent: { label: "לא מופיע", cls: "bg-danger-soft text-danger" },
};

export function FitChips({ analysis }: { analysis: Analysis }) {
  if (!analysis.roleAlignment && !analysis.seniority) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {analysis.roleAlignment && <span className="chip bg-paper-2">{ALIGNMENT_LABEL[analysis.roleAlignment]}</span>}
      {analysis.seniority && <span className="chip bg-paper-2">{SENIORITY_LABEL[analysis.seniority]}</span>}
    </div>
  );
}

/** What employers look for in this role, from the ad and beyond it. */
export function RoleInsights({ insights }: { insights: RoleInsight[] }) {
  if (!insights.length) return null;
  const beyond = insights.filter((i) => i.source === "role").length;
  return (
    <section className="card p-6 md:p-7" aria-labelledby="insights-title">
      <h2 id="insights-title" className="text-2xl">מה בודקים בתפקיד כזה</h2>
      <p className="mt-1 text-muted">
        מה שכתוב במודעה ומה שמנהלי גיוס לתפקידים כאלה בודקים בדרך כלל
        {beyond > 0 ? ` (${beyond} נושאים שלא כתובים במודעה)` : ""}.
      </p>
      <ul className="mt-5 grid gap-3 md:grid-cols-2">
        {insights.map((i, n) => (
          <li key={n} className="rounded-xl bg-paper-2 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold" dir="auto">{i.topic}</p>
              <span className={`chip ${INSIGHT_STATUS[i.resumeStatus].cls}`}>{INSIGHT_STATUS[i.resumeStatus].label}</span>
            </div>
            <p className="mt-1 text-sm text-muted">{i.source === "posting" ? "מופיע במודעה" : "נדרש בדרך כלל בתפקיד הזה, גם אם לא כתוב"}</p>
            {i.why && <p className="mt-2 text-[0.95rem]">{i.why}</p>}
            {i.evidence && (
              <p className="mt-2 text-sm text-muted" dir="auto">
                מתוך קורות החיים: “{i.evidence}”
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Every requirement, how it was judged, and the exact line it rests on. */
export function RequirementsTable({ analysis }: { analysis: Analysis }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-right">
        <caption className="px-6 pt-6 text-start">
          <span className="block font-display text-2xl font-bold">דרישות המשרה</span>
          {analysis.scoreVersion === 2 && (
            <span className="mt-1 block text-[0.95rem] font-normal text-muted">
              הציון מחושב מהדרישות האלה: דרישות ליבה וחובה שוקלות יותר, התאמה חלקית שווה פחות מחצי וחסר בדרישת ליבה מגביל את הציון. כל ״יש״
              נשען על שורה אמיתית מקורות החיים.
            </span>
          )}
        </caption>
        <thead>
          <tr className="border-b border-line text-sm text-muted">
            <th scope="col" className="px-6 py-3 font-semibold">דרישה</th>
            <th scope="col" className="px-3 py-3 font-semibold">סוג</th>
            <th scope="col" className="px-3 py-3 font-semibold">מצב</th>
            <th scope="col" className="hidden px-6 py-3 font-semibold md:table-cell">מה מצאנו בקורות החיים</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {analysis.requirements.map((r, i) => (
            <tr key={i} className="align-top">
              <td className="px-6 py-4" dir="auto">{r.text}</td>
              <td className="px-3 py-4 text-sm">
                <span className="whitespace-nowrap">{r.importance === "must" ? "חובה" : "יתרון"}</span>
                {r.kind && <span className="block text-muted">{KIND[r.kind]}</span>}
              </td>
              <td className="px-3 py-4">
                <span className={`chip ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
              </td>
              <td className="hidden px-6 py-4 text-muted md:table-cell" dir="auto">
                {r.evidence ? `“${r.evidence}”` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
