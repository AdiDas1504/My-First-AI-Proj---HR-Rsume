# JobFit quality evaluation

Date: 2026-11-24T12:27:42.989Z · scan reps: 2

**Checks passed: 15/17**

- ✅ scan: separation between best and poor fits ≥ 45 (66)
- ✅ scan: repeated runs differ by ≤ 12 points (7)
- ✅ scan: ≥ 80% of pairs inside expected band (22/24)
- ✅ scan: best candidate ranks first for hrManagerJob (hrManager)
- ✅ scan: best candidate ranks first for accountantJob (accountant)
- ✅ scan: best candidate ranks first for projectManagerJob (projectManager)
- ✅ scan: best candidate ranks first for frontendJob (juniorDev)
- ✅ analysis: ≥ 80% of pairs inside expected band (9/10)
- ✅ HR case: role research covers key expectations beyond the ad (4/5 topics)
- ✅ HR case: at least 3 expectations marked as beyond the ad (5)
- ✅ HR case: 3-7 questions (7)
- ❌ HR case: asked about business partnering, metrics and team management (2/3 matched)
- ✅ HR case: answers show up in the resume (2/2)
- ✅ HR case: answers are rewritten professionally, not pasted
- ❌ HR case: no invented facts with answers (2 flags)
- ✅ HR case: no invented facts without answers (0 flags)
- ✅ HR case: without answers, no metrics it was never given

## 1. Free scan (Haiku): score matrix

| job \ resume | hrManager | hrManagerPlain | hrGeneralist | accountant | projectManager | juniorDev |
|---|---|---|---|---|---|---|
| hrManagerJob | 83 / 85  | 73 / 73  | 13 / 20 ⚠️ (25-60) | 4 / 3  | 15 / 15  | 0 / 0  |
| accountantJob | 14 / 10  | 2 / 5  | 2 / 0  | 88 / 90  | 18 / 15  | 0 / 0  |
| projectManagerJob | 22 / 21  | 12 / 12  | 19 / 17  | 15 / 15  | 77 / 83  | 6 / 3  |
| frontendJob | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 2  | 37 / 43 ⚠️ (45-80) |

- Best-fit average: **73** · poor-fit average: **7** · separation: **66**
- Spread (standard deviation of all scores): **29**
- Largest change between repeated runs of the same pair: **7** points
- Pairs inside their expected band: **22/24**

## 2. Full analysis (Sonnet)

| pair | expected | score | alignment | seniority | requirements (met/partial/missing) | unverified quotes |
|---|---|---|---|---|---|---|
| hrManagerJob / hrManager | 75-100 | 89 | same | fits | 6/2/0 | 0 |
| hrManagerJob / hrManagerPlain | 60-95 | 77 | same | fits | 5/4/0 | 0 |
| hrManagerJob / hrGeneralist | 25-60 | 22 ⚠️ | adjacent | far_below | 2/4/4 | 0 |
| hrManagerJob / projectManager | 5-40 | 10 | transferable | one_below | 0/4/5 | 0 |
| accountantJob / accountant | 75-100 | 88 | same | fits | 8/2/0 | 0 |
| accountantJob / hrManager | 0-25 | 3 | unrelated | far_below | 1/1/7 | 0 |
| projectManagerJob / projectManager | 75-100 | 94 | same | fits | 9/1/0 | 0 |
| projectManagerJob / accountant | 0-35 | 22 | transferable | one_below | 2/3/4 | 0 |
| frontendJob / juniorDev | 45-80 | 60 | same | one_below | 5/3/1 | 0 |
| frontendJob / projectManager | 0-25 | 5 | unrelated | far_below | 0/3/4 | 0 |

## 3. HR case: research and questions

Resume: a real HR manager whose resume lists tasks only. Ad: does not mention business partnering or metrics.

**What the engine found the role needs:**
- ניהול מחלקה וצוות (in the ad, hidden)
- יחסי עבודה ודיני עבודה (in the ad, hidden)
- גיוס ושימור (in the ad, hidden)
- שותפות עסקית עם ההנהלה (beyond the ad, absent)
- מדדים ותוצאות (KPIs) (beyond the ad, absent)
- הדרכה ופיתוח עובדים (beyond the ad, absent)
- שכר ונוכחות (beyond the ad, shown)
- עבודה מול ועד עובדים והסכמים קיבוציים (beyond the ad, absent)
- ייצור ועובדי שטח (in the ad, shown)

**Questions it asked:**
- יש לך עובדים או רכזים שכפופים אלייך במחלקת משאבי האנוש? כמה?
- את חלק מהנהלת החברה או נפגשת איתה באופן קבוע? יצא לך לעבוד איתה על יעדים עסקיים, ואם כן על מה?
- עם אילו מקרים של יחסי עבודה התמודדת, כמו שימועים, משמעת או תלונות, ועבדת עם עו"ד או בית דין?
- בערך כמה עובדים גייסת בשנה? יש לך זמן גיוס ממוצע או נתון אחר שזכור לך?
- עשית משהו כדי לשמר עובדים או להוריד תחלופה? משהו השתנה בעקבותיו?
- יזמת או הפעלת הדרכות, קליטה לעובדים חדשים או תהליכי פיתוח? מה בדיוק?
- יש בחברה ועד עובדים או הסכמים קיבוציים, ומה היה התפקיד שלך מולם? וכמה עובדים בשכר עובדים אצלך?

## 4. HR case: writing

**With the answers** (summary): מנהלת משאבי אנוש בחברת ייצור (300 עובדים) עם ניסיון בניהול תחום ה-HR מקצה לקצה: גיוס וקליטה, שכר ונוכחות, ליווי מנהלים ועובדים וסיום העסקה. משתתפת בישיבות הנהלה ועובדת בשיתוף הדוק עם המנכ"ל, ומציגה מדדי תחלופה וזמן גיוס. בוגרת תואר בניהול משאבי אנוש ומדעי ההתנהגות.

Most recent role:
- אחריות על תחום משאבי האנוש בחברת ייצור: גיוס, שכר, נוכחות ורווחה
- שותפה לישיבות הנהלה שבועיות; עבודה צמודה עם המנכ"ל, כולל בניית תוכנית גיוס לקו הייצור החדש
- מדידת תחלופה וזמן גיוס והצגתם להנהלה מדי רבעון; קיצור זמן הגיוס מכ-45 ל-30 יום
- ליווי עובדים ומנהלים, כולל ניהול שימועים וסיום העסקה

Honesty flags: גיוס וקליטה (המיומנות הזו לא מופיעה בקורות החיים המקוריים); שימור עובדים (המיומנות הזו לא מופיעה בקורות החיים המקוריים)

**Without answers** (summary): מנהלת משאבי אנוש בחברת ייצור המונה 300 עובדים, עם ניסיון בניהול כולל של תחום משאבי האנוש: גיוס, שכר ונוכחות, רווחה, ליווי מנהלים ועובדים וטיפול בשימועים וסיום העסקה. בעלת רקע בגיוס לחברות תעשייה ולוגיסטיקה ותואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות.

Honesty flags: none
