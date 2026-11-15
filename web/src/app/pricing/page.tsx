import type { Metadata } from "next";
import { PricingCards } from "@/components/pricing-cards";
import Link from "next/link";
import { Faq } from "@/components/faq";
import { BUILDER_PRODUCT, formatPrice } from "@/lib/plans";

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
      <section aria-labelledby="builder-price" className="card mt-8 flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-9">
        <div>
          <p className="eyebrow">מוצר נפרד</p>
          <h2 id="builder-price" className="mt-1 text-3xl">
            {BUILDER_PRODUCT.name}
          </h2>
          <p className="mt-2 max-w-xl text-muted">{BUILDER_PRODUCT.blurb} הראיון חינם, ומשלמים רק כשיוצרים.</p>
        </div>
        <div className="shrink-0 text-start md:text-end">
          <p className="font-display text-4xl font-bold text-forest">{formatPrice(BUILDER_PRODUCT.priceAgorot)}</p>
          <p className="text-sm text-muted">חד-פעמי, בלי מנוי</p>
          <Link href="/builder" className="btn btn-secondary mt-3">
            לבניית קורות חיים
          </Link>
        </div>
      </section>
      <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_2fr]">
        <h2 className="text-3xl md:text-4xl">שאלות על התשלום</h2>
        <Faq />
      </div>
    </div>
  );
}
