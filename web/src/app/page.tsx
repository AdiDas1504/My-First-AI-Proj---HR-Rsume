import Image from "next/image";
import Link from "next/link";
import { PricingCards } from "@/components/pricing-cards";
import { Faq } from "@/components/faq";

const STEPS = [
  {
    n: "1",
    title: "מעלים קורות חיים",
    text: "קובץ PDF או Word, כמו שהוא. בלי למלא טפסים ובלי להעתיק שום דבר.",
  },
  {
    n: "2",
    title: "מוסיפים את המשרה",
    text: "קישור למודעה, הטקסט שלה, קובץ או צילום מסך מהטלפון. מכל אתר דרושים.",
  },
  {
    n: "3",
    title: "עונים ומקבלים גרסה מותאמת",
    text: "ציון התאמה, כמה שאלות קצרות על מה שחשוב בתפקיד וקורות חיים מוכנים לשליחה.",
  },
];

const FEATURES = [
  {
    title: "ציון התאמה שאפשר להבין",
    text: "כל דרישה במשרה נבדקת מול קורות החיים: יש, חלקי או חסר, עם הציטוט שמוכיח את זה. הציון נגזר מהדרישות, לא מקופסה שחורה.",
    img: "/img/match.webp",
    alt: "",
  },
  {
    title: "שכתוב שלא ממציא",
    text: "אנחנו מסדרים, מנסחים ומדגישים את מה שבאמת עשיתם, בשפה של המשרה. כל מספר, ארגון או מיומנות שלא מופיעים במקור מסומנים לבדיקה שלכם.",
    img: "/img/honesty.webp",
    alt: "",
  },
  {
    title: "מוכן לשליחה בעברית ובאנגלית",
    text: "Word נקי שמערכות סינון קוראות, PDF מעוצב להדפסה ומכתב מקדים קצר. עברית מימין לשמאל כמו שצריך.",
    img: "/img/export.webp",
    alt: "",
  },
];

