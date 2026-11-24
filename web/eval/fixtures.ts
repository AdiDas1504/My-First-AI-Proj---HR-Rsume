/**
 * Quality evaluation set. Fictional people and companies only.
 * Each pair has an expected score band, so we can see whether the score
 * separates strong, partial and poor fits, and whether it is stable.
 */

export const RESUMES = {
  hrManager: `מיכל אברהם
050-0000001 · michal.a@example.com · ראשון לציון

מנהלת משאבי אנוש עם 9 שנות ניסיון בחברות טכנולוגיה ותעשייה.

ניסיון תעסוקתי
מנהלת משאבי אנוש | טק-ליין מערכות בע"מ (420 עובדים) | 2019 - היום
- ניהול מחלקת משאבי אנוש של 5 עובדות: גיוס, שכר ורווחה, הדרכה
- שותפה להנהלה בבניית תוכנית העבודה השנתית ותקציב כוח האדם
- הובלת תוכנית שימור עובדים שהורידה את התחלופה השנתית מ-21% ל-13%
- טיפול ביחסי עבודה, שימועים ופרישה בהתאם לדיני העבודה
- הטמעת מערכת HRIS חדשה (Hilan) ובניית דשבורד מדדי משאבי אנוש

רכזת משאבי אנוש | פלסט-טק תעשיות | 2015 - 2019
- גיוס לתפקידי ייצור ומטה, כ-120 גיוסים בשנה
- קליטה והכשרת עובדים חדשים

השכלה
תואר שני במנהל עסקים (MBA), התמחות בניהול משאבי אנוש | המכללה למינהל | 2017
תואר ראשון בפסיכולוגיה ומדעי ההתנהגות | אוניברסיטת בר-אילן | 2014

שפות: עברית - שפת אם, אנגלית - רמה גבוהה`,

  /** A real HR manager whose resume lists tasks only: no business impact, no metrics. */
  hrManagerPlain: `דנה פרץ
050-0000006 · dana.p@example.com · פתח תקווה

ניסיון תעסוקתי
מנהלת משאבי אנוש | מטאל-פרו תעשיות מתכת (300 עובדים) | 2018 - היום
- אחריות על תחום משאבי האנוש בחברה
- גיוס עובדים לכל המחלקות
- טיפול בשכר, נוכחות ורווחה
- ליווי עובדים ומנהלים
- שימועים וסיום העסקה

רכזת גיוס | חברת השמה | 2015 - 2018
- גיוס לחברות לקוח בתחומי תעשייה ולוגיסטיקה

השכלה
תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות | המכללה האקדמית ספיר | 2015

שפות: עברית, אנגלית`,

  hrGeneralist: `רוני שגיא
052-0000002 · roni.s@example.com · חיפה

רכזת גיוס ומשאבי אנוש עם 3 שנות ניסיון.

ניסיון תעסוקתי
רכזת גיוס ומשאבי אנוש | נובה לוגיסטיקה | 2022 - היום
- גיוס לתפקידי מחסן, נהגים ומשרד: פרסום משרות, סינון, ראיונות
- ליווי קליטה של עובדים חדשים וימי אוריינטציה
- תפעול שוטף של נוכחות ודיווחים לשכר
- ארגון אירועי רווחה וימי גיבוש

מוכרת | רשת אופנה | 2019 - 2021
- שירות לקוחות ומכירות

השכלה
תואר ראשון בסוציולוגיה ואנתרופולוגיה | אוניברסיטת חיפה | 2022

כישורים: Excel, Comeet, LinkedIn Recruiter`,

  accountant: `אלון דהן
054-0000003 · alon.d@example.com · תל אביב

רואה חשבון מוסמך עם 6 שנות ניסיון בביקורת ובחשבות.

ניסיון תעסוקתי
חשב | גרין אנרגיה בע"מ | 2021 - היום
- סגירת דוחות כספיים רבעוניים ושנתיים לפי IFRS
- הכנת תקציב שנתי ובקרת תקציב מול ביצוע
- עבודה שוטפת מול רואי החשבון המבקרים ורשויות המס
- ניהול 2 מנהלות חשבונות

מבקר | משרד רואי חשבון בינוני | 2018 - 2021
- ביקורת דוחות כספיים של חברות פרטיות וציבוריות

השכלה
תואר ראשון בחשבונאות וכלכלה | המכללה האקדמית תל אביב-יפו | 2018
רישיון ראיית חשבון | 2020

כישורים: Priority, SAP, Excel מתקדם`,

  projectManager: `יעל כרמי
053-0000004 · yael.k@example.com · מודיעין

מנהלת פרויקטים תפעוליים עם 7 שנות ניסיון בלוגיסטיקה ושרשרת אספקה.

ניסיון תעסוקתי
מנהלת פרויקטים | גלובל-לוג שרשרת אספקה | 2020 - היום
- הובלת הטמעת מערכת ERP (SAP) בשלושה מרכזים לוגיסטיים
- ניהול תקציבי פרויקטים של עד 4 מיליון ש"ח ותיאום 6 ספקים
- ניהול צוות פרויקט של 8 אנשים מתחומי תפעול, מערכות מידע וכספים
- הצגת סטטוס ומדדי ביצוע להנהלה הבכירה

מנהלת משמרת | מרכז הפצה ארצי | 2017 - 2020
- ניהול 25 עובדי מחסן במשמרת, תכנון כוח אדם ועמידה ביעדי תפוקה

השכלה
תואר ראשון בהנדסת תעשייה וניהול | אפקה | 2017

כישורים: SAP, MS Project, Power BI, Excel`,

  juniorDev: `עומר נחום
058-0000005 · omer.n@example.com · באר שבע

מפתח Frontend עם שנתיים ניסיון.

ניסיון תעסוקתי
מפתח Frontend | סטארט-אפ בתחום הפינטק | 2023 - היום
- פיתוח מסכים ב-React ו-TypeScript למערכת ניהול תיקים
- עבודה מול צוות UX ושילוב API של צד שרת
- כתיבת בדיקות יחידה ב-Jest

שירות צבאי | מדריך מחשבים | 2018 - 2021

השכלה
בוטקאמפ פיתוח Full Stack | 2022
תואר ראשון במדעי המחשב (בלימודים)

כישורים: React, TypeScript, JavaScript, HTML, CSS, Git`,
} as const;

