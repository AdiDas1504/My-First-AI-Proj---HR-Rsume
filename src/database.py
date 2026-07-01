"""
Optional Supabase database layer.

All functions are safe to call when Supabase is not configured — they return
None (or a disabled-result dict) instead of raising exceptions. The rest of
the app never needs to check whether the database is configured before calling
these functions.

Credentials are resolved in this order:
  1. st.secrets (Streamlit Community Cloud deployment)
  2. Environment variables (local .env via python-dotenv)
  3. Nothing — database is disabled

Full resume text and resume files are never stored.
"""

from __future__ import annotations

import os
from typing import Any


# ── credential resolution ──────────────────────────────────────────────────────

def _get_credentials() -> tuple[str | None, str | None]:
    """Return (supabase_url, supabase_anon_key) or (None, None) if unavailable."""
    url = key = None

    # 1. Streamlit secrets (available on Streamlit Cloud; import may fail locally)
    try:
        import streamlit as st
        url = st.secrets.get("SUPABASE_URL")
        key = st.secrets.get("SUPABASE_ANON_KEY")
    except Exception:
        pass

    # 2. Fall back to environment variables
    if not url:
        url = os.environ.get("SUPABASE_URL")
    if not key:
        key = os.environ.get("SUPABASE_ANON_KEY")

    return (url or None, key or None)


# ── public API ─────────────────────────────────────────────────────────────────

def is_database_configured() -> bool:
    """Return True only when both Supabase credentials are present."""
    url, key = _get_credentials()
    return bool(url and key)


def get_supabase_client() -> Any | None:
    """
    Return an initialised Supabase client, or None if not configured.

    Callers must guard:
        client = get_supabase_client()
        if client is None:
            return
    """
    url, key = _get_credentials()
    if not (url and key):
        return None
    try:
        from supabase import create_client
        return create_client(url, key)
    except Exception:
        return None


# ── save helpers ───────────────────────────────────────────────────────────────

_DISABLED: dict[str, Any] = {"status": "disabled", "id": None}


def save_analysis_run(
    *,
    job_label: str = "",
    fit_score: int | None = None,
    fit_level: str = "",
    job_source_type: str = "",
    resume_filename: str = "",
    raw_job_chars: int = 0,
    requirements_chars: int = 0,
    text_report_path: str = "",
    word_report_path: str = "",
) -> dict[str, Any]:
    """
    Persist a high-level analysis run record.

    Does NOT accept resume_text or resume file content.
    Returns a disabled-result dict when the database is not configured.
    """
    client = get_supabase_client()
    if client is None:
        return _DISABLED

    try:
        payload = {
            "job_label":          job_label[:500],
            "fit_score":          fit_score,
            "fit_level":          fit_level[:100],
            "job_source_type":    job_source_type[:50],
            "resume_filename":    resume_filename[:200],
            "raw_job_chars":      raw_job_chars,
            "requirements_chars": requirements_chars,
            "text_report_path":   text_report_path[:500],
            "word_report_path":   word_report_path[:500],
        }
        response = client.table("analysis_runs").insert(payload).execute()
        rows = response.data or []
        return {"status": "ok", "id": rows[0].get("id") if rows else None}
    except Exception:
        return {"status": "error", "id": None}


def save_analysis_result(
    *,
    run_id: Any = None,
    matched_keywords: list[str] | None = None,
    missing_keywords: list[str] | None = None,
    improvement_tips: list[str] | None = None,
    extracted_requirements: str = "",
    tailoring_plan_summary: str = "",
    safety_notes: str = "",
) -> dict[str, Any]:
    """
    Persist keyword match results linked to a run_id from save_analysis_run.

    Returns a disabled-result dict when the database is not configured.
    """
    client = get_supabase_client()
    if client is None:
        return _DISABLED

    try:
        payload = {
            "run_id":                  run_id,
            "matched_keywords":        matched_keywords or [],
            "missing_keywords":        missing_keywords or [],
            "improvement_tips":        improvement_tips or [],
            "extracted_requirements":  extracted_requirements[:2000],
            "tailoring_plan_summary":  tailoring_plan_summary[:1000],
            "safety_notes":            safety_notes[:500],
        }
        response = client.table("analysis_results").insert(payload).execute()
        rows = response.data or []
        return {"status": "ok", "id": rows[0].get("id") if rows else None}
    except Exception:
        return {"status": "error", "id": None}


def save_usage_event(
    *,
    event_name: str = "",
    job_source_type: str = "",
    used_claude: bool = False,
) -> dict[str, Any]:
    """
    Persist a lightweight usage/analytics event.

    Returns a disabled-result dict when the database is not configured.
    """
    client = get_supabase_client()
    if client is None:
        return _DISABLED

    try:
        payload = {
            "event_name":      event_name[:100],
            "job_source_type": job_source_type[:50],
            "used_claude":     used_claude,
        }
        response = client.table("usage_events").insert(payload).execute()
        rows = response.data or []
        return {"status": "ok", "id": rows[0].get("id") if rows else None}
    except Exception:
        return {"status": "error", "id": None}


def save_app_error(
    *,
    error_type: str = "",
    error_message: str = "",
    context: str = "",
) -> dict[str, Any]:
    """
    Persist an application error for observability.

    Returns a disabled-result dict when the database is not configured.
    """
    client = get_supabase_client()
    if client is None:
        return _DISABLED

    try:
        payload = {
            "error_type":    error_type[:200],
            "error_message": error_message[:1000],
            "context":       context[:500],
        }
        response = client.table("app_errors").insert(payload).execute()
        rows = response.data or []
        return {"status": "ok", "id": rows[0].get("id") if rows else None}
    except Exception:
        return {"status": "error", "id": None}