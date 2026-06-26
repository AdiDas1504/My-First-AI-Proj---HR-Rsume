"""
Focused tests for extract_canonical_job_requirements.

These tests protect the section-based extraction logic in src/job_reader.py
against regressions in noise removal, section detection, and text trimming.

All tests are deterministic — no internet, no OCR, no files, no Streamlit.
"""

import pytest
from src.job_reader import extract_canonical_job_requirements


# ─── shared fixtures ──────────────────────────────────────────────────────────

HEBREW_PM_JOB = """
מה כולל התפקיד
אסטרטגיה ומפת דרכים / Roadmap
הגדרת אסטרטגיית מוצר ותעדוף פיצ'רים בהתאם לצרכי השוק הגלובלי.

ניהול גלובלי
ניהול ספקים ושותפים בינלאומיים לאורך כל מחזור החיים של המוצר.

מסחרי ופיננסי
אחריות על תמחור, מרג'ין ויעדי הכנסה של קו המוצרים.

ניהול מלאי
ניהול רמות מלאי, תחזיות ביקוש ותיאום עם שרשרת האספקה.

סמכות מקצועית בארגון
ייצוג קו המוצרים מול הנהלה, לקוחות ושותפים אסטרטגיים.

מה אנחנו מחפשים
דרייב ויוזמה
יכולת לקחת בעלות ולהוביל תהליכים מתחילתם ועד סופם.

סקרנות טכנולוגית ועסקית
הבנה מעמיקה של מגמות טכנולוגיות ועסקיות רלוונטיות.

ראש אנליטי
עבודה מבוססת נתונים ויכולת קבלת החלטות בסביבת אי-ודאות.

תקשורת ברמה גבוהה
יכולת לתקשר בבהירות עם בעלי עניין רב-תחומיים.

IT / אבטחה / מתח נמוך
ניסיון בסביבות עם דרישות אבטחה ותשתית IT.

ניסיון קודם בניהול מוצר / רכש בינלאומי
לפחות 3 שנות ניסיון בתפקיד דומה בסביבה גלובלית.

דרישות נוספות
Priority, Monday, Office — שליטה בכלי עבודה אלו תהווה יתרון.
"""

NOISE_AFTER_REQUIREMENTS = """
מה כולל התפקיד
ניהול מוצר מקצה לקצה בסביבה גלובלית.
תעדוף פיצ'רים ועבודה מול ספקים ולקוחות בינלאומיים.

מה אנחנו מחפשים
ניסיון של 3 שנים לפחות בניהול מוצר.
כישורי תקשורת ברמה גבוהה.
ראש אנליטי ויכולת עבודה בסביבת לחץ.

מנתחת את קורות החיים שלך
Jobify
מהם תחומי האחריות
אילו כישורים נדרשים
כיצד תפקיד זה מתאים לך
"""

NOISE_BEFORE_REQUIREMENTS = """
60%
ציון התאמה
חסר ניסיון קודם בניהול מוצר או רכש בינלאומי
חסר ניסיון עם כלים כמו Priority או Monday

הגשת קורות חיים

מה כולל התפקיד
ניהול מוצר מקצה לקצה בסביבה גלובלית.
תעדוף פיצ'רים ועבודה מול ספקים ולקוחות בינלאומיים.

מה אנחנו מחפשים
ניסיון של 3 שנים לפחות בניהול מוצר.
כישורי תקשורת ברמה גבוהה.
"""


# ─── Case 1: Hebrew PM job — real requirements are kept ───────────────────────

