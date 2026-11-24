# JobFit quality evaluation

Date: 2026-11-24T12:21:26.076Z · scan reps: 2

**Checks passed: 10/17**

- ✅ scan: separation between best and poor fits ≥ 45 (68)
- ❌ scan: repeated runs differ by ≤ 12 points (25)
- ✅ scan: ≥ 80% of pairs inside expected band (22/24)
- ✅ scan: best candidate ranks first for hrManagerJob (hrManager)
- ✅ scan: best candidate ranks first for accountantJob (accountant)
- ✅ scan: best candidate ranks first for projectManagerJob (projectManager)
- ✅ scan: best candidate ranks first for frontendJob (juniorDev)
- ✅ analysis: ≥ 80% of pairs inside expected band (8/10)
- ❌ HR case: role research covers key expectations beyond the ad (0/5 topics)
- ❌ HR case: at least 3 expectations marked as beyond the ad (1)
- ❌ HR case: 3-7 questions (0)
- ❌ HR case: asked about business partnering, metrics and team management (0/3 matched)
- ❌ HR case: answers show up in the resume (0/2)
- ✅ HR case: answers are rewritten professionally, not pasted
- ❌ HR case: no invented facts with answers (2 flags)
- ✅ HR case: no invented facts without answers (0 flags)
- ✅ HR case: without answers, no metrics it was never given

## 1. Free scan (Haiku): score matrix

| job \ resume | hrManager | hrManagerPlain | hrGeneralist | accountant | projectManager | juniorDev |
|---|---|---|---|---|---|---|
| hrManagerJob | 89 / 86  | 73 / 68  | 23 / 20 ⚠️ (25-60) | 3 / 2  | 8 / 9  | 0 / 0  |
| accountantJob | 17 / 10  | 5 / 2  | 1 / 2  | 87 / 90  | 27 / 23  | 0 / 0  |
| projectManagerJob | 23 / 26  | 8 / 12  | 21 / 19  | 16 / 16  | 77 / 76  | 5 / 7  |
| frontendJob | 0 / 0  | 0 / 0  | 0 / 0  | 0 / 0  | 3 / 4  | 62 / 37 ⚠️ (45-80) |

- Best-fit average: **76** · poor-fit average: **7** · separation: **68**
- Spread (standard deviation of all scores): **29**
- Largest change between repeated runs of the same pair: **25** points
- Pairs inside their expected band: **22/24**

## 2. Full analysis (Sonnet)

| pair | expected | score | alignment | seniority | requirements (met/partial/missing) | unverified quotes |
|---|---|---|---|---|---|---|
| hrManagerJob / hrManager | 75-100 | 92 | same | fits | 7/2/0 | 0 |
| hrManagerJob / hrManagerPlain | 60-95 | 66 | same | fits | 4/5/0 | 0 |
| hrManagerJob / hrGeneralist | 25-60 | 15 ⚠️ | adjacent | far_below | 0/5/4 | 0 |
| hrManagerJob / projectManager | 5-40 | 12 | transferable | far_below | 0/5/4 | 0 |
| accountantJob / accountant | 75-100 | 87 | same | fits | 8/2/0 | 0 |
| accountantJob / hrManager | 0-25 | 3 | unrelated | far_below | 1/1/8 | 0 |
| projectManagerJob / projectManager | 75-100 | 83 | same | fits | 8/1/1 | 0 |
| projectManagerJob / accountant | 0-35 | 18 | transferable | one_below | 1/5/4 | 0 |
| frontendJob / juniorDev | 45-80 | 38 ⚠️ | same | one_below | 2/5/2 | 0 |
| frontendJob / projectManager | 0-25 | 4 | unrelated | far_below | 0/3/5 | 0 |

## 3. HR case: research and questions

Resume: a real HR manager whose resume lists tasks only. Ad: does not mention business partnering or metrics.

**What the engine found the role needs:**
- ניהול מחלקה וצוות HR (in the ad, hidden)
- x (beyond the ad, absent)

**Questions it asked:**

## 4. HR case: writing

**With the answers** (summary): מנהלת משאבי אנוש בחברת ייצור תעשייתית המונה 300 עובדים, עם תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות. ניסיון בגיוס לכל המחלקות, בטיפול בשכר, נוכחות ורווחה ובליווי עובדים ומנהלים, לצד רקע קודם בגיוס בחברת השמה לתעשייה ולוגיסטיקה.

Most recent role:
- אחריות על תחום משאבי האנוש בחברת ייצור בת 300 עובדים
- גיוס עובדים לכל המחלקות בארגון
- טיפול בשכר, נוכחות ורווחת העובדים
- ליווי עובדים ומנהלים, כולל שימועים וסיום העסקה

Honesty flags: גיוס והשמה (המיומנות הזו לא מופיעה בקורות החיים המקוריים); עבודה בסביבת ייצור (המיומנות הזו לא מופיעה בקורות החיים המקוריים)

**Without answers** (summary): מנהלת משאבי אנוש בחברת תעשיית מתכת המונה 300 עובדים, עם רקע קודם בגיוס לחברות תעשייה ולוגיסטיקה. אחראית על מכלול תחום משאבי האנוש: גיוס, שכר, נוכחות ורווחה, ליווי מנהלים ועובדים וטיפול בשימועים וסיום העסקה. בעלת תואר ראשון בניהול משאבי אנוש ומדעי ההתנהגות.

Honesty flags: none
