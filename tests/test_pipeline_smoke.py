"""
Smoke tests for the run_analysis pipeline in streamlit_app.py.

Import strategy
---------------
streamlit_app.py executes page-level Streamlit calls at module scope
(st.set_page_config, st.columns, st.markdown, st.button, etc.).
We replace the 'streamlit' module in sys.modules with a configured stub
*before* importing streamlit_app, so all those calls become safe no-ops.

The stub is set up so that:
- session_state.analysis_results = None  →  _on_results = False  →  upload screen renders
- st.button()  = False                   →  analyze handler never fires
- st.file_uploader() = None              →  no save_uploaded_file is called
- st.columns([...]) returns a list of
  the correct length                     →  tuple-unpacking in the module works

Every domain dependency used by run_analysis is monkeypatched per-test via
pytest's monkeypatch fixture so tests are fast, deterministic, and require
no internet, no real files, and no Claude API.
"""

import sys
from unittest.mock import MagicMock

# ── 1. Build the streamlit stub ───────────────────────────────────────────────


class _FakeSessionState:
    """
    Minimal session_state shim used during module-level init.

    Class attributes hold the default values so that when the module does:
        if "analysis_results" not in st.session_state: ...
    __contains__ returns True (key already present → block is skipped) and
    the attribute reads back as None, giving _on_results = False.
    """

    analysis_results = None
    job_label = ""

    def __contains__(self, key: str) -> bool:  # "key" in session_state
        return hasattr(self, key)


def _columns_side_effect(spec, **kwargs):
    """Return a plain list of MagicMocks matching the length of spec."""
    length = len(spec) if hasattr(spec, "__len__") else int(spec)
    return [MagicMock() for _ in range(length)]


_st = MagicMock()
_st.session_state             = _FakeSessionState()
_st.button.return_value       = False   # Analyze button is never clicked
_st.file_uploader.return_value = None   # No files uploaded at import time
_st.text_input.return_value   = ""      # No URL entered at import time
_st.columns.side_effect       = _columns_side_effect

# Replace (or override) streamlit in the module cache, then import app
sys.modules.pop("streamlit_app", None)  # ensure a fresh import
sys.modules["streamlit"] = _st

import streamlit_app  # noqa: E402  – must come after sys.modules patch
from streamlit_app import run_analysis  # noqa: E402

# ── 2. Shared fake data ───────────────────────────────────────────────────────

_RESUME_TEXT = (
    "Jane Doe — Software Engineer\n\n"
    "Led product development using Python and SQL.\n"
    "Managed roadmap and stakeholder communication.\n"
)

_JOB_TEXT = (
    "Requirements\n"
    "5+ years product management.\n"
    "Proficiency in Python, SQL, agile.\n"
    "Strong communication skills.\n"
)

_FAKE_JOB_DETAILS = {
    "source_type": "url",
    "raw_text": _JOB_TEXT,
    "raw_text_length": len(_JOB_TEXT),
    "canonical_requirements": _JOB_TEXT,
    "canonical_requirements_length": len(_JOB_TEXT),
    "ocr_language": None,
    "warnings": [],
}

_FAKE_ANALYSIS = {
    "fit_score": 72,
    "matched_keywords": ["python", "sql", "communication"],
    "missing_keywords": ["agile"],
}

_FAKE_REPORT = {
    "fit_score": 72,
    "fit_level": "Strong Match",
    "recommendation": "Highlight agile experience to improve your score.",
    "matched_keywords": ["python", "sql", "communication"],
    "missing_keywords": ["agile"],
    "improvement_tips": ["Add agile methodology keywords to your bullet points."],
}

_FAKE_TAILORING_PLAN = {
    "priority": "High priority: tailor and apply.",
    "summary_suggestion": "Emphasise Python and SQL experience.",
    "missing_keyword_suggestions": ["Consider adding 'agile' only if true."],
    "bullet_guidelines": ["Start bullet points with action verbs."],
}

_FAKE_PATHS = {
    "text_report":   "/fake/output/report.txt",
    "word_report":   "/fake/output/report.docx",
    "tailored_txt":  "/fake/output/tailored.txt",
    "tailored_word": "/fake/output/tailored.docx",
}


