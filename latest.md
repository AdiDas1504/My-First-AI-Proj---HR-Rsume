# JobFit quality evaluation

Date: 2026-11-24T12:15:11.071Z · scan reps: 2

**Checks passed: 14/17**

- ✅ scan: separation between best and poor fits ≥ 45 (66)
- ✅ scan: repeated runs differ by ≤ 12 points (9)
- ✅ scan: ≥ 80% of pairs inside expected band (22/24)
- ✅ scan: best candidate ranks first for hrManagerJob (hrManager)
- ✅ scan: best candidate ranks first for accountantJob (accountant)
- ✅ scan: best candidate ranks first for projectManagerJob (projectManager)
- ✅ scan: best candidate ranks first for frontendJob (juniorDev)
- ✅ analysis: ≥ 80% of pairs inside expected band (8/10)
- ✅ HR case: role research covers key expectations beyond the ad (4/5 topics)
- ✅ HR case: at least 3 expectations marked as beyond the ad (6)
- ✅ HR case: 3-7 questions (7)
- ❌ HR case: asked about business partnering, metrics and team management (2/3 matched)
- ✅ HR case: answers show up in the resume (2/2)
- ✅ HR case: answers are rewritten professionally, not pasted
- ❌ HR case: no invented facts with answers (2 flags)
- ❌ HR case: no invented facts without answers (3 flags)
- ✅ HR case: without answers, no metrics it was never given

## 1. Free scan (Haiku): score matrix

| job \ resume | hrManager | hrManagerPlain | hrGeneralist | accountant | projectManager | juniorDev |
|---|---|---|---|---|---|---|
| hrManagerJob | 83 / 81  | 73 / 64  | 22 / 19 ⚠️ (25-60) | 6 / 13  | 11 / 12  | 0 / 0  |
| accountantJob | 7 / 7  | 11 / 5  | 2 / 2  | 82 / 90  | 19 / 13  | 0 / 0  |
| projectManagerJob | 23 / 20  | 12 / 4  | 15 / 21  | 16 / 17  | 86 / 92  | 2 / 8  |
| frontendJob | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 5  | 35 / 35 ⚠️ (45-80) |

- Best-fit average: **73** · poor-fit average: **7** · separation: **66**
- Spread (standard deviation of all scores): **29**
- Largest change between repeated runs of the same pair: **9** points
- Pairs inside their expected band: **22/24**

## 2. Full analysis (Sonnet)

| pair | expected | score | alignment | seniority | requirements (met/partial/missing) | unverified quotes |
|---|---|---|---|---|---|---|
| hrManagerJob / hrManager | 75-100 | 92 | same | fits | 8/2/0 | 0 |
| hrManagerJob / hrManagerPlain | 60-95 | 67 | same | fits | 4/5/0 | 0 |
| hrManagerJob / hrGeneralist | 25-60 | 21 ⚠️ | adjacent | far_below | 1/5/3 | 0 |
| hrManagerJob / projectManager | 5-40 | 11 | transferable | one_below | 0/5/4 | 0 |
| accountantJob / accountant | 75-100 | 87 | same | fits | 8/2/0 | 0 |
| accountantJob / hrManager | 0-25 | 3 | unrelated | fits | 1/1/6 | 0 |
| projectManagerJob / projectManager | 75-100 | 83 | same | fits | 7/2/0 | 0 |
| projectManagerJob / accountant | 0-35 | 13 | transferable | one_below | 1/4/5 | 0 |
| frontendJob / juniorDev | 45-80 | 43 ⚠️ | same | one_below | 3/4/2 | 0 |
| frontendJob / projectManager | 0-25 | 1 | unrelated | far_below | 0/2/5 | 0 |

## 3. HR case: research and questions

Resume: a real HR manager whose resume lists tasks only. Ad: does not mention business partnering or metrics.

**What the engine found the role needs:**
- ניהול מחלקה וצוות (in the ad, hidden)
- דיני עבודה (in the ad, hidden)
- יחסי עבודה (in the ad, hidden)
- שימור עובדים (in the ad, absent)
- שותפות עסקית עם ההנהלה (beyond the ad, absent)
- מדדים ותוצאות (beyond the ad, absent)
- הדרכה ופיתוח עובדים (beyond the ad, absent)
- גיוס לתעשייה (beyond the ad, shown)
- שכר, נוכחות ורווחה (beyond the ad, shown)
- היקף אחריות וגודל ארגון (beyond the ad, shown)

**Questions it asked:**
- יש לך עובדים שמדווחים אליך במחלקה, למשל רכז/ת או עוזר/ת? כמה?
- יצא לך לעבוד ישירות מול ההנהלה על יעדים עסקיים או תכנון כוח אדם? אם כן, על מה?
- עם אילו נושאי דיני עבודה או יחסי עבודה התמודדת בפועל? למשל שימועים, תלונות, התארגנות, עבודה מול עורך דין או משרד העבודה.
- את מודדת משהו בתחום, כמו תחלופה, זמן גיוס או היקף גיוסים בשנה? יש מספר שזכור לך?
- עשית משהו ספציפי לשימור עובדים, כמו סקרי שביעות רצון, שיחות עזיבה או תוכנית הוקרה? מה השתנה?
- היית מעורבת בהכשרות, קליטת עובדים חדשים או פיתוח מנהלים בחברה?
- בערך כמה עובדים גייסת בשנה בחברה הנוכחית, ולאילו סוגי תפקידים (ייצור, אדמיניסטרציה, הנדסה)?

## 4. HR case: writing

**With the answers** (summary): מנהלת משאבי אנוש עם ניסיון מוכח בחברת ייצור תעשייתית (300 עובדים), הכוללת גיוס, שכר, נוכחות ורווחה, וליווי עובדים ומנהלים. שותפה להנהלה הבכירה בישיבות שבועיות ובתכנון כוח אדם, עם עבודה מבוססת מדדי תחלופה וזמן גיוס. בעלת תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות.

Most recent role:
- אחריות על תחום משאבי האנוש בחברת ייצור, כולל גיוס לכלל המחלקות, שכר, נוכחות ורווחה
- שותפה להנהלה: משתתפת בישיבות הנהלה שבועיות ועובדת צמוד עם המנכ"ל
- בניית תוכנית גיוס לקו הייצור החדש יחד עם המנכ"ל
- מדידת תחלופה וזמן גיוס והצגתם להנהלה אחת לרבעון; זמן הגיוס ירד מ-45 ל-30 יום בקירוב
- ליווי עובדים ומנהלים, כולל שימועים וסיום העסקה

Honesty flags: גיוס והשמה (המיומנות הזו לא מופיעה בקורות החיים המקוריים); מדדי HR (המיומנות הזו לא מופיעה בקורות החיים המקוריים)

**Without answers** (summary): מנהלת משאבי אנוש עם למעלה מ-7 שנות ניסיון בניהול תחום משאבי האנוש בחברת ייצור המונה 300 עובדים, ורקע קודם בגיוס לתעשייה ולוגיסטיקה. בעלת תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות. מתמחה בגיוס, ליווי מנהלים ועובדים, שכר ורווחה וטיפול בשימועים וסיום העסקה.

Honesty flags: 7 (המספר הזה לא מופיע בקורות החיים המקוריים); גיוס וקליטה (המיומנות הזו לא מופיעה בקורות החיים המקוריים); רווחת עובדים (המיומנות הזו לא מופיעה בקורות החיים המקוריים)
