import type { Metadata } from "next";
import { PricingCards } from "@/components/pricing-cards";
import { Faq } from "@/components/faq";

export const metadata: Metadata = {
  title: "מחירים",
  description: "שבוע היכרות ב-19.90 ₪, ואחריו 49.90 ₪ לחודש. בלי התחייבות, ביטול בלחיצה.",
};

export default function PricingPage() {
  return (
    <div className="container-page py-14 md:py-20">
      <p className="eyebrow">מחירים</p>
      <h1 className="mt-2 max-w-3xl text-4xl md:text-6xl">מחיר אחד פשוט. בלי הפתעות.</h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        כל המחירים בשקלים וכוללים מע״מ. אפשר להתחיל בבדיקת התאמה חינם, ולהמשיך למנוי רק אם זה באמת עוזר לכם.
      </p>
      <div className="mt-12">
        <PricingCards />
      </div>
      <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <h2 className="text-3xl md:text-4xl">שאלות על התשלום</h2>
        <Faq />
      </div>
    </div>
  );
}