export const JOBS = {
  hrManagerJob: `דרוש/ה מנהל/ת משאבי אנוש לחברת תעשייה מובילה במרכז (כ-350 עובדים)

תיאור התפקיד:
- ניהול מחלקת משאבי האנוש
- גיוס, קליטה ושימור עובדים
- ליווי מנהלים ועובדים
- טיפול ביחסי עבודה

דרישות:
- ניסיון של 5 שנים לפחות בניהול משאבי אנוש - חובה
- תואר ראשון במדעי ההתנהגות / ניהול משאבי אנוש - חובה
- היכרות עם דיני עבודה
- יחסי אנוש מצוינים ויכולת עבודה בצוות
- ניסיון בחברת ייצור - יתרון`,

  accountantJob: `לחברה ציבורית בתחום התשתיות דרוש/ה חשב/ת

אחריות:
- ניהול מחלקת הנהלת חשבונות
- הכנת דוחות כספיים רבעוניים ושנתיים
- הכנת תקציב ובקרה תקציבית
- עבודה מול רואי חשבון מבקרים ורשויות

דרישות:
- רואה חשבון מוסמך - חובה
- 4 שנות ניסיון לפחות, מתוכן שנתיים בחשבות - חובה
- ניסיון בדיווח לפי IFRS - חובה
- היכרות עם SAP - יתרון
- ניסיון בניהול עובדים - יתרון`,

  projectManagerJob: `דרוש/ה מנהל/ת פרויקטים תפעוליים לחברת הפצה ארצית

התפקיד כולל:
- הובלת פרויקטי שיפור תהליכים והטמעת מערכות
- ניהול לוחות זמנים, תקציבים וסיכונים
- עבודה מול ספקים וממשקים רבים בארגון
- דיווח להנהלה

דרישות:
- 4 שנות ניסיון לפחות בניהול פרויקטים - חובה
- ניסיון בהטמעת מערכות ERP - חובה
- תואר ראשון בהנדסת תעשייה וניהול או תחום רלוונטי
- שליטה ב-MS Project ו-Excel
- ניסיון בתחום הלוגיסטיקה - יתרון`,

  frontendJob: `Frontend Developer - fintech company, Tel Aviv

Responsibilities:
- Build and maintain customer-facing web apps in React
- Work closely with product, UX and backend teams
- Own features end to end, including testing

Requirements:
- 3+ years of experience in frontend development - must
- Strong React and TypeScript skills - must
- Experience with state management and REST APIs
- Experience with testing (Jest / Testing Library)
- B.Sc. in Computer Science - advantage`,
} as const;

