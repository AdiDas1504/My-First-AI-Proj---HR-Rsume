"""
Tests for src/database.py — the optional Supabase database layer.

All tests are deterministic: no network access, no real Supabase credentials.
The module must behave safely whether or not the database is configured.
"""

import importlib
import sys
import types
import pytest


# ── helpers ───────────────────────────────────────────────────────────────────

def _reload_database(monkeypatch, *, supabase_url="", supabase_key=""):
    """
    Reload src.database with clean environment variables.

    Stubs out 'streamlit' so st.secrets never fires, and controls
    SUPABASE_URL / SUPABASE_ANON_KEY via env vars.
    """
    # Stub streamlit so st.secrets raises an exception (simulating no secrets)
    fake_st = types.ModuleType("streamlit")
    fake_st.secrets = {}  # plain dict — .get() raises AttributeError in _get_credentials

    monkeypatch.setitem(sys.modules, "streamlit", fake_st)

    monkeypatch.setenv("SUPABASE_URL",      supabase_url)
    monkeypatch.setenv("SUPABASE_ANON_KEY", supabase_key)

    sys.modules.pop("src.database", None)
    import src.database as db
    return db


# ── 1. Public API surface ──────────────────────────────────────────────────────

class TestPublicAPI:
    """Required functions must exist and be callable."""

    def test_is_database_configured_exists(self):
        import src.database as db
        assert callable(db.is_database_configured)

    def test_get_supabase_client_exists(self):
        import src.database as db
        assert callable(db.get_supabase_client)

    def test_save_analysis_run_exists(self):
        import src.database as db
        assert callable(db.save_analysis_run)

    def test_save_analysis_result_exists(self):
        import src.database as db
        assert callable(db.save_analysis_result)

    def test_save_usage_event_exists(self):
        import src.database as db
        assert callable(db.save_usage_event)

    def test_save_app_error_exists(self):
        import src.database as db
        assert callable(db.save_app_error)


# ── 2. Database disabled — no credentials ────────────────────────────────────

class TestDatabaseDisabled:
    """When no credentials are set the module must be silent and safe."""

    def test_is_database_configured_returns_false(self, monkeypatch):
        db = _reload_database(monkeypatch)
        assert db.is_database_configured() is False

    def test_get_supabase_client_returns_none(self, monkeypatch):
        db = _reload_database(monkeypatch)
        assert db.get_supabase_client() is None

    def test_save_analysis_run_does_not_raise(self, monkeypatch):
        db = _reload_database(monkeypatch)
        result = db.save_analysis_run(job_url="https://example.com/job", match_score=75)
        assert result is not None

    def test_save_analysis_run_returns_disabled(self, monkeypatch):
        db = _reload_database(monkeypatch)
        result = db.save_analysis_run(job_url="https://example.com/job", match_score=75)
        assert result.get("status") == "disabled"

    def test_save_analysis_result_does_not_raise(self, monkeypatch):
        db = _reload_database(monkeypatch)
        result = db.save_analysis_result(
            analysis_id=None,
            matched_skills=["python"],
            missing_skills=["agile"],
        )
        assert result is not None

    def test_save_analysis_result_returns_disabled(self, monkeypatch):
        db = _reload_database(monkeypatch)
        result = db.save_analysis_result(analysis_id=None)
        assert result.get("status") == "disabled"

    def test_save_usage_event_does_not_raise(self, monkeypatch):
        db = _reload_database(monkeypatch)
        result = db.save_usage_event(
            event_name="analysis_run",
            metadata={"used_claude": False},
        )
        assert result is not None

    def test_save_usage_event_returns_disabled(self, monkeypatch):
        db = _reload_database(monkeypatch)
        result = db.save_usage_event(event_name="analysis_run")
        assert result.get("status") == "disabled"

    def test_save_app_error_does_not_raise(self, monkeypatch):
        db = _reload_database(monkeypatch)
        result = db.save_app_error(
            error_type="ValueError",
            error_message="something broke",
        )
        assert result is not None

    def test_save_app_error_returns_disabled(self, monkeypatch):
        db = _reload_database(monkeypatch)
        result = db.save_app_error(error_type="ValueError", error_message="oops")
        assert result.get("status") == "disabled"

    def test_all_save_functions_return_dicts(self, monkeypatch):
        db = _reload_database(monkeypatch)
        assert isinstance(db.save_analysis_run(),    dict)
        assert isinstance(db.save_analysis_result(), dict)
        assert isinstance(db.save_usage_event(),     dict)
        assert isinstance(db.save_app_error(),       dict)

    def test_disabled_result_id_is_none(self, monkeypatch):
        db = _reload_database(monkeypatch)
        for result in [
            db.save_analysis_run(),
            db.save_analysis_result(),
            db.save_usage_event(),
            db.save_app_error(),
        ]:
            assert result.get("id") is None


