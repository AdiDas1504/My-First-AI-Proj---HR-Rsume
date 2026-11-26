import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { BUILDER_PRODUCT, PLANS, formatPrice } from "@/lib/plans";

export const metadata: Metadata = { title: "תנאי שימוש וביטולים" };

export default function TermsPage() {
  return (
    <LegalPage title="תנאי שימוש, מנוי וביטולים" updated="26 בנובמבר 2026">
      <section>
        <h2>השירות</h2>
        <p>
          JobFit מנתח את קורות החיים שלכם מול מודעת דרושים ומציע גרסה מותאמת. השירות מנסח מחדש מידע שקיים בקורות החיים ואינו מוסיף ניסיון, השכלה או כישורים. התוצרים הם טיוטה והאחריות לוודא שכל פרט בהם נכון לפני שליחה היא של המשתמש. אנחנו לא מבטיחים זימון לראיון או קבלה לעבודה.
        </p>
      </section>
      <section>
        <h2>בדיקה חינמית</h2>
        <p>בדיקת התאמה חינמית אחת לכל משתמש. ניסיון לעקוף מגבלה זו (למשל פתיחת חשבונות מרובים) עלול להביא לחסימה.</p>
      </section>
      <section>
        <h2>מסלולים וחידוש אוטומטי</h2>
        <ul>
          <li>{PLANS.trial.name}: {formatPrice(PLANS.trial.priceAgorot)} ל-7 ימים פעם אחת לכל משתמש. בסוף השבוע המנוי מתחדש אוטומטית כמנוי חודשי, אלא אם בוטל.</li>
          <li>{PLANS.monthly.name}: {formatPrice(PLANS.monthly.priceAgorot)} לכל 30 יום, מתחדש אוטומטית עד לביטול.</li>
          <li>{PLANS.quarterly.name}: {formatPrice(PLANS.quarterly.priceAgorot)} לכל 90 יום, מתחדש אוטומטית עד לביטול.</li>
          <li>כל המחירים הם המחירים הסופיים. מכסת שימוש הוגן: עד {PLANS.monthly.tailorQuota} התאמות בכל 30 יום ({PLANS.trial.tailorQuota} בשבוע ההיכרות).</li>
        </ul>
      </section>
      <section>
        <h2>בניית קורות חיים (תשלום חד-פעמי)</h2>
        <ul>
          <li>{BUILDER_PRODUCT.name}: {formatPrice(BUILDER_PRODUCT.priceAgorot)}, תשלום חד-פעמי לקורות חיים אחד. אין חידוש אוטומטי.</li>
          <li>הראיון והשאלות חינם. התשלום נדרש ליצירת קורות החיים וכולל עריכה, החלפת תבנית והורדות ללא הגבלה עבור אותם קורות חיים.</li>
          <li>קורות החיים נבנים רק מהמידע שמסרתם. האחריות לוודא שכל פרט נכון היא שלכם.</li>
        </ul>
      </section>
      <section>
        <h2>ביטול</h2>
        <p>
          אפשר לבטל בכל עת באזור האישי בלחיצה על ״ביטול המנוי״ או בפנייה בדוא״ל. הביטול נכנס לתוקף מיד: הגישה לשירותים בתשלום נסגרת ולא יתבצעו חיובים נוספים. החזר כספי על התקופה הנוכחית אפשרי רק אם לא נעשה שימוש בשירותי האתר באותה תקופה. ביטול עסקה והחזר כספי יתבצעו בהתאם להוראות חוק הגנת הצרכן, התשמ״א-1981 ותקנותיו.
        </p>
      </section>
      <section>
        <h2>שימוש הוגן ואסור</h2>
        <ul>
          <li>אין להעלות קורות חיים של אדם אחר ללא הסכמתו.</li>
          <li>אין להשתמש בשירות כדי ליצור מסמכים כוזבים.</li>
          <li>אין לנסות לפרוץ, להעמיס או לעקוף את מגבלות השירות.</li>
        </ul>
      </section>
      <section>
        <h2>יצירת קשר</h2>
        <p>
          <a className="link" href="mailto:hello@jobfit.co.il">hello@jobfit.co.il</a>
        </p>
      </section>
    </LegalPage>
  );
}
