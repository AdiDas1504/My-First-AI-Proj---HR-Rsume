# JobFit quality evaluation

Date: 2026-11-25T16:46:40.441Z · scan reps: 2

**Checks passed: 16/17**

- ✅ scan: separation between best and poor fits ≥ 45 (65)
- ❌ scan: repeated runs differ by ≤ 12 points (13)
- ✅ scan: ≥ 80% of pairs inside expected band (22/24)
- ✅ scan: best candidate ranks first for hrManagerJob (hrManager)
- ✅ scan: best candidate ranks first for accountantJob (accountant)
- ✅ scan: best candidate ranks first for projectManagerJob (projectManager)
- ✅ scan: best candidate ranks first for frontendJob (juniorDev)
- ✅ analysis: ≥ 80% of pairs inside expected band (10/10)
- ✅ HR case: role research covers key expectations beyond the ad (4/5 topics)
- ✅ HR case: at least 3 expectations marked as beyond the ad (5)
- ✅ HR case: 3-7 questions (7)
- ✅ HR case: asked about business partnering, metrics and team management (3/3 matched)
- ✅ HR case: answers show up in the resume (2/2)
- ✅ HR case: answers are rewritten professionally, not pasted
- ✅ HR case: no invented facts with answers (0 flags)
- ✅ HR case: no invented facts without answers (0 flags)
- ✅ HR case: without answers, no metrics it was never given

## 1. Free scan (Haiku): score matrix

| job \ resume | hrManager | hrManagerPlain | hrGeneralist | accountant | projectManager | juniorDev |
|---|---|---|---|---|---|---|
| hrManagerJob | 84 / 93  | 72 / 60  | 30 / 30  | 3 / 7  | 10 / 8  | 1 / 0  |
| accountantJob | 8 / 8  | 3 / 3  | 2 / 2  | 89 / 76  | 16 / 19  | 0 / 0  |
| projectManagerJob | 21 / 18  | 9 / 7  | 20 / 20  | 12 / 14  | 72 / 76 ⚠️ (75-100) | 8 / 8  |
| frontendJob | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 0  | 44 / 48 ⚠️ (45-80) |

- Best-fit average: **73** · poor-fit average: **8** · separation: **65**
- Spread (standard deviation of all scores): **28**
- Largest change between repeated runs of the same pair: **13** points
- Pairs inside their expected band: **22/24**

## 2. Full analysis (Sonnet)

| pair | expected | score | alignment | seniority | requirements (met/partial/missing) | unverified quotes |
|---|---|---|---|---|---|---|
| hrManagerJob / hrManager | 75-100 | 83 | same | fits | 5/3/0 | 0 |
| hrManagerJob / hrManagerPlain | 60-95 | 68 | same | fits | 4/5/0 | 0 |
| hrManagerJob / hrGeneralist | 28-40 | 30 | adjacent | far_below | 0/6/3 | 0 |
| hrManagerJob / projectManager | 5-40 | 12 | transferable | far_below | 1/4/4 | 0 |
| accountantJob / accountant | 75-100 | 87 | same | fits | 8/2/0 | 0 |
| accountantJob / hrManager | 0-25 | 2 | unrelated | far_below | 1/1/7 | 0 |
| projectManagerJob / projectManager | 75-100 | 85 | same | fits | 7/2/0 | 0 |
| projectManagerJob / accountant | 0-35 | 16 | transferable | one_below | 0/6/3 | 0 |
| frontendJob / juniorDev | 45-80 | 48 | same | one_below | 3/4/2 | 0 |
| frontendJob / projectManager | 0-25 | 8 | unrelated | far_below | 0/3/4 | 0 |

## 3. HR case: research and questions

Resume: a real HR manager whose resume lists tasks only. Ad: does not mention business partnering or metrics.

**What the engine found the role needs:**
- ניהול מחלקת HR וצוות (in the ad, hidden)
- גיוס, קליטה ושימור (in the ad, hidden)
- יחסי עבודה ודיני עבודה (in the ad, hidden)
- שותפות עסקית עם ההנהלה (beyond the ad, absent)
- מדדי HR (KPI) (beyond the ad, absent)
- עבודה עם עובדי ייצור ופס (beyond the ad, hidden)
- שכר ונוכחות (beyond the ad, shown)
- הדרכה, פיתוח ותרבות ארגונית (beyond the ad, absent)

**Questions it asked:**
- יש לך עובדים או רכזים שכפופים אלייך במחלקה? אם כן, כמה ובאילו תפקידים?
- יצא לך לטפל בתיקי משמעת, תלונות, ועד עובדים או מול משפטן? ספרי בקצרה.
- בערך כמה עובדים גייסת בשנה האחרונה? יש לך נתון כמו זמן איוש משרה?
- עשית משהו כדי לשפר שימור עובדים או להוריד תחלופה, וראית שינוי?
- את יושבת בהנהלה או עובדת ישירות מול המנכ"ל על תכנון כוח אדם או יעדים? על מה?
- הובלת משהו חדש בחברה, כמו מערכת שכר, תהליך קליטה, הדרכה או סקר שביעות רצון?
- את מגייסת ומלווה גם עובדי ייצור, משמרות או עובדים זרים?

## 4. HR case: writing

**With the answers** (summary): מנהלת משאבי אנוש בחברת ייצור (300 עובדים), עם תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות. מנהלת את מחלקת משאבי האנוש, משתתפת בישיבות הנהלה ועובדת בצמוד למנכ"ל. בעלת ניסיון בגיוס, שכר, ליווי מנהלים ועובדים, שימורים וסיום העסקה, וניסיון קודם בגיוס בחברת השמה.

Most recent role:
- ניהול מחלקת משאבי האנוש הכוללת רכזת גיוס ומתאמת שכר, ואחריות על כלל תחומי ה-HR בחברה
- שותפות עם ההנהלה: השתתפות בישיבות הנהלה שבועיות ובניית תוכנית גיוס לקו הייצור החדש יחד עם המנכ"ל
- גיוס עובדים לכל המחלקות, ומדידת תחלופה וזמן גיוס עם הצגת נתונים להנהלה אחת לרבעון; זמן הגיוס ירד מכ-45 לכ-30 יום
- ליווי עובדים ומנהלים, טיפול בשכר, נוכחות ורווחה, וניהול שימועים וסיום העסקה

Honesty flags: none
Skills moved to "add only if true": none

**Without answers** (summary): מנהלת משאבי אנוש בחברת תעשיית מתכת המונה 300 עובדים, עם ניסיון קודם בגיוס בחברת השמה לתעשייה ולוגיסטיקה. אחראית על מכלול תחום משאבי האנוש: גיוס, שכר ונוכחות, רווחה, ליווי עובדים ומנהלים וטיפול בשימועים וסיום העסקה. בעלת תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות.

Honesty flags: none