# ── 3. Helper: patch every run_analysis dependency ───────────────────────────

_DISABLED_DB = {"status": "disabled", "id": None}


def _patch_all(monkeypatch):
    """Apply all required monkeypatches to streamlit_app's namespace."""
    monkeypatch.setattr(streamlit_app, "read_resume",
                        lambda path: _RESUME_TEXT)
    monkeypatch.setattr(streamlit_app, "read_job_post_details",
                        lambda src: _FAKE_JOB_DETAILS)
    monkeypatch.setattr(streamlit_app, "analyze_match",
                        lambda resume_text, job_text: _FAKE_ANALYSIS)
    monkeypatch.setattr(streamlit_app, "generate_fit_report",
                        lambda analysis: _FAKE_REPORT)
    monkeypatch.setattr(streamlit_app, "generate_tailoring_plan",
                        lambda analysis: _FAKE_TAILORING_PLAN)
    monkeypatch.setattr(streamlit_app, "generate_tailored_resume_draft",
                        lambda resume_text, analysis, tailoring_plan: "Draft text.")
    monkeypatch.setattr(streamlit_app, "save_text_report",
                        lambda **kw: _FAKE_PATHS["text_report"])
    monkeypatch.setattr(streamlit_app, "save_word_report",
                        lambda **kw: _FAKE_PATHS["word_report"])
    monkeypatch.setattr(streamlit_app, "save_tailored_resume_text",
                        lambda text: _FAKE_PATHS["tailored_txt"])
    monkeypatch.setattr(streamlit_app, "save_tailored_resume_word",
                        lambda text: _FAKE_PATHS["tailored_word"])
    # database functions — disabled by default in tests (no Supabase credentials)
    monkeypatch.setattr(streamlit_app, "save_analysis_run",
                        lambda **kw: _DISABLED_DB)
    monkeypatch.setattr(streamlit_app, "save_analysis_result",
                        lambda **kw: _DISABLED_DB)
    monkeypatch.setattr(streamlit_app, "save_usage_event",
                        lambda **kw: _DISABLED_DB)
    monkeypatch.setattr(streamlit_app, "save_app_error",
                        lambda **kw: _DISABLED_DB)


# ── 4. Test classes ───────────────────────────────────────────────────────────