export default function Home() {
  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="container-page grid items-center gap-10 pb-16 pt-10 md:pb-24 md:pt-16 lg:grid-cols-[1.05fr_1fr]">
          <div className="animate-rise">
            <p className="eyebrow">
              <span aria-hidden="true" className="inline-block size-2 rounded-full bg-amber" />
              לכל מי שמחפש עבודה בישראל
            </p>
            <h1 className="mt-4 text-[2.6rem] font-bold leading-[1.08] text-ink sm:text-6xl">
              קורות החיים שלך
              <br />
              <span className="text-forest">מותאמים לכל משרה</span>
              <br />
              בלי להמציא אף מילה
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">
              מעלים קורות חיים ומודעת דרושים ומקבלים תוך דקה ציון התאמה ואת הפערים שחשוב לסגור. משם ממשיכים לגרסה מותאמת מוכנה לשליחה ב-Word או PDF.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/scan" className="btn btn-primary px-7 text-lg">
                בדיקת התאמה חינם
              </Link>
              <Link href="#how" className="btn btn-secondary px-6 text-lg">
                איך זה עובד
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted">בלי כרטיס אשראי לבדיקה. אימות קצר בטלפון וזהו.</p>
          </div>

          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-line">
              <Image
                src="/img/hero.webp"
                alt="איור: שורות מסומנות בקורות חיים מחוברות לדרישות של מודעת דרושים"
                width={1600}
                height={1195}
                priority
                className="decorative h-auto w-full"
                sizes="(min-width: 1024px) 560px, 100vw"
              />
            </div>
            <div className="card absolute -bottom-6 right-4 flex items-center gap-4 px-5 py-4 md:right-8" aria-hidden="true">
              <div className="relative size-14">
                <svg viewBox="0 0 36 36" className="size-14 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-mint)" strokeWidth="4" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-forest)" strokeWidth="4" strokeDasharray="82 100" strokeLinecap="round" pathLength="100" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-bold text-forest">82</span>
              </div>
              <div>
                <p className="font-semibold">התאמה גבוהה</p>
                <p className="text-sm text-muted">2 פערים לסגור</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- trust strip ---------- */}
      <section aria-label="למה JobFit" className="border-y border-line bg-paper-2">
        <ul className="container-page grid gap-6 py-8 text-center sm:grid-cols-3">
          <li>
            <p className="font-display text-2xl font-bold text-forest">0 המצאות</p>
            <p className="text-muted">רק מה שבאמת כתוב אצלך</p>
          </li>
          <li>
            <p className="font-display text-2xl font-bold text-forest">עברית ואנגלית</p>
            <p className="text-muted">כולל ימין לשמאל כמו שצריך</p>
          </li>
          <li>
            <p className="font-display text-2xl font-bold text-forest">Word ו-PDF</p>
            <p className="text-muted">מוכן למערכות סינון ולהדפסה</p>
          </li>
        </ul>
      </section>

      {/* ---------- how ---------- */}
      <section id="how" aria-labelledby="how-title" className="scroll-mt-20 py-20 md:py-28">
        <div className="container-page">
          <p className="eyebrow">איך זה עובד</p>
          <h2 id="how-title" className="mt-2 max-w-2xl text-4xl md:text-5xl">
            שלושה צעדים פשוטים לקורות חיים שמדברים בשפה של המשרה
          </h2>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="card p-7">
                <span aria-hidden="true" className="flex size-11 items-center justify-center rounded-full bg-forest font-display text-xl font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-5 text-2xl">{s.title}</h3>
                <p className="mt-2 text-muted">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- features ---------- */}
      <section id="features" aria-labelledby="features-title" className="scroll-mt-20 bg-paper-2 py-20 md:py-28">
        <div className="container-page">
          <p className="eyebrow">מה מקבלים</p>
          <h2 id="features-title" className="mt-2 max-w-2xl text-4xl md:text-5xl">
            לא עוד תבנית יפה אלא התאמה אמיתית למשרה
          </h2>
          <div className="mt-14 space-y-16 md:space-y-24">
            {FEATURES.map((f, i) => (
              <article key={f.title} className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="overflow-hidden rounded-[1.75rem] bg-[#f5ece5] ring-1 ring-line">
                    <Image src={f.img} alt={f.alt} width={720} height={720} className="decorative mx-auto h-auto w-full max-w-md" sizes="(min-width: 768px) 440px, 90vw" />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl">{f.title}</h3>
                  <p className="mt-4 max-w-lg text-lg text-muted">{f.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- builder ---------- */}
      <section aria-labelledby="builder-title" className="pt-20 md:pt-28">
        <div className="container-page">
          <div className="card grid items-center gap-8 overflow-hidden p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
            <div>
              <p className="eyebrow">חדש: בניית קורות חיים</p>
              <h2 id="builder-title" className="mt-2 text-3xl md:text-4xl">
                אין לך קורות חיים טובים? נבנה אותם יחד
              </h2>
              <p className="mt-4 max-w-xl text-lg text-muted">
                עונים במילים שלכם על שאלות פשוטות. אנחנו שואלים שאלות המשך שמוציאות את ההישגים האמיתיים. בסוף מקבלים קורות חיים מקצועיים ב-3 עיצובים, בעברית או באנגלית. מתאים גם לשיפור קורות חיים קיימים.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/builder" className="btn btn-primary text-lg">
                  לבניית קורות חיים
                </Link>
                <span className="text-muted">49 ₪, תשלום חד-פעמי · הראיון חינם</span>
              </div>
            </div>
            <ul className="space-y-3" aria-label="איך זה עובד">
              {["מעלים קורות חיים קיימים, או מתחילים מאפס", "עונים על שאלות קצרות לכל תפקיד", "מקבלים קורות חיים מקצועיים, מוכנים לשליחה"].map((t, i) => (
                <li key={t} className="flex items-center gap-4 rounded-2xl bg-paper-2 p-4">
                  <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-soft font-display font-bold text-amber-ink">
                    {i + 1}
                  </span>
                  <span className="font-semibold">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- honesty promise ---------- */}
      <section aria-labelledby="promise-title" className="py-20 md:py-28">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2rem] bg-forest px-7 py-14 text-white md:px-14 md:py-20">
            <div aria-hidden="true" className="absolute -left-20 -top-20 size-72 rounded-full bg-amber/20 blur-3xl" />
            <p className="relative font-semibold text-amber-soft">ההבטחה שלנו</p>
            <h2 id="promise-title" className="relative mt-3 max-w-3xl text-4xl text-white md:text-5xl">
              מגייסים מזהים קורות חיים מנופחים<br />ולכן לא נכניס אותך לראיון שלא תוכל לעמוד בו
            </h2>
            <ul className="relative mt-10 grid gap-6 md:grid-cols-3">
              <li>
                <p className="text-lg font-semibold">דרישה שחסרה לך</p>
                <p className="mt-1 text-white/80">מסומנת כ״להוסיף רק אם נכון״, עם הצעת ניסוח. לא נכנסת לקורות החיים לבד.</p>
              </li>
              <li>
                <p className="text-lg font-semibold">כל מספר וכל ארגון</p>
                <p className="mt-1 text-white/80">נבדקים מול המקור. מה שלא מופיע אצלך מסומן באדום לפני ההורדה.</p>
              </li>
              <li>
                <p className="text-lg font-semibold">טקסט במודעה שמנסה לתמרן</p>
                <p className="mt-1 text-white/80">נקרא כמידע בלבד. הוראות מוסתרות בקבצים לא משפיעות על התוצאה.</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 py-8 md:py-12">
        <div className="container-page">
          <p className="eyebrow">מחירים</p>
          <h2 id="pricing-title" className="mt-2 text-4xl md:text-5xl">
            מתחילים בבדיקה חינם וממשיכים רק אם זה עוזר
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            מחיר סופי בשקלים, בלי תוספות ובלי התחייבות. מבטלים באזור האישי בלחיצה אחת.
          </p>
          <div className="mt-10">
            <PricingCards />
          </div>
        </div>
      </section>

      {/* ---------- faq ---------- */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-20 md:py-28">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="eyebrow">שאלות נפוצות</p>
            <h2 id="faq-title" className="mt-2 text-4xl md:text-5xl">
              מה שכדאי לדעת
            </h2>
            <p className="mt-4 text-muted">
              לא מצאתם תשובה?{" "}
              <a className="link" href="mailto:hello@jobfit.co.il">
                כתבו לנו
              </a>
              .
            </p>
          </div>
          <Faq />
        </div>
      </section>

      {/* ---------- final cta ---------- */}
      <section aria-labelledby="cta-title" className="pb-8">
        <div className="container-page">
          <div className="card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center md:p-12">
            <div>
              <h2 id="cta-title" className="text-3xl md:text-4xl">
                כמה אתם מתאימים למשרה הבאה?
              </h2>
              <p className="mt-2 text-lg text-muted">בודקים בחינם, תוך דקה.</p>
            </div>
            <Link href="/scan" className="btn btn-primary px-7 text-lg">
              לבדיקת התאמה חינם
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
