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

import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


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
    configured = bool(url and key)
    logger.debug("Database configured: %s", configured)
    return configured


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
        logger.debug("Supabase client not configured: missing credentials")
        return None
    try:
        from supabase import create_client
        client = create_client(url, key)
        logger.debug("Supabase client created")
        return client
    except Exception as exc:
        logger.warning(
            "Supabase client creation failed: %s: %s", type(exc).__name__, exc
        )
        return None


# ── save helpers ───────────────────────────────────────────────────────────────

_DISABLED: dict[str, Any] = {"status": "disabled", "id": None}


def save_analysis_run(
    *,
    job_url: str = "",
    match_score: int | None = None,
    match_label: str = "",
    fit_level: str = "",
    job_source_type: str = "",
    resume_filename: str = "",
    raw_job_chars: int = 0,
    requirements_chars: int = 0,
    session_id: str | None = None,
    app_version: str = "",
    status: str = "completed",
) -> dict[str, Any]:
    """
    Persist a high-level analysis run record.

    Column mapping (schema → arg):
      match_score  ← match_score (was fit_score)
      match_label  ← match_label
      fit_level    ← fit_level
      job_url      ← job_url  (was job_label)

    Does NOT accept resume_text or resume file content.
    Returns a disabled-result dict when the database is not configured.
    """
    client = get_supabase_client()
    if client is None:
        return _DISABLED

    logger.debug("Saving analysis_run attempted")
    try:
        payload: dict[str, Any] = {
            "job_source_type":    job_source_type[:50],
            "job_url":            job_url[:500],
            "resume_filename":    resume_filename[:200],
            "match_score":        match_score,
            "match_label":        match_label[:100],
            "fit_level":          fit_level[:100],
            "raw_job_chars":      raw_job_chars,
            "requirements_chars": requirements_chars,
            "status":             status[:50],
        }
        if session_id:
            payload["session_id"] = session_id
        if app_version:
            payload["app_version"] = app_version[:50]
        response = client.table("analysis_runs").insert(payload).execute()
        rows = response.data or []
        run_id = rows[0].get("id") if rows else None
        logger.debug("Saving analysis_run succeeded: %s", run_id)
        return {"status": "ok", "id": run_id}
    except Exception as exc:
        logger.warning(
            "Saving analysis_run failed: %s: %s", type(exc).__name__, exc
        )
        return {"status": "error", "id": None}


def save_analysis_result(
    *,
    analysis_id: Any = None,
    matched_skills: list[str] | None = None,
    missing_skills: list[str] | None = None,
    improvement_tips: list[str] | None = None,
    extracted_requirements: str = "",
    tailoring_plan: str = "",
    safety_notes: str = "",
    report_files: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Persist keyword match results linked to an analysis_id from save_analysis_run.

    Column mapping (schema → arg):
      matched_skills  ← matched_skills (was matched_keywords)
      missing_skills  ← missing_skills (was missing_keywords)
      tailoring_plan  ← tailoring_plan (was tailoring_plan_summary)
      analysis_id     ← analysis_id   (was run_id)
      report_files    ← report_files jsonb (was text_report_path / word_report_path)

    Returns a disabled-result dict when the database is not configured.
    """
    client = get_supabase_client()
    if client is None:
        return _DISABLED

    logger.debug("Saving analysis_result attempted")
    try:
        payload: dict[str, Any] = {
            "analysis_id":            analysis_id,
            "matched_skills":         matched_skills or [],
            "missing_skills":         missing_skills or [],
            "improvement_tips":       improvement_tips or [],
            "extracted_requirements": extracted_requirements[:2000],
            "tailoring_plan":         tailoring_plan[:1000],
            "safety_notes":           safety_notes[:500],
        }
        if report_files:
            payload["report_files"] = report_files
        response = client.table("analysis_results").insert(payload).execute()
        rows = response.data or []
        result_id = rows[0].get("id") if rows else None
        logger.debug("Saving analysis_result succeeded: %s", result_id)
        return {"status": "ok", "id": result_id}
    except Exception as exc:
        logger.warning(
            "Saving analysis_result failed: %s: %s", type(exc).__name__, exc
        )
        return {"status": "error", "id": None}


def save_usage_event(
    *,
    event_name: str = "",
    job_source_type: str = "",
    analysis_id: Any = None,
    session_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Persist a lightweight usage/analytics event.

    Fields with no dedicated column (e.g. used_claude) go into metadata jsonb.

    Returns a disabled-result dict when the database is not configured.
    """
    client = get_supabase_client()
    if client is None:
        return _DISABLED

    logger.debug("Saving usage_event attempted: %s", event_name)
    try:
        payload: dict[str, Any] = {
            "event_name":      event_name[:100],
            "job_source_type": job_source_type[:50],
        }
        if analysis_id is not None:
            payload["analysis_id"] = analysis_id
        if session_id:
            payload["session_id"] = session_id
        if metadata:
            payload["metadata"] = metadata
        response = client.table("usage_events").insert(payload).execute()
        rows = response.data or []
        event_id = rows[0].get("id") if rows else None
        logger.debug("Saving usage_event succeeded: %s", event_id)
        return {"status": "ok", "id": event_id}
    except Exception as exc:
        logger.warning(
            "Saving usage_event failed: %s: %s", type(exc).__name__, exc
        )
        return {"status": "error", "id": None}


def save_app_error(
    *,
    error_type: str = "",
    error_message: str = "",
    analysis_id: Any = None,
    session_id: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Persist an application error for observability.

    The old 'context' field is now stored inside metadata jsonb.
    Returns a disabled-result dict when the database is not configured.
    """
    client = get_supabase_client()
    if client is None:
        return _DISABLED

    logger.debug("Saving app_error attempted: %s", error_type)
    try:
        payload: dict[str, Any] = {
            "error_type":    error_type[:200],
            "error_message": error_message[:1000],
        }
        if analysis_id is not None:
            payload["analysis_id"] = analysis_id
        if session_id:
            payload["session_id"] = session_id
        if metadata:
            payload["metadata"] = metadata
        response = client.table("app_errors").insert(payload).execute()
        rows = response.data or []
        err_id = rows[0].get("id") if rows else None
        logger.debug("Saving app_error succeeded: %s", err_id)
        return {"status": "ok", "id": err_id}
    except Exception as exc:
        logger.warning(
            "Saving app_error failed: %s: %s", type(exc).__name__, exc
        )
        return {"status": "error", "id": None}