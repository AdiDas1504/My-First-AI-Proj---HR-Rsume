"""
Tests for output generation: report_generator, resume_tailor, and output_writer.

File-writing tests use monkeypatch.chdir(tmp_path) so the hardcoded
Path("output") in production functions resolves inside pytest's temp
directory instead of the real project output/ folder.
"""

import pytest
from pathlib import Path

from src.report_generator import (
    classify_fit_score,
    generate_recommendation,
    generate_fit_report,
)
from src.resume_tailor import (
    generate_tailoring_plan,
    generate_tailored_resume_draft,
)
from src.output_writer import (
    build_text_report,
    save_text_report,
    save_word_report,
    save_tailored_resume_text,
    save_tailored_resume_word,
)


# ── Shared fake data ───────────────────────────────────────────────────────────

_ANALYSIS_HIGH = {
    "fit_score": 80,
    "matched_keywords": ["python", "sql", "communication"],
    "missing_keywords": ["agile"],
}

_ANALYSIS_LOW = {
    "fit_score": 20,
    "matched_keywords": [],
    "missing_keywords": ["python", "sql", "agile", "leadership"],
}

_RESUME_TEXT = (
    "Jane Doe\n"
    "Software Engineer with 5 years of experience.\n"
    "Skills: Python, SQL, data analysis.\n"
)

_JOB_TEXT = (
    "We are looking for a Software Engineer.\n"
    "Requirements: Python, SQL, communication, agile.\n"
)

_FAKE_REPORT = {
    "fit_score": 80,
    "fit_level": "High match",
    "recommendation": "Strong match — tailor and apply.",
    "matched_keywords": ["python", "sql"],
    "missing_keywords": ["agile"],
    "improvement_tips": ["Emphasize Python and SQL experience."],
}

_FAKE_PLAN = {
    "priority": "High priority: tailor and apply.",
    "summary_suggestion": "Emphasize Python and SQL.",
    "missing_keyword_suggestions": ["Consider adding 'agile' only if true."],
    "bullet_guidelines": ["Start bullets with action verbs."],
}


# ── 1. classify_fit_score ──────────────────────────────────────────────────────

class TestClassifyFitScore:
    def test_high_match_at_75(self):
        assert classify_fit_score(75) == "High match"

    def test_high_match_above_75(self):
        assert classify_fit_score(90) == "High match"

    def test_medium_match_at_50(self):
        assert classify_fit_score(50) == "Medium match"

    def test_medium_match_below_75(self):
        assert classify_fit_score(74) == "Medium match"

    def test_low_medium_match_at_30(self):
        assert classify_fit_score(30) == "Low-medium match"

    def test_low_medium_match_below_50(self):
        assert classify_fit_score(49) == "Low-medium match"

    def test_low_match_below_30(self):
        assert classify_fit_score(10) == "Low match"

    def test_low_match_at_zero(self):
        assert classify_fit_score(0) == "Low match"


# ── 2. generate_recommendation ────────────────────────────────────────────────

class TestGenerateRecommendation:
    def test_high_score_returns_non_empty_string(self):
        result = generate_recommendation(80)
        assert isinstance(result, str) and len(result) > 10

    def test_medium_score_returns_non_empty_string(self):
        result = generate_recommendation(60)
        assert isinstance(result, str) and len(result) > 10

    def test_low_medium_score_returns_non_empty_string(self):
        result = generate_recommendation(35)
        assert isinstance(result, str) and len(result) > 10

    def test_low_score_returns_non_empty_string(self):
        result = generate_recommendation(10)
        assert isinstance(result, str) and len(result) > 10


# ── 3. generate_fit_report ────────────────────────────────────────────────────

