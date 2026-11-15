import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";
import { PLANS, formatPrice } from "@/lib/plans";

export const metadata: Metadata = { title: "תנאי שימוש וביטולים" };

export default function TermsPage() {
  return (
    <LegalPage title="תנאי שימוש, מנוי וביטולים" updated="15 בנובמבר 2026">
      <section>
        <h2>השירות</h2>
        <p>
          JobFit מנתח את קורות החיים שלכם מול מודעת דרושים ומציע גרסה מותאמת. השירות מנסח מחדש מידע שקיים בקורות החיים ואינו מוסיף ניסיון, השכלה או כישורים. התוצרים הם טיוטה, והאחריות לוודא שכל פרט בהם נכון לפני שליחה היא של המשתמש. אנחנו לא מבטיחים זימון לראיון או קבלה לעבודה.
        </p>
      </section>
      <section>
        <h2>בדיקה חינמית</h2>
        <p>בדיקת התאמה חינמית אחת לכל מספר טלפון ולכל מכשיר. ניסיון לעקוף מגבלה זו (למשל פתיחת חשבונות מרובים) עלול להביא לחסימה.</p>
      </section>
      <section>
        <h2>מסלולים וחידוש אוטומטי</h2>
        <ul>
          <li>{PLANS.trial.name}: {formatPrice(PLANS.trial.priceAgorot)} ל-7 ימים, פעם אחת לכל מספר טלפון. בסוף השבוע המנוי מתחדש אוטומטית כמנוי חודשי, אלא אם בוטל.</li>
          <li>{PLANS.monthly.name}: {formatPrice(PLANS.monthly.priceAgorot)} לכל 30 יום, מתחדש אוטומטית עד לביטול.</li>
          <li>{PLANS.quarterly.name}: {formatPrice(PLANS.quarterly.priceAgorot)} לכל 90 יום, מתחדש אוטומטית עד לביטול.</li>
          <li>כל המחירים כוללים מע״מ. מכסת שימוש הוגן: עד {PLANS.monthly.tailorQuota} התאמות בכל 30 יום ({PLANS.trial.tailorQuota} בשבוע ההיכרות).</li>
        </ul>
      </section>
      <section>
        <h2>ביטול</h2>
        <p>
          אפשר לבטל בכל עת באזור האישי, בלחיצה על ״ביטול המנוי״, וגם בפנייה בדוא״ל. לאחר הביטול לא יתבצעו חיובים נוספים, והמנוי יישאר פעיל עד סוף התקופה ששולמה. ביטול עסקה והחזר כספי יתבצעו בהתאם להוראות חוק הגנת הצרכן, התשמ״א-1981, ותקנותיו.
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
