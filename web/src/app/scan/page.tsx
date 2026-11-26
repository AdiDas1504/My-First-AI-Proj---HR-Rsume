import { config } from "@/lib/config";
import { privateKey } from "@/lib/privacy";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { ScanForm } from "@/components/scan-form";
import { getEntitlement } from "@/lib/billing";
import { getCurrentUser, getDeviceId } from "@/lib/session";
import { getStore } from "@/lib/store";

export const metadata: Metadata = {
  title: "בדיקת התאמה חינם",
  description: "בודקים בחינם כמה קורות החיים שלכם מתאימים למשרה ומה שלושת הפערים החשובים לסגור.",
};

export default async function ScanPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="container-page grid gap-12 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">בדיקת התאמה חינם</p>
          <h1 className="mt-2 text-4xl md:text-5xl">כמה קורות החיים שלך מתאימים למשרה?</h1>
          <p className="mt-5 text-lg text-muted">תוך דקה תקבלו:</p>
          <ul className="mt-3 space-y-2 text-lg">
            <li>• ציון התאמה מ-0 עד 100</li>
            <li>• סיכום קצר וכן של ההתאמה</li>
            <li>• 3 הפערים החשובים ביותר, עם טיפ לכל אחד</li>
          </ul>
          <p className="mt-6 text-muted">
            הבדיקה החינמית ניתנת פעם אחת לכל משתמש. אימות קצר ב-SMS שומר עליה הוגנת לכולם.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md">
          <h2 className="mb-4 font-sans text-xl font-bold">אימות קצר ומתחילים</h2>
          <LoginForm next="/scan" />
        </div>
      </div>
    );
  }

  const ent = await getEntitlement(user.id);
  const deviceId = await getDeviceId();
  const used = config.freeScanLimits && !ent.active && (await getStore().findFreeScan({ phones: [privateKey(user.phone), user.phone], deviceId: deviceId ?? "none" }));
  const trialAvailable = !user.trialUsedAt;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">{ent.active ? "בדיקת התאמה מהירה" : "בדיקת התאמה חינם"}</p>
        <h1 className="mt-2 text-4xl md:text-5xl">כמה קורות החיים שלך מתאימים למשרה?</h1>
        {used ? (
          <div className="card mt-8 p-8">
            <h2 className="text-2xl">הבדיקה החינמית כבר נוצלה</h2>
            <p className="mt-3 text-lg text-muted">
              כדי לראות את כל הפערים ולקבל קורות חיים מותאמים מוכנים לשליחה, אפשר להמשיך במנוי.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={trialAvailable ? "/checkout?plan=trial" : "/checkout?plan=monthly"} className="btn btn-primary">
                {trialAvailable ? "שבוע היכרות ב-19.90 ₪" : "למנוי החודשי"}
              </Link>
              <Link href="/pricing" className="btn btn-secondary">
                כל המסלולים
              </Link>
            </div>
          </div>
        ) : (
          <ScanForm subscriber={ent.active} trialAvailable={trialAvailable} />
        )}
      </div>
    </div>
  );
}
