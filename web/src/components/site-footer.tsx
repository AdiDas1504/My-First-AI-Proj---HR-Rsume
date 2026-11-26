import Link from "next/link";
import { Wordmark } from "./logo";

export function SiteFooter() {
  return (
    <footer className="no-print mt-24 border-t border-line bg-paper-2">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Wordmark />
          <p className="mt-4 text-muted">
            קורות חיים שמדברים בשפה של המשרה. אנחנו מנסחים מחדש את מה שכבר עשיתם ולא ממציאים שום דבר.
          </p>
        </div>
        <nav aria-label="המוצר">
          <h2 className="font-sans text-sm font-bold text-ink">המוצר</h2>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link className="hover:text-ink" href="/scan">בדיקת התאמה חינם</Link></li>
            <li><Link className="hover:text-ink" href="/builder">בניית קורות חיים</Link></li>
            <li><Link className="hover:text-ink" href="/pricing">מחירים</Link></li>
            <li><Link className="hover:text-ink" href="/#faq">שאלות נפוצות</Link></li>
            <li><Link className="hover:text-ink" href="/login">כניסה</Link></li>
          </ul>
        </nav>
        <nav aria-label="מידע משפטי ונגישות">
          <h2 className="font-sans text-sm font-bold text-ink">מידע</h2>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link className="hover:text-ink" href="/legal/privacy">מדיניות פרטיות</Link></li>
            <li><Link className="hover:text-ink" href="/legal/terms">תנאי שימוש וביטולים</Link></li>
            <li><Link className="hover:text-ink" href="/accessibility">הצהרת נגישות</Link></li>
            <li><a className="hover:text-ink" href="mailto:hello@jobfit.co.il">צרו קשר</a></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-5 text-sm text-muted">© {new Date().getFullYear()} JobFit. כל הזכויות שמורות.</p>
      </div>
    </footer>
  );
}