class TestGenerateFitReport:
    def test_returns_dict(self):
        assert isinstance(generate_fit_report(_ANALYSIS_HIGH), dict)

    def test_all_required_keys_present(self):
        report = generate_fit_report(_ANALYSIS_HIGH)
        required = {
            "fit_score", "fit_level", "recommendation",
            "matched_keywords", "missing_keywords", "improvement_tips",
        }
        assert required.issubset(report.keys())

    def test_fit_score_preserved(self):
        assert generate_fit_report(_ANALYSIS_HIGH)["fit_score"] == 80

    def test_high_score_gives_high_match(self):
        assert generate_fit_report(_ANALYSIS_HIGH)["fit_level"] == "High match"

    def test_low_score_gives_low_match(self):
        assert generate_fit_report(_ANALYSIS_LOW)["fit_level"] == "Low match"

    def test_matched_keywords_forwarded(self):
        report = generate_fit_report(_ANALYSIS_HIGH)
        assert report["matched_keywords"] == _ANALYSIS_HIGH["matched_keywords"]

    def test_missing_keywords_forwarded(self):
        report = generate_fit_report(_ANALYSIS_HIGH)
        assert report["missing_keywords"] == _ANALYSIS_HIGH["missing_keywords"]

    def test_improvement_tips_is_non_empty_list(self):
        report = generate_fit_report(_ANALYSIS_HIGH)
        assert isinstance(report["improvement_tips"], list)
        assert len(report["improvement_tips"]) > 0

    def test_recommendation_is_non_empty_string(self):
        report = generate_fit_report(_ANALYSIS_HIGH)
        assert isinstance(report["recommendation"], str)
        assert len(report["recommendation"]) > 0


# ── 4. generate_tailoring_plan ────────────────────────────────────────────────

class TestGenerateTailoringPlan:
    def test_returns_dict(self):
        assert isinstance(generate_tailoring_plan(_ANALYSIS_HIGH), dict)

    def test_all_required_keys_present(self):
        plan = generate_tailoring_plan(_ANALYSIS_HIGH)
        required = {
            "priority", "summary_suggestion",
            "missing_keyword_suggestions", "bullet_guidelines",
        }
        assert required.issubset(plan.keys())

    def test_high_score_gives_high_priority(self):
        plan = generate_tailoring_plan(_ANALYSIS_HIGH)
        assert "High priority" in plan["priority"]

    def test_low_score_gives_low_priority(self):
        plan = generate_tailoring_plan(_ANALYSIS_LOW)
        assert "Low priority" in plan["priority"]

    def test_bullet_guidelines_non_empty_list(self):
        plan = generate_tailoring_plan(_ANALYSIS_HIGH)
        assert isinstance(plan["bullet_guidelines"], list)
        assert len(plan["bullet_guidelines"]) > 0

    def test_missing_keyword_suggestions_reference_missing_keywords(self):
        plan = generate_tailoring_plan(_ANALYSIS_LOW)
        suggestions_text = " ".join(plan["missing_keyword_suggestions"])
        for kw in _ANALYSIS_LOW["missing_keywords"]:
            assert kw in suggestions_text

    def test_summary_suggestion_non_empty_string(self):
        plan = generate_tailoring_plan(_ANALYSIS_HIGH)
        assert isinstance(plan["summary_suggestion"], str)
        assert len(plan["summary_suggestion"]) > 0

    def test_no_missing_keywords_produces_empty_suggestions(self):
        analysis = {"fit_score": 80, "matched_keywords": ["python"], "missing_keywords": []}
        plan = generate_tailoring_plan(analysis)
        assert plan["missing_keyword_suggestions"] == []


# ── 5. generate_tailored_resume_draft ─────────────────────────────────────────

class TestGenerateTailoredResumeDraft:
    def _plan(self, analysis):
        return generate_tailoring_plan(analysis)

    def test_returns_string(self):
        draft = generate_tailored_resume_draft(_RESUME_TEXT, _ANALYSIS_HIGH, self._plan(_ANALYSIS_HIGH))
        assert isinstance(draft, str)

    def test_non_empty(self):
        draft = generate_tailored_resume_draft(_RESUME_TEXT, _ANALYSIS_HIGH, self._plan(_ANALYSIS_HIGH))
        assert len(draft) > 0

    def test_contains_original_resume_text(self):
        draft = generate_tailored_resume_draft(_RESUME_TEXT, _ANALYSIS_HIGH, self._plan(_ANALYSIS_HIGH))
        assert _RESUME_TEXT in draft

    def test_contains_honesty_warning(self):
        draft = generate_tailored_resume_draft(_RESUME_TEXT, _ANALYSIS_HIGH, self._plan(_ANALYSIS_HIGH))
        assert "invent" in draft.lower() or "honesty" in draft.lower()

    def test_contains_add_only_if_true_language(self):
        draft = generate_tailored_resume_draft(_RESUME_TEXT, _ANALYSIS_HIGH, self._plan(_ANALYSIS_HIGH))
        assert "only if" in draft.lower()

    def test_works_with_no_matched_keywords(self):
        plan = self._plan(_ANALYSIS_LOW)
        draft = generate_tailored_resume_draft(_RESUME_TEXT, _ANALYSIS_LOW, plan)
        assert isinstance(draft, str) and len(draft) > 0


