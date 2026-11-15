import { anyDemo, demo } from "@/lib/config";

export function DemoBanner() {
  if (!anyDemo) return null;
  const parts = [
    demo.ai && "ניתוח בלי AI",
    demo.sms && "קוד הכניסה מוצג על המסך",
    demo.payments && "תשלום מדומה",
    demo.db && "מסד נתונים מקומי",
  ].filter(Boolean);
  return (
    <div role="note" className="no-print bg-amber-soft text-amber-ink">
      <p className="container-page py-2 text-center text-sm">
        <strong>מצב הדגמה:</strong> {parts.join(" · ")}. אף אחד לא מחויב בכסף.
      </p>
    </div>
  );
}
