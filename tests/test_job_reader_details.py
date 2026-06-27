"""
Tests for read_job_post_details return structure and edge cases.

All tests are deterministic — no internet, no OCR, no real files, no Claude.
Network and file I/O functions are monkeypatched per-test.
"""

import pytest
from unittest.mock import patch, MagicMock

from src.job_reader import read_job_post_details

# ── Shared fixtures ──────────────────────────────────────────────────────────

_GOOD_JOB_TEXT = (
    "Requirements\n"
    "5+ years of product management experience in a fast-paced environment.\n"
    "Proficiency in Python, SQL, and agile methodologies.\n"
    "Strong communication skills and ability to work with senior stakeholders.\n"
    "Experience defining product roadmaps and quarterly key results.\n"
    "Technical background or engineering experience preferred.\n"
    "Ability to lead cross-functional teams effectively and drive alignment.\n"
    "Experience with data analytics and business intelligence tools.\n"
)

_SHORT_JOB_TEXT = "Job title: Software Engineer. Apply now."

_NOISY_JOB_TEXT = (
    "60%\n"
    "ציון התאמה\n"
    "הגשת קורות חיים\n"
    "שמור משרה\n"
    "שתף\n"
    "cookies\n"
    "login\n"
    "sign up\n"
    "home\n"
)


# ── Helpers ──────────────────────────────────────────────────────────────────

EXPECTED_KEYS = {
    "source_type",
    "raw_text",
    "canonical_requirements",
    "raw_text_length",
    "canonical_requirements_length",
    "warnings",
    "ocr_language",
}


def _url_call(monkeypatch, raw_text):
    """
    Patch read_job_from_url and call read_job_post_details with a fake URL.
    Returns the result dict.
    """
    monkeypatch.setattr("src.job_reader.read_job_from_url", lambda url: raw_text)
    return read_job_post_details("https://example.com/job")


def _document_call(raw_text):
    """
    Patch Path and read_job_from_document, call with a fake .docx path.
    Returns the result dict.
    """
    with patch("src.job_reader.read_job_from_document", return_value=raw_text), \
         patch("src.job_reader.Path") as mock_path_cls:
        fake_path = MagicMock()
        fake_path.exists.return_value = True
        fake_path.suffix = ".docx"
        fake_path.__str__ = lambda self: "/fake/job.docx"
        mock_path_cls.return_value = fake_path
        return read_job_post_details("/fake/job.docx")


# ── 1. Return structure — URL source ─────────────────────────────────────────

class TestReturnStructureUrlSource:
    """read_job_post_details must return a dict with all expected keys."""

    def test_all_keys_present(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        missing = EXPECTED_KEYS - result.keys()
        assert not missing, f"Missing keys: {missing}"

    def test_source_type_is_url(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        assert result["source_type"] == "url"

    def test_raw_text_equals_input(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        assert result["raw_text"] == _GOOD_JOB_TEXT

    def test_raw_text_length_matches_raw_text(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        assert result["raw_text_length"] == len(result["raw_text"])

    def test_canonical_requirements_is_string(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        assert isinstance(result["canonical_requirements"], str)

    def test_canonical_requirements_length_matches_value(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        assert result["canonical_requirements_length"] == len(
            result["canonical_requirements"]
        )

    def test_warnings_is_list(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        assert isinstance(result["warnings"], list)

    def test_ocr_language_is_none_for_url(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        assert result["ocr_language"] is None

    def test_no_warnings_for_rich_job_text(self, monkeypatch):
        result = _url_call(monkeypatch, _GOOD_JOB_TEXT)
        assert result["warnings"] == []


# ── 2. Return structure — document source ────────────────────────────────────

class TestReturnStructureDocumentSource:
    """source_type must be 'document' when reading from a .docx path."""

    def test_source_type_is_document(self):
        result = _document_call(_GOOD_JOB_TEXT)
        assert result["source_type"] == "document"

    def test_all_keys_present(self):
        result = _document_call(_GOOD_JOB_TEXT)
        missing = EXPECTED_KEYS - result.keys()
        assert not missing, f"Missing keys: {missing}"

    def test_ocr_language_is_none_for_document(self):
        result = _document_call(_GOOD_JOB_TEXT)
        assert result["ocr_language"] is None

    def test_raw_text_length_is_correct(self):
        result = _document_call(_GOOD_JOB_TEXT)
        assert result["raw_text_length"] == len(_GOOD_JOB_TEXT)


# ── 3. Short or noisy job text ───────────────────────────────────────────────

class TestShortJobText:
    """Short extracted text must not crash; warnings must be emitted."""

    def test_does_not_raise(self, monkeypatch):
        _url_call(monkeypatch, _SHORT_JOB_TEXT)

    def test_canonical_requirements_is_string(self, monkeypatch):
        result = _url_call(monkeypatch, _SHORT_JOB_TEXT)
        assert isinstance(result["canonical_requirements"], str)

    def test_warnings_are_emitted_for_short_raw_text(self, monkeypatch):
        result = _url_call(monkeypatch, _SHORT_JOB_TEXT)
        assert len(result["warnings"]) >= 1

    def test_warnings_are_all_strings(self, monkeypatch):
        result = _url_call(monkeypatch, _SHORT_JOB_TEXT)
        for w in result["warnings"]:
            assert isinstance(w, str)

    def test_raw_text_length_reflects_short_input(self, monkeypatch):
        result = _url_call(monkeypatch, _SHORT_JOB_TEXT)
        assert result["raw_text_length"] < 300


class TestNoisyJobText:
    """Pure noise input must not crash and must return a string."""

    def test_does_not_raise(self, monkeypatch):
        _url_call(monkeypatch, _NOISY_JOB_TEXT)

    def test_canonical_requirements_is_string(self, monkeypatch):
        result = _url_call(monkeypatch, _NOISY_JOB_TEXT)
        assert isinstance(result["canonical_requirements"], str)

    def test_canonical_requirements_length_is_non_negative(self, monkeypatch):
        result = _url_call(monkeypatch, _NOISY_JOB_TEXT)
        assert result["canonical_requirements_length"] >= 0

    def test_warnings_emitted_when_few_requirements_found(self, monkeypatch):
        result = _url_call(monkeypatch, _NOISY_JOB_TEXT)
        assert len(result["warnings"]) >= 1


# ── 4. Unsupported / missing source ─────────────────────────────────────────

class TestUnsupportedSource:
    """read_job_post_details must raise meaningful errors for bad input."""

    def test_missing_file_raises_file_not_found(self):
        with pytest.raises(FileNotFoundError):
            read_job_post_details("/this/path/does/not/exist.docx")

    def test_unsupported_extension_raises_value_error(self):
        with patch("src.job_reader.Path") as mock_path_cls:
            fake_path = MagicMock()
            fake_path.exists.return_value = True
            fake_path.suffix = ".xyz"
            fake_path.__str__ = lambda self: "/fake/job.xyz"
            mock_path_cls.return_value = fake_path
            with pytest.raises(ValueError):
                read_job_post_details("/fake/job.xyz")
