# JobFit quality evaluation

Date: 2026-11-24T12:33:31.668Z · scan reps: 2

**Checks passed: 17/17**

- ✅ scan: separation between best and poor fits ≥ 45 (69)
- ✅ scan: repeated runs differ by ≤ 12 points (8)
- ✅ scan: ≥ 80% of pairs inside expected band (23/24)
- ✅ scan: best candidate ranks first for hrManagerJob (hrManager)
- ✅ scan: best candidate ranks first for accountantJob (accountant)
- ✅ scan: best candidate ranks first for projectManagerJob (projectManager)
- ✅ scan: best candidate ranks first for frontendJob (juniorDev)
- ✅ analysis: ≥ 80% of pairs inside expected band (9/10)
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
| hrManagerJob | 88 / 88  | 72 / 75  | 22 / 14 ⚠️ (25-60) | 3 / 7  | 13 / 10  | 0 / 0  |
| accountantJob | 10 / 15  | 6 / 5  | 2 / 2  | 89 / 89  | 15 / 17  | 0 / 0  |
| projectManagerJob | 28 / 21  | 13 / 11  | 17 / 22  | 16 / 18  | 77 / 85  | 5 / 6  |
| frontendJob | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 0  | 49 / 48  |

- Best-fit average: **77** · poor-fit average: **7** · separation: **69**
- Spread (standard deviation of all scores): **29**
- Largest change between repeated runs of the same pair: **8** points
- Pairs inside their expected band: **23/24**

## 2. Full analysis (Sonnet)

| pair | expected | score | alignment | seniority | requirements (met/partial/missing) | unverified quotes |
|---|---|---|---|---|---|---|
| hrManagerJob / hrManager | 75-100 | 88 | same | fits | 6/2/0 | 0 |
| hrManagerJob / hrManagerPlain | 60-95 | 77 | same | fits | 5/4/0 | 0 |
| hrManagerJob / hrGeneralist | 25-60 | 24 ⚠️ | adjacent | far_below | 1/5/3 | 0 |
| hrManagerJob / projectManager | 5-40 | 9 | transferable | far_below | 1/3/5 | 0 |
| accountantJob / accountant | 75-100 | 86 | same | fits | 7/2/0 | 0 |
| accountantJob / hrManager | 0-25 | 5 | unrelated | fits | 1/1/7 | 0 |
| projectManagerJob / projectManager | 75-100 | 85 | same | fits | 7/2/0 | 0 |
| projectManagerJob / accountant | 0-35 | 18 | transferable | one_below | 1/5/4 | 0 |
| frontendJob / juniorDev | 45-80 | 56 | same | fits | 3/4/2 | 0 |
| frontendJob / projectManager | 0-25 | 1 | unrelated | far_below | 0/2/5 | 0 |

## 3. HR case: research and questions

Resume: a real HR manager whose resume lists tasks only. Ad: does not mention business partnering or metrics.

**What the engine found the role needs:**
- ניהול מחלקה וצוות HR (in the ad, hidden)
- דיני עבודה ויחסי עבודה (in the ad, hidden)
- גיוס, קליטה ושימור (in the ad, hidden)
- שותפות עסקית עם ההנהלה (beyond the ad, absent)
- מדדי HR והשפעה (beyond the ad, absent)
- ניסיון בסביבת ייצור ועובדי שטח (in the ad, shown)
- שכר ומערכות HR (beyond the ad, hidden)
- הדרכה, פיתוח ותרבות ארגונית (beyond the ad, absent)
- הישגים מדידים (beyond the ad, absent)

**Questions it asked:**
- יש לך עובדים שכפופים אליך ב-HR? כמה, ומה התפקידים שלהם?
- עבדת בפועל מול דיני עבודה, כמו שימועים, התראות, פיטורים, תביעות או עם עורך דין חיצוני? תן/י דוגמה קצרה.
- עשית משהו בנושא קליטת עובדים חדשים או שימור, כמו אונבורדינג, סקרי שביעות רצון או ראיונות עזיבה?
- את מודדת משהו בתחום, כמו תחלופה, זמן גיוס או כמה גייסת בשנה? יש מספר שזכור לך?
- יצא לך לעבוד ישירות מול ההנהלה על יעדים עסקיים או תכנון כוח אדם? אם כן, על מה?
- באילו מערכות שכר, נוכחות או HR את עובדת? ואת מנהלת בעצמך את השכר או עם חברה חיצונית?
- הובלת הדרכות, פרויקט רווחה או שינוי בארגון שאת גאה בו?

## 4. HR case: writing

**With the answers** (summary): מנהלת משאבי אנוש בחברת ייצור המונה 300 עובדים, בעלת תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות. מנהלת צוות HR של שתי עובדות, משתתפת בישיבות הנהלה ועובדת צמוד עם המנכ"ל. מובילה גיוס, ליווי מנהלים ועובדים ויחסי עבודה, ומציגה להנהלה מדדי תחלופה וזמן גיוס.

Most recent role:
- ניהול תחום משאבי האנוש בחברת ייצור, כולל צוות של שתי עובדות: רכזת גיוס ומתאמת שכר
- שותפות עם ההנהלה: השתתפות בישיבות הנהלה שבועיות ועבודה צמודה עם המנכ"ל; בניית תוכנית גיוס לקו הייצור החדש
- גיוס עובדים לכל המחלקות, ומדידת תחלופה וזמן גיוס עם הצגה רבעונית להנהלה; זמן הגיוס ירד מכ-45 לכ-30 יום
- ליווי עובדים ומנהלים, טיפול בשכר, נוכחות ורווחה, וניהול שימועים וסיום העסקה

Honesty flags: none
Skills moved to "add only if true": none

**Without answers** (summary): מנהלת משאבי אנוש בחברת תעשייה של כ-300 עובדים, עם אחריות על מכלול תחום משאבי האנוש: גיוס, שכר, נוכחות ורווחה, וליווי עובדים ומנהלים. בעלת תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות וניסיון קודם בגיוס לחברות תעשייה ולוגיסטיקה.

Honesty flags: none