# ── 6. build_text_report (pure, no file I/O) ──────────────────────────────────

class TestBuildTextReport:
    def test_returns_non_empty_string(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert isinstance(result, str) and len(result) > 0

    def test_contains_fit_score(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert "80" in result

    def test_contains_fit_level(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert "High match" in result

    def test_contains_recommendation(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert _FAKE_REPORT["recommendation"] in result

    def test_contains_matched_keyword(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert "python" in result

    def test_contains_missing_keyword(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert "agile" in result

    def test_contains_resume_text_preview(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert _RESUME_TEXT[:40] in result

    def test_contains_job_text_preview(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert _JOB_TEXT[:40] in result

    def test_contains_honesty_disclaimer(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert "invent" in result.lower()

    def test_contains_tailoring_plan_priority(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert _FAKE_PLAN["priority"] in result

    def test_contains_bullet_guidelines(self):
        result = build_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert _FAKE_PLAN["bullet_guidelines"][0] in result


# ── 7. save_text_report ───────────────────────────────────────────────────────

class TestSaveTextReport:
    def test_returns_string_path(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert isinstance(path, str)

    def test_file_has_txt_extension(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert path.endswith(".txt")

    def test_file_exists(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert Path(path).exists()

    def test_file_is_non_empty(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert Path(path).stat().st_size > 0

    def test_file_content_is_readable_utf8(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        content = Path(path).read_text(encoding="utf-8")
        assert len(content) > 0

    def test_file_content_contains_fit_score(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        content = Path(path).read_text(encoding="utf-8")
        assert "80" in content

    def test_filename_contains_fit_report_prefix(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_text_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert "fit_report" in Path(path).name


# ── 8. save_word_report ───────────────────────────────────────────────────────

class TestSaveWordReport:
    def test_returns_string_path(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_word_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert isinstance(path, str)

    def test_file_has_docx_extension(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_word_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert path.endswith(".docx")

    def test_file_exists(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_word_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert Path(path).exists()

    def test_file_is_non_empty(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_word_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert Path(path).stat().st_size > 0

    def test_filename_contains_fit_report_prefix(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_word_report(_FAKE_REPORT, _FAKE_PLAN, _RESUME_TEXT, _JOB_TEXT)
        assert "fit_report" in Path(path).name


# ── 9. save_tailored_resume_text ──────────────────────────────────────────────

class TestSaveTailoredResumeText:
    _DRAFT = "TAILORED RESUME\n\nSome tailored content here.\n- Bullet point one.\n"

    def test_returns_string_path(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_text(self._DRAFT)
        assert isinstance(path, str)

    def test_file_has_txt_extension(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_text(self._DRAFT)
        assert path.endswith(".txt")

    def test_file_exists(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_text(self._DRAFT)
        assert Path(path).exists()

    def test_file_is_non_empty(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_text(self._DRAFT)
        assert Path(path).stat().st_size > 0

    def test_file_content_matches_input(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_text(self._DRAFT)
        assert Path(path).read_text(encoding="utf-8") == self._DRAFT

    def test_filename_contains_tailored_resume_prefix(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_text(self._DRAFT)
        assert "tailored_resume" in Path(path).name


# ── 10. save_tailored_resume_word ─────────────────────────────────────────────

class TestSaveTailoredResumeWord:
    _DRAFT = "TAILORED RESUME\n\nParagraph one.\n\nParagraph two.\n- Bullet one.\n"

    def test_returns_string_path(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_word(self._DRAFT)
        assert isinstance(path, str)

    def test_file_has_docx_extension(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_word(self._DRAFT)
        assert path.endswith(".docx")

    def test_file_exists(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_word(self._DRAFT)
        assert Path(path).exists()

    def test_file_is_non_empty(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_word(self._DRAFT)
        assert Path(path).stat().st_size > 0

    def test_filename_contains_tailored_resume_prefix(self, tmp_path, monkeypatch):
        monkeypatch.chdir(tmp_path)
        path = save_tailored_resume_word(self._DRAFT)
        assert "tailored_resume" in Path(path).name