class TestHebrewPMJobRetainsRequirements:

    def setup_method(self):
        self.result = extract_canonical_job_requirements(HEBREW_PM_JOB)

    def test_returns_non_empty_string(self):
        assert isinstance(self.result, str)
        assert len(self.result) > 50

    def test_retains_role_section_header(self):
        assert "מה כולל התפקיד" in self.result

    def test_retains_roadmap_responsibility(self):
        assert "Roadmap" in self.result or "מפת דרכים" in self.result

    def test_retains_global_management(self):
        assert "ניהול גלובלי" in self.result

    def test_retains_commercial_financial(self):
        assert "מסחרי ופיננסי" in self.result

    def test_retains_inventory_management(self):
        assert "ניהול מלאי" in self.result

    def test_retains_org_authority(self):
        assert "סמכות מקצועית" in self.result

    def test_retains_requirements_section_header(self):
        assert "מה אנחנו מחפשים" in self.result

    def test_retains_drive_initiative(self):
        assert "דרייב" in self.result or "יוזמה" in self.result

    def test_retains_tech_curiosity(self):
        assert "סקרנות טכנולוגית" in self.result

    def test_retains_analytical_thinking(self):
        assert "ראש אנליטי" in self.result

    def test_retains_communication_requirement(self):
        assert "תקשורת" in self.result

    def test_retains_it_security_mention(self):
        assert "IT" in self.result or "אבטחה" in self.result

    def test_retains_product_management_experience(self):
        assert "ניסיון קודם" in self.result or "ניהול מוצר" in self.result

    def test_retains_tool_names(self):
        assert "Priority" in self.result or "Monday" in self.result or "Office" in self.result


# ─── Case 2: Website noise after requirements is stripped ─────────────────────

class TestNoiseAfterRequirementsIsStripped:

    def setup_method(self):
        self.result = extract_canonical_job_requirements(NOISE_AFTER_REQUIREMENTS)

    def test_returns_non_empty_string(self):
        assert isinstance(self.result, str)
        assert len(self.result) > 10

    def test_real_requirements_retained(self):
        assert "ניהול מוצר" in self.result

    def test_jobify_noise_excluded(self):
        assert "Jobify" not in self.result

    def test_resume_analysis_noise_excluded(self):
        assert "מנתחת את קורות החיים" not in self.result

    def test_faq_noise_1_excluded(self):
        assert "מהם תחומי האחריות" not in self.result

    def test_faq_noise_2_excluded(self):
        assert "אילו כישורים נדרשים" not in self.result

    def test_faq_noise_3_excluded(self):
        assert "כיצד תפקיד" not in self.result


# ─── Case 3: UI/match-score noise before requirements is stripped ─────────────

class TestNoiseBeforeRequirementsIsStripped:

    def setup_method(self):
        self.result = extract_canonical_job_requirements(NOISE_BEFORE_REQUIREMENTS)

    def test_returns_non_empty_string(self):
        assert isinstance(self.result, str)
        assert len(self.result) > 10

    def test_real_requirements_retained(self):
        assert "ניהול מוצר" in self.result

    def test_match_score_percentage_excluded(self):
        assert "60%" not in self.result

    def test_match_score_label_excluded(self):
        assert "ציון התאמה" not in self.result

    def test_missing_experience_ui_line_excluded(self):
        assert "חסר ניסיון קודם" not in self.result

    def test_submit_resume_noise_excluded(self):
        assert "הגשת קורות חיים" not in self.result


# ─── Edge cases ───────────────────────────────────────────────────────────────

class TestEdgeCases:

    def test_empty_string_returns_empty(self):
        assert extract_canonical_job_requirements("") == ""

    def test_whitespace_only_returns_empty_or_whitespace(self):
        result = extract_canonical_job_requirements("   \n\n   ")
        assert result.strip() == ""

    def test_pure_noise_returns_minimal_output(self):
        pure_noise = "60%\nציון התאמה\nJobify\nמנתחת את קורות החיים שלך"
        result = extract_canonical_job_requirements(pure_noise)
        assert "Jobify" not in result
        assert "מנתחת את קורות החיים" not in result

    def test_english_only_job_post_not_destroyed(self):
        english_job = (
            "Responsibilities\n"
            "Lead product development across global teams.\n"
            "Define roadmap and prioritise features.\n\n"
            "Requirements\n"
            "3+ years product management experience.\n"
            "Strong analytical and communication skills.\n"
        )
        result = extract_canonical_job_requirements(english_job)
        assert len(result) > 20
        assert "product management" in result.lower() or "requirements" in result.lower()
