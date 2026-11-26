import type { Metadata } from "next";
import Link from "next/link";
import { AdminGrantScan } from "@/components/admin-grant-scan";
import { requireAdminPage } from "@/lib/admin";
import { buildStats, ils, ilsFromMicros } from "@/lib/admin-stats";
import { config, demo } from "@/lib/config";
import { formatIsraeliMobile } from "@/lib/phone";
import { getStore } from "@/lib/store";

export const metadata: Metadata = { title: "לוח בקרה", robots: { index: false, follow: false } };

const PERIODS = [7, 30, 90] as const;
const PLAN_LABEL: Record<string, string> = { trial: "שבוע היכרות", monthly: "חודשי", quarterly: "רבעוני" };
const STATUS_LABEL: Record<string, string> = { active: "פעיל", canceled: "בוטל", expired: "הסתיים" };
const fmtDate = (iso: string) => new Intl.DateTimeFormat("he-IL", { timeZone: "Asia/Jerusalem", day: "numeric", month: "numeric", year: "2-digit" }).format(new Date(iso));
const fmtDay = (day: string) => {
  const [, m, d] = day.split("-");
  return `${Number(d)}.${Number(m)}`;
};

/** Reads the period's raw rows (outside render, so the clock read is not part of rendering). */
async function loadDashboard(days: number, q: string) {
  const now = new Date();
  const since = new Date(now.getTime() - days * 86_400_000).toISOString();
  const store = getStore();
  const [data, users] = await Promise.all([store.adminData(since), store.adminUsers({ limit: 50, phoneContains: q || undefined })]);
  return { data, users, now };
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string; q?: string }> }) {
  await requireAdminPage();
  const sp = await searchParams;
  const days = PERIODS.find((p) => String(p) === sp.days) ?? 30;
  const q = (sp.q ?? "").replace(/[^\d]/g, "").replace(/^0/, "").slice(0, 12);
  const { data, users, now } = await loadDashboard(days, q);
  const { totals, funnel, daily, aiByPurpose } = buildStats(data, { days, now });
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.value));

  const cards = [
    { label: "מבקרים", value: totals.visitors.toLocaleString("he-IL"), note: "דפדפנים שונים" },
    { label: "נרשמו", value: totals.signups.toLocaleString("he-IL"), note: "אימתו טלפון" },
    { label: "בדיקות חינמיות", value: totals.scans.toLocaleString("he-IL"), note: `${totals.scanUsers} אנשים` },
    { label: "שבועות היכרות", value: totals.trials.toLocaleString("he-IL"), note: "₪19.90" },
    { label: "תשלומי מנוי", value: totals.subscriptions.toLocaleString("he-IL"), note: "חודשי ורבעוני" },
    { label: "בונה קורות חיים", value: totals.builder.toLocaleString("he-IL"), note: "רכישות ₪49" },
    { label: "הכנסות", value: ils(totals.revenueAgorot), note: demo.payments ? "הדגמה, לא כסף אמיתי" : "כולל מע״מ אם חל" },
    { label: "עלות AI", value: ilsFromMicros(totals.aiCostMicros), note: "לפי השימוש בפועל" },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl">לוח בקרה</h1>
          <p className="mt-2 text-muted">רק את/ה רואה את העמוד הזה.</p>
        </div>
        <nav aria-label="תקופה" className="flex gap-2">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/admin?days=${p}`}
              aria-current={p === days ? "page" : undefined}
              className={`chip px-4 py-2 ${p === days ? "bg-forest text-white" : "bg-paper-2"}`}
            >
              {p} ימים
            </Link>
          ))}
        </nav>
      </div>

      <ul className="mt-6 flex flex-wrap gap-2 text-sm" aria-label="מצב האתר">
        <li className={`chip ${config.freeScanLimits ? "bg-mint text-forest" : "bg-amber-soft text-amber-ink"}`}>
          {config.freeScanLimits ? "הגבלת בדיקה חינמית: פעילה" : "בדיקה חינמית: פתוחה לכולם (זמני)"}
        </li>
        <li className={`chip ${demo.payments ? "bg-amber-soft text-amber-ink" : "bg-mint text-forest"}`}>
          {demo.payments ? "תשלומים: הדגמה" : "תשלומים: אמיתיים"}
        </li>
        <li className={`chip ${demo.sms ? "bg-amber-soft text-amber-ink" : "bg-mint text-forest"}`}>
          {demo.sms ? "SMS: הדגמה (קוד על המסך)" : "SMS: אמיתי"}
        </li>
      </ul>

      {/* ---------- key numbers ---------- */}
      <section aria-labelledby="kpi" className="mt-8">
        <h2 id="kpi" className="sr-only">מספרים עיקריים, {days} ימים אחרונים</h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((c) => (
            <li key={c.label} className="card p-5">
              <p className="text-sm font-semibold text-muted">{c.label}</p>
              <p className="mt-1 font-display text-3xl font-bold">{c.value}</p>
              <p className="mt-1 text-sm text-muted">{c.note}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- funnel ---------- */}
      <section aria-labelledby="funnel" className="card mt-6 p-6 md:p-7">
        <h2 id="funnel" className="text-2xl">משפך ההמרה</h2>
        <p className="mt-1 text-muted">כמה אנשים עברו כל שלב, ואיזה אחוז מהשלב הקודם. כאן רואים איפה אנשים נוטשים.</p>
        <ol className="mt-5 space-y-3">
          {funnel.map((f) => (
            <li key={f.label} className="grid grid-cols-[9rem_1fr_6rem] items-center gap-3 md:grid-cols-[12rem_1fr_7rem]">
              <span className="font-semibold">{f.label}</span>
              <span className="h-7 overflow-hidden rounded-lg bg-paper-2" aria-hidden="true">
                <span className="block h-full rounded-lg bg-forest" style={{ width: `${Math.max(2, (f.value / maxFunnel) * 100)}%` }} />
              </span>
              <span className="text-start tabular-nums">
                {f.value.toLocaleString("he-IL")}
                {f.rate !== null && <span className="text-muted"> · {f.rate}%</span>}
              </span>
            </li>
          ))}
        </ol>
        {totals.visitors === 0 && (
          <p className="mt-4 text-sm text-muted">מדידת המבקרים התחילה עכשיו, אז המספרים יתמלאו מהיום והלאה.</p>
        )}
      </section>

      {/* ---------- by day ---------- */}
      <section aria-labelledby="daily" className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-right">
          <caption className="px-6 pt-6 text-start">
            <span className="block font-display text-2xl font-bold">לפי יום</span>
            <span className="block text-[0.95rem] font-normal text-muted">{daily.length} הימים האחרונים</span>
          </caption>
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              {["יום", "מבקרים", "נרשמו", "בדיקות", "היכרות", "תשלומים", "הכנסות", "עלות AI"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {[...daily].reverse().map((d) => (
              <tr key={d.day}>
                <th scope="row" className="px-4 py-2.5 font-semibold">{fmtDay(d.day)}</th>
                <td className="px-4 py-2.5">{d.visitors}</td>
                <td className="px-4 py-2.5">{d.signups}</td>
                <td className="px-4 py-2.5">{d.scans}</td>
                <td className="px-4 py-2.5">{d.trials}</td>
                <td className="px-4 py-2.5">{d.paid}</td>
                <td className="px-4 py-2.5">{ils(d.revenueAgorot)}</td>
                <td className="px-4 py-2.5">{ilsFromMicros(d.aiCostMicros)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ---------- AI cost ---------- */}
      <section aria-labelledby="ai" className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-right">
          <caption className="px-6 pt-6 text-start">
            <span className="block font-display text-2xl font-bold">עלות AI לפי פעולה</span>
            <span className="block text-[0.95rem] font-normal text-muted">
              לפי כמות הטקסט שנשלחה וחזרה בכל קריאה ומחירון Anthropic, בהמרה של בערך 3.7 ₪ לדולר.
            </span>
          </caption>
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              <th scope="col" className="px-4 py-3 font-semibold">פעולה</th>
              <th scope="col" className="px-4 py-3 font-semibold">קריאות</th>
              <th scope="col" className="px-4 py-3 font-semibold">ממוצע לקריאה</th>
              <th scope="col" className="px-4 py-3 font-semibold">סה״כ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line tabular-nums">
            {aiByPurpose.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-muted">עוד אין נתונים בתקופה הזו. הם מתחילים להיאסף מעכשיו.</td>
              </tr>
            ) : (
              aiByPurpose.map((a) => (
                <tr key={a.purpose}>
                  <th scope="row" className="px-4 py-2.5 font-semibold">{a.label}</th>
                  <td className="px-4 py-2.5">{a.calls}</td>
                  <td className="px-4 py-2.5">{ilsFromMicros(a.avgMicros)}</td>
                  <td className="px-4 py-2.5">{ilsFromMicros(a.costMicros)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* ---------- users ---------- */}
      <section aria-labelledby="users" className="card mt-6 p-6 md:p-7">
        <h2 id="users" className="text-2xl">משתמשים</h2>
        <form className="mt-4 flex flex-wrap items-end gap-3" action="/admin">
          <input type="hidden" name="days" value={days} />
          <div>
            <label htmlFor="q" className="block text-sm font-semibold">חיפוש לפי טלפון</label>
            <input id="q" name="q" defaultValue={sp.q ?? ""} className="input mt-1 w-56" inputMode="tel" dir="ltr" placeholder="למשל 4567" />
          </div>
          <button className="btn btn-secondary">חיפוש</button>
          {q && (
            <Link href={`/admin?days=${days}`} className="link text-sm">
              ניקוי
            </Link>
          )}
        </form>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[620px] text-right">
            <caption className="sr-only">{q ? "תוצאות חיפוש" : "50 המשתמשים האחרונים"}</caption>
            <thead>
              <tr className="border-b border-line text-sm text-muted">
                <th scope="col" className="px-3 py-3 font-semibold">טלפון</th>
                <th scope="col" className="px-3 py-3 font-semibold">הצטרפות</th>
                <th scope="col" className="px-3 py-3 font-semibold">מנוי</th>
                <th scope="col" className="px-3 py-3 font-semibold">גרסאות</th>
                <th scope="col" className="px-3 py-3 font-semibold">בונה</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-4 text-muted">לא נמצאו משתמשים.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-3 py-2.5 tabular-nums" dir="ltr">{formatIsraeliMobile(u.phone)}</td>
                    <td className="px-3 py-2.5">{fmtDate(u.createdAt)}</td>
                    <td className="px-3 py-2.5">
                      {u.subscription
                        ? `${PLAN_LABEL[u.subscription.plan] ?? u.subscription.plan} · ${STATUS_LABEL[u.subscription.status] ?? u.subscription.status}`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">{u.documents}</td>
                    <td className="px-3 py-2.5">{u.drafts}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 font-sans text-lg font-bold">בדיקה חינמית נוספת</h3>
        <p className="mt-1 text-muted">
          כשהגבלת הבדיקה החינמית פעילה, אפשר לתת כאן למספר מסוים עוד בדיקה אחת. אחריה הוא נחסם שוב.
        </p>
        <div className="mt-3">
          <AdminGrantScan />
        </div>
      </section>
    </div>
  );
}