class TestRunAnalysisReturnStructure:
    """run_analysis must return a complete dict the UI can read without error."""

    def test_completes_without_raising(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert result is not None

    def test_returns_a_dict(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert isinstance(result, dict)

    def test_all_ui_keys_are_present(self, monkeypatch):
        """Every key read by the results screen must exist in the dict."""
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        required_keys = {
            "resume_text", "job_text", "job_details",
            "analysis", "report", "tailoring_plan",
            "text_report_path", "word_report_path",
            "tailored_txt_path", "tailored_word_path",
            "claude_word_path", "claude_safety_review",
        }
        missing = required_keys - result.keys()
        assert not missing, f"Keys missing from result dict: {missing}"

    def test_output_paths_are_non_empty_strings(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        for key in ("text_report_path", "word_report_path",
                    "tailored_txt_path", "tailored_word_path"):
            assert isinstance(result[key], str), f"{key} must be a string"
            assert result[key].strip(), f"{key} must not be blank"


class TestRunAnalysisDataFlow:
    """Verify that data flows correctly between pipeline stages."""

    def test_resume_text_comes_from_read_resume(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert result["resume_text"] == _RESUME_TEXT

    def test_job_text_equals_canonical_requirements(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert result["job_text"] == _FAKE_JOB_DETAILS["canonical_requirements"]

    def test_analyze_match_receives_resume_text(self, monkeypatch):
        captured = {}

        def spy(resume_text, job_text):
            captured["resume_text"] = resume_text
            captured["job_text"]    = job_text
            return _FAKE_ANALYSIS

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "analyze_match", spy)

        run_analysis("/fake/resume.pdf", "https://example.com/job", False)

        assert captured["resume_text"] == _RESUME_TEXT

    def test_analyze_match_receives_canonical_job_text(self, monkeypatch):
        captured = {}

        def spy(resume_text, job_text):
            captured["resume_text"] = resume_text
            captured["job_text"]    = job_text
            return _FAKE_ANALYSIS

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "analyze_match", spy)

        run_analysis("/fake/resume.pdf", "https://example.com/job", False)

        assert captured["job_text"] == _FAKE_JOB_DETAILS["canonical_requirements"]

    def test_report_is_from_generate_fit_report(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert result["report"] == _FAKE_REPORT

    def test_tailoring_plan_is_from_generate_tailoring_plan(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert result["tailoring_plan"] == _FAKE_TAILORING_PLAN

    def test_job_details_forwarded_intact(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert result["job_details"]["source_type"]            == "url"
        assert result["job_details"]["canonical_requirements"] == _JOB_TEXT


class TestRunAnalysisClaudeGuard:
    """Claude functions must not be called when use_claude=False."""

    def test_generate_claude_resume_not_called(self, monkeypatch):
        call_count = {"n": 0}

        def must_not_run(**kw):
            call_count["n"] += 1
            return "should not reach here"

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "generate_claude_tailored_resume", must_not_run)

        run_analysis("/fake/resume.pdf", "https://example.com/job", use_claude=False)

        assert call_count["n"] == 0, (
            "generate_claude_tailored_resume was invoked with use_claude=False"
        )

    def test_validate_ai_output_not_called(self, monkeypatch):
        call_count = {"n": 0}

        def must_not_run(text):
            call_count["n"] += 1
            return {}

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "validate_ai_output", must_not_run)

        run_analysis("/fake/resume.pdf", "https://example.com/job", use_claude=False)

        assert call_count["n"] == 0, (
            "validate_ai_output was invoked with use_claude=False"
        )

    def test_claude_word_path_is_none_when_disabled(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", use_claude=False)
        assert result["claude_word_path"] is None

    def test_claude_safety_review_is_none_when_disabled(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", use_claude=False)
        assert result["claude_safety_review"] is None


class TestRunAnalysisDatabasePersistence:
    """Database save functions are called on success and do not crash if disabled."""

    def test_save_analysis_run_is_called(self, monkeypatch):
        called = {}

        def spy(**kw):
            called.update(kw)
            return _DISABLED_DB

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "save_analysis_run", spy)
        run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert called, "save_analysis_run was not called after a successful analysis"

    def test_save_analysis_result_is_called(self, monkeypatch):
        called = {}

        def spy(**kw):
            called.update(kw)
            return _DISABLED_DB

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "save_analysis_result", spy)
        run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert called, "save_analysis_result was not called after a successful analysis"

    def test_save_usage_event_called_with_analysis_completed(self, monkeypatch):
        captured = {}

        def spy(**kw):
            captured.update(kw)
            return _DISABLED_DB

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "save_usage_event", spy)
        run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert captured.get("event_name") == "analysis_completed"

    def test_fit_score_passed_to_save_analysis_run(self, monkeypatch):
        captured = {}

        def spy(**kw):
            captured.update(kw)
            return _DISABLED_DB

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "save_analysis_run", spy)
        run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert captured.get("fit_score") == _FAKE_REPORT["fit_score"]

    def test_no_resume_text_in_save_analysis_run(self, monkeypatch):
        captured = {}

        def spy(**kw):
            captured.update(kw)
            return _DISABLED_DB

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "save_analysis_run", spy)
        run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert "resume_text" not in captured, "Full resume text must never be stored"

    def test_result_unchanged_when_database_disabled(self, monkeypatch):
        _patch_all(monkeypatch)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert result["report"] == _FAKE_REPORT
        assert result["tailoring_plan"] == _FAKE_TAILORING_PLAN

    def test_result_unchanged_when_database_raises(self, monkeypatch):
        def explode(**kw):
            raise RuntimeError("Supabase is down")

        _patch_all(monkeypatch)
        monkeypatch.setattr(streamlit_app, "save_analysis_run", explode)
        result = run_analysis("/fake/resume.pdf", "https://example.com/job", False)
        assert result is not None
        assert result["report"] == _FAKE_REPORT
