import type { Metadata } from "next";
import Link from "next/link";
import { BuilderStart } from "@/components/builder-start";
import { LoginForm } from "@/components/login-form";
import { BUILDER_PRODUCT, formatPrice } from "@/lib/plans";
import { getCurrentUser } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "בניית קורות חיים מקצועיים",
  description: "עונים על כמה שאלות פשוטות ומקבלים קורות חיים מקצועיים בעברית או באנגלית. משפרים קורות חיים קיימים או בונים מאפס.",
};

const dateFmt = new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long" });

const STEPS = [
  { n: "1", title: "עונים על שאלות", text: "במילים שלכם, בלי לנסח יפה. אנחנו שואלים שאלות המשך שמוציאות את ההישגים." },
  { n: "2", title: "אנחנו כותבים", text: "ה-AI הופך את התשובות לקורות חיים מקצועיים, רק מהעובדות שנתתם." },
  { n: "3", title: "בוחרים עיצוב ומורידים", text: "3 תבניות, עברית או אנגלית, Word ו-PDF. אפשר לערוך הכול." },
];

export default async function BuilderPage() {
  const user = await getCurrentUser();
  const drafts = user ? await getStore().listDrafts(user.id) : [];

  return (
    <div className="container-page py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        <div>
          <p className="eyebrow">בניית קורות חיים</p>
          <h1 className="mt-2 text-4xl md:text-5xl">
            קורות חיים מקצועיים,
            <br />
            <span className="text-forest">מהניסיון האמיתי שלך.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            יש לך קורות חיים שלא מביאים ראיונות? או שאין לך בכלל? עונים על כמה שאלות פשוטות, ואנחנו בונים קורות חיים שנראים ונשמעים מקצועיים, בלי להמציא אף מילה.
          </p>
          <ol className="mt-8 space-y-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-forest font-display font-bold text-white">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 rounded-2xl bg-paper-2 px-5 py-4">
            <strong>{formatPrice(BUILDER_PRODUCT.priceAgorot)}, תשלום חד-פעמי.</strong> משלמים רק בסוף, כשמחליטים ליצור את קורות החיים. הראיון עצמו חינם.
          </p>
        </div>

        <div>
          {user ? (
            <BuilderStart />
          ) : (
            <div>
              <h2 className="mb-4 font-sans text-xl font-bold">אימות קצר ומתחילים</h2>
              <LoginForm next="/builder" />
            </div>
          )}

          {drafts.length > 0 && (
            <section aria-labelledby="drafts-title" className="mt-8">
              <h2 id="drafts-title" className="font-sans text-lg font-bold">
                קורות החיים שלך
              </h2>
              <ul className="mt-3 space-y-2">
                {drafts.map((d) => (
                  <li key={d.id}>
                    <Link href={`/builder/${d.id}`} className="card flex items-center justify-between gap-4 px-5 py-4 hover:shadow-lift">
                      <span className="font-semibold">{d.title}</span>
                      <span className="text-sm text-muted">
                        {d.generated ? "מוכן" : "בתהליך"} · {dateFmt.format(new Date(d.updatedAt))}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