export type ResumeId = keyof typeof RESUMES;
export type JobId = keyof typeof JOBS;

/** Expected score band for each pair: [min, max]. */
export const EXPECTED: Record<JobId, Record<ResumeId, [number, number]>> = {
  hrManagerJob: { hrManager: [75, 100], hrManagerPlain: [60, 95], hrGeneralist: [25, 60], accountant: [0, 25], projectManager: [5, 40], juniorDev: [0, 15] },
  accountantJob: { hrManager: [0, 25], hrManagerPlain: [0, 20], hrGeneralist: [0, 15], accountant: [75, 100], projectManager: [0, 30], juniorDev: [0, 15] },
  projectManagerJob: { hrManager: [5, 40], hrManagerPlain: [0, 35], hrGeneralist: [0, 30], accountant: [0, 35], projectManager: [75, 100], juniorDev: [0, 25] },
  frontendJob: { hrManager: [0, 15], hrManagerPlain: [0, 15], hrGeneralist: [0, 15], accountant: [0, 15], projectManager: [0, 25], juniorDev: [45, 80] },
};

/**
 * The HR case from real users: a strong HR manager applying to an ad that does
 * not mention business partnering, ROI or people metrics. A good engine finds
 * these anyway (from what the role needs), asks about them, and uses the answers.
 */
export const HR_CASE = {
  resume: "hrManagerPlain" as ResumeId,
  job: "hrManagerJob" as JobId,
  /** At least this many of these topics should come up in the role research. */
  expectedTopics: [
    /שות(ף|פה|פות) עסקי|business partner|HRBP|יעדים עסקיים|אסטרטגי/i,
    /ROI|מדד|KPI|תחלופה|מדידה|נתונים/i,
    /ניהול (עובדים|צוות|ישיר)|ניהול אנשים|people management/i,
    /תרבות ארגונית|שימור|מעורבות|engagement/i,
    /פיתוח (ארגוני|עובדים|מנהלים)|הדרכה|L&D/i,
  ],
  minTopics: 3,
  /** Simulated, true answers the candidate gives to the questions. */
  answers: [
    "כן, אני בישיבות הנהלה כל שבוע ועובדת צמוד עם המנכ\"ל. בנינו יחד תוכנית גיוס לקו הייצור החדש",
    "כן מודדת תחלופה וזמן גיוס, מציגה להנהלה כל רבעון. זמן גיוס ירד מ-45 ל-30 יום בערך",
    "יש לי 2 עובדות, רכזת גיוס ומתאמת שכר",
  ],
  /** Words we expect in the tailored resume once those answers are given. */
  expectedInResume: [/הנהלה|מנכ"ל|מנכ״ל/, /זמן (ה)?גיוס|30 ימים|תחלופה/],
};