# ── 3. Partial credentials still disabled ────────────────────────────────────

class TestPartialCredentials:
    """Having only one of the two credentials must still disable the database."""

    def test_url_only_is_not_configured(self, monkeypatch):
        db = _reload_database(monkeypatch, supabase_url="https://x.supabase.co")
        assert db.is_database_configured() is False

    def test_key_only_is_not_configured(self, monkeypatch):
        db = _reload_database(monkeypatch, supabase_key="anon-key-abc")
        assert db.is_database_configured() is False

    def test_url_only_client_is_none(self, monkeypatch):
        db = _reload_database(monkeypatch, supabase_url="https://x.supabase.co")
        assert db.get_supabase_client() is None

    def test_key_only_client_is_none(self, monkeypatch):
        db = _reload_database(monkeypatch, supabase_key="anon-key-abc")
        assert db.get_supabase_client() is None


# ── 4. Both credentials present — configured state ───────────────────────────

class TestDatabaseConfigured:
    """When both credentials are set, is_database_configured must return True."""

    def test_is_configured_with_both_credentials(self, monkeypatch):
        db = _reload_database(
            monkeypatch,
            supabase_url="https://example.supabase.co",
            supabase_key="anon-secret-key",
        )
        assert db.is_database_configured() is True

    def test_client_attempts_connection_with_both_credentials(self, monkeypatch):
        """
        get_supabase_client() should try to connect (may fail without a real
        Supabase instance) — the important thing is it does not raise.
        """
        db = _reload_database(
            monkeypatch,
            supabase_url="https://example.supabase.co",
            supabase_key="anon-secret-key",
        )
        # May return None (import error / network error) or a client — either is fine
        result = db.get_supabase_client()
        assert result is None or hasattr(result, "table")


# ── 5. UUID generation and minimal-return insert ──────────────────────────────

class _MockResponse:
    """Simulates a PostgREST minimal-return response (no rows returned)."""
    data = []


class _MockBuilder:
    """Captures insert() kwargs so tests can assert on them."""

    def __init__(self):
        self.captured_payload = {}
        self.captured_kwargs  = {}

    def insert(self, payload, **kwargs):
        self.captured_payload.update(payload)
        self.captured_kwargs.update(kwargs)
        return self

    def execute(self):
        return _MockResponse()


class _MockClient:
    def __init__(self):
        self.builder = _MockBuilder()

    def table(self, name):
        return self.builder


class TestSaveAnalysisRunMinimalInsert:
    """save_analysis_run must generate a local UUID and use returning=minimal."""

    def _setup(self, monkeypatch):
        db     = _reload_database(monkeypatch)
        client = _MockClient()
        monkeypatch.setattr(db, "get_supabase_client", lambda: client)
        return db, client

    def test_returns_ok_status(self, monkeypatch):
        db, _ = self._setup(monkeypatch)
        result = db.save_analysis_run(job_url="https://example.com", match_score=80)
        assert result["status"] == "ok"

    def test_returns_non_none_id(self, monkeypatch):
        db, _ = self._setup(monkeypatch)
        result = db.save_analysis_run(job_url="https://example.com", match_score=80)
        assert result["id"] is not None

    def test_returned_id_is_uuid_v4(self, monkeypatch):
        import re
        db, _ = self._setup(monkeypatch)
        result = db.save_analysis_run(job_url="https://example.com", match_score=80)
        uuid_v4 = re.compile(
            r"^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
        )
        assert uuid_v4.match(result["id"]), f"Expected UUID v4, got: {result['id']}"

    def test_uuid_is_included_in_insert_payload(self, monkeypatch):
        db, client = self._setup(monkeypatch)
        result = db.save_analysis_run(job_url="https://example.com", match_score=80)
        assert client.builder.captured_payload.get("id") == result["id"]

    def test_insert_uses_returning_minimal(self, monkeypatch):
        db, client = self._setup(monkeypatch)
        db.save_analysis_run(job_url="https://example.com", match_score=80)
        assert client.builder.captured_kwargs.get("returning") == "minimal"

    def test_two_calls_produce_different_uuids(self, monkeypatch):
        db     = _reload_database(monkeypatch)
        client = _MockClient()
        monkeypatch.setattr(db, "get_supabase_client", lambda: client)
        r1 = db.save_analysis_run()
        # Replace builder so second insert doesn't collide
        client.builder = _MockBuilder()
        r2 = db.save_analysis_run()
        assert r1["id"] != r2["id"]
