import type { Metadata, Viewport } from "next";
import "@fontsource-variable/heebo";
import "@fontsource/frank-ruhl-libre/500.css";
import "@fontsource/frank-ruhl-libre/700.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AccessibilityToolbar } from "@/components/accessibility-toolbar";
import { DemoBanner } from "@/components/demo-banner";
import { TrackView } from "@/components/track-view";

const appUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "JobFit · קורות חיים מותאמים לכל משרה, בלי להמציא",
    template: "%s · JobFit",
  },
  description:
    "מעלים קורות חיים ומודעת דרושים, ומקבלים ציון התאמה, את הפערים שחשוב לסגור וגרסה מותאמת מוכנה לשליחה ב-Word או PDF. בעברית ובאנגלית.",
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "JobFit",
    images: [{ url: "/img/og.jpg", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f6ede5",
};

// Applies saved accessibility preferences before first paint (no flash).
const a11yBootstrap = `try{var p=JSON.parse(localStorage.getItem('jf-a11y')||'{}');var c=document.documentElement.classList;Object.keys(p).forEach(function(k){if(p[k])c.add(k)})}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: a11yBootstrap }} />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        <a
          href="#main"
          className="no-print sr-only focus:not-sr-only focus:fixed focus:top-3 focus:right-3 focus:z-50 focus:rounded-full focus:bg-forest focus:px-5 focus:py-3 focus:text-white"
        >
          דילוג לתוכן הראשי
        </a>
        <DemoBanner />
        <SiteHeader />
        <main id="main" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <AccessibilityToolbar />
        <TrackView />
      </body>
    </html>
  );
}
