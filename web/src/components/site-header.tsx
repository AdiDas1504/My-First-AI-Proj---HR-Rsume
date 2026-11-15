import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { Wordmark } from "./logo";
import { MobileNav } from "./mobile-nav";

const NAV = [
  { href: "/#how", label: "איך זה עובד" },
  { href: "/builder", label: "בניית קורות חיים" },
  { href: "/pricing", label: "מחירים" },
  { href: "/#faq", label: "שאלות נפוצות" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="no-print sticky top-0 z-30 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="JobFit, לעמוד הבית" className="rounded-lg">
          <Wordmark />
        </Link>

        <nav aria-label="ניווט ראשי" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-full px-3.5 py-2 text-[0.95rem] text-ink/80 transition hover:bg-card hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <Link href="/app" className="btn btn-primary">
              האזור שלי
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-quiet">
                כניסה
              </Link>
              <Link href="/scan" className="btn btn-primary">
                בדיקת התאמה חינם
              </Link>
            </>
          )}
        </div>

        <MobileNav items={NAV} loggedIn={Boolean(user)} />
      </div>
    </header>
  );
}
