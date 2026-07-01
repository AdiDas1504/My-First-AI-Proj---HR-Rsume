from pathlib import Path
from tempfile import NamedTemporaryFile

import streamlit as st

from src.resume_reader import read_resume
from src.job_reader import read_job_post_details
from src.analyzer import analyze_match
from src.report_generator import generate_fit_report
from src.resume_tailor import (
    generate_tailoring_plan,
    generate_tailored_resume_draft,
)
from src.output_writer import (
    save_text_report,
    save_word_report,
    save_tailored_resume_text,
    save_tailored_resume_word,
    save_claude_tailored_resume_word,
)
from src.ai_config import is_ai_configured
from src.claude_resume_writer import generate_claude_tailored_resume
from src.ai_output_validator import validate_ai_output
from src.database import (
    save_analysis_run,
    save_analysis_result,
    save_usage_event,
    save_app_error,
)


# ─── helpers ──────────────────────────────────────────────────────────────────

def save_uploaded_file(uploaded_file, suffix):
    with NamedTemporaryFile(delete=False, suffix=suffix) as f:
        f.write(uploaded_file.getbuffer())
        return f.name


def read_file_bytes(file_path):
    return Path(file_path).read_bytes()


def delete_temp_file(file_path):
    try:
        Path(file_path).unlink(missing_ok=True)
    except Exception:
        pass


def run_analysis(resume_path, job_source, use_claude):
    resume_text = read_resume(resume_path)
    job_details = read_job_post_details(job_source)
    job_text    = job_details["canonical_requirements"]

    analysis       = analyze_match(resume_text, job_text)
    report         = generate_fit_report(analysis)
    tailoring_plan = generate_tailoring_plan(analysis)

    tailored_resume_text = generate_tailored_resume_draft(
        resume_text=resume_text,
        analysis=analysis,
        tailoring_plan=tailoring_plan,
    )

    text_report_path   = save_text_report(report=report, tailoring_plan=tailoring_plan,
                                          resume_text=resume_text, job_text=job_text)
    word_report_path   = save_word_report(report=report, tailoring_plan=tailoring_plan,
                                          resume_text=resume_text, job_text=job_text)
    tailored_txt_path  = save_tailored_resume_text(tailored_resume_text)
    tailored_word_path = save_tailored_resume_word(tailored_resume_text)

    claude_word_path     = None
    claude_safety_review = None

    if use_claude:
        claude_text          = generate_claude_tailored_resume(
            resume_text=resume_text, job_text=job_text,
            analysis=analysis, tailoring_plan=tailoring_plan,
        )
        claude_safety_review = validate_ai_output(claude_text)
        claude_word_path     = save_claude_tailored_resume_word(claude_text)

    # ── optional database persistence (never crashes the app) ─────────────────
    try:
        _job_url = str(job_source) if isinstance(job_source, str) else ""
        _run = save_analysis_run(
            job_url=_job_url[:500],
            match_score=report.get("fit_score"),
            match_label=report.get("fit_level", ""),
            fit_level=report.get("fit_level", ""),
            job_source_type=job_details.get("source_type", ""),
            resume_filename=Path(resume_path).name,
            raw_job_chars=job_details.get("raw_text_length", 0),
            requirements_chars=job_details.get("canonical_requirements_length", 0),
        )
        _analysis_id = _run.get("id")
        save_analysis_result(
            analysis_id=_analysis_id,
            matched_skills=analysis.get("matched_keywords", []),
            missing_skills=analysis.get("missing_keywords", []),
            improvement_tips=report.get("improvement_tips", []),
            extracted_requirements=job_text[:2000],
            tailoring_plan=str(tailoring_plan)[:1000],
            safety_notes=str(claude_safety_review)[:500] if claude_safety_review else "",
            report_files={
                "text_report": str(text_report_path),
                "word_report": str(word_report_path),
            },
        )
        save_usage_event(
            event_name="analysis_completed",
            job_source_type=job_details.get("source_type", ""),
            analysis_id=_analysis_id,
            metadata={"used_claude": use_claude},
        )
    except Exception as _db_err:
        try:
            save_app_error(
                error_type=type(_db_err).__name__,
                error_message=str(_db_err)[:1000],
                metadata={"context": "run_analysis persistence"},
            )
        except Exception:
            pass

    return {
        "resume_text": resume_text, "job_text": job_text, "job_details": job_details,
        "analysis": analysis, "report": report, "tailoring_plan": tailoring_plan,
        "text_report_path": text_report_path, "word_report_path": word_report_path,
        "tailored_txt_path": tailored_txt_path, "tailored_word_path": tailored_word_path,
        "claude_word_path": claude_word_path, "claude_safety_review": claude_safety_review,
    }


def _show_error(err: Exception) -> None:
    """Classify an exception and show a user-friendly Streamlit error message."""
    err_lower    = str(err).lower()
    err_typename = type(err).__name__

    if (
        "tesseract" in err_lower
        or "tessdata" in err_lower
        or "pytesseract" in err_lower
        or "Tesseract" in err_typename
    ):
        st.error(
            "We could not read text from this image. "
            "Please upload a clearer screenshot or use the job URL/PDF."
        )
        return

    if (
        any(k in err_lower for k in (
            "connection", "timeout", "ssl", "http error",
            "failed to fetch", "could not fetch", "network",
            "name or service not known", "no route to host",
        ))
        or any(k in err_typename for k in (
            "ConnectionError", "Timeout", "HTTPError", "URLError",
            "RequestException",
        ))
    ):
        st.error(
            "We could not read this job URL. "
            "Please check the link or upload the job post as a PDF, DOCX, or screenshot."
        )
        return

    if (
        any(k in err_lower for k in (
            "cannot read", "could not read", "invalid pdf", "corrupt",
            "permission denied", "no such file", "failed to decode",
            "unable to read",
        ))
        or any(k in err_typename for k in (
            "IOError", "OSError", "PermissionError", "FileNotFoundError",
        ))
    ):
        st.error(
            "We could not read the uploaded file. "
            "Please try a clearer file or upload a PDF/DOCX."
        )
        return

    st.error("Something went wrong while analyzing the resume. Please try again.")
    with st.expander("Technical details"):
        st.exception(err)


# ─── page config ──────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="JobFit AI",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="collapsed",
)

# ─── session state ────────────────────────────────────────────────────────────

if "analysis_results" not in st.session_state:
    st.session_state.analysis_results = None
if "job_label" not in st.session_state:
    st.session_state.job_label = ""

_on_results = st.session_state.analysis_results is not None

# ─── fonts ────────────────────────────────────────────────────────────────────

st.markdown(
    '<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined'
    ':wght,FILL@100..700,0..1&display=swap" rel="stylesheet">'
    '<link href="https://fonts.googleapis.com/css2?family=Inter'
    ':wght@400;500;600;700&display=swap" rel="stylesheet">',
    unsafe_allow_html=True,
)

# ─── base CSS (both screens) ──────────────────────────────────────────────────

st.markdown("""
<style>
/* Material Symbols */
.material-symbols-outlined {
    font-family: 'Material Symbols Outlined' !important;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: inline-block; vertical-align: middle; line-height: 1; user-select: none;
}

/* ── Reset / base ── */
html, body, [class*="css"] { font-family: 'Inter', sans-serif !important; }
[data-testid="stAppViewContainer"] { background: #F8FAFC; }
[data-testid="stHeader"]            { background: transparent !important; box-shadow: none !important; }
[data-testid="stToolbar"]           { display: none !important; }

/* ── Page layout ── */
.block-container,
[data-testid="stMainBlockContainer"] {
    max-width: 1440px !important;
    padding: 0 32px 56px !important;
    width: 100% !important;
}

/* ── Cards (st.container border=True) ── */
[data-testid="stVerticalBlockBorderWrapper"] {
    background: #ffffff !important;
    border: 1px solid rgba(195,198,215,0.45) !important;
    border-radius: 16px !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04) !important;
    overflow: hidden;
    margin-bottom: 0;
    transition: box-shadow 0.2s;
}
[data-testid="stVerticalBlockBorderWrapper"]:hover {
    box-shadow: 0 6px 26px rgba(0,0,0,0.07) !important;
}
[data-testid="stVerticalBlockBorderWrapper"] > div[data-testid="stVerticalBlock"] {
    padding: 24px !important;
}

/* ── Text input ── */
[data-testid="stTextInput"] input {
    border: 1px solid #c3c6d7 !important;
    border-radius: 8px !important;
    padding: 10px 13px !important;
    font-size: 15px !important;
    background: #ffffff !important;
    color: #131b2e !important;
    transition: border-color 0.18s, box-shadow 0.18s;
}
[data-testid="stTextInput"] input:focus {
    border-color: #2563eb !important;
    box-shadow: 0 0 0 3px rgba(37,99,235,0.1) !important;
    outline: none !important;
}
[data-testid="stTextInput"] input::placeholder { color: #9ca3af !important; }

/* ── File uploader drop zone ── */
[data-testid="stFileUploaderDropzone"] {
    background: #fafbff !important;
    border: 2px dashed #b8c4dc !important;
    border-radius: 10px !important;
    padding: 28px 18px !important;
    text-align: center;
    transition: background 0.2s, border-color 0.2s;
}
[data-testid="stFileUploaderDropzone"]:hover {
    background: #eff4ff !important;
    border-color: #2563eb !important;
}
[data-testid="stFileUploaderDropzone"] p {
    font-size: 13px !important;
    color: #434655 !important;
}
[data-testid="stFileUploaderDropzone"] button {
    border-radius: 6px !important;
    font-size: 12px !important;
    font-weight: 700 !important;
    letter-spacing: 0.04em !important;
}

/* ── Primary button (Analyze Match) ── */
[data-testid="stButton"] button[kind="primary"] {
    background: linear-gradient(90deg, #2563eb 0%, #4b7bec 100%) !important;
    color: white !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 700 !important;
    font-size: 17px !important;
    padding: 15px 32px !important;
    width: 100%;
    height: auto !important;
    box-shadow: 0 8px 20px rgba(37,99,235,0.22) !important;
    transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s !important;
}
[data-testid="stButton"] button[kind="primary"]:hover {
    opacity: 0.91 !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 28px rgba(37,99,235,0.32) !important;
}

/* ── Secondary button (New Analysis) ── */
[data-testid="stButton"] button[kind="secondary"] {
    background: #ffffff !important;
    color: #131b2e !important;
    border: 1px solid rgba(195,198,215,0.6) !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 600 !important;
    padding: 10px 18px !important;
    transition: background 0.15s !important;
}
[data-testid="stButton"] button[kind="secondary"]:hover {
    background: #eaedff !important;
}

/* ── Download buttons ── */
[data-testid="stDownloadButton"] {
    margin-bottom: 8px;
    width: 100%;
}
[data-testid="stDownloadButton"] button {
    width: 100% !important;
    padding: 11px 14px !important;
    background: #ffffff !important;
    color: #131b2e !important;
    border: 1px solid rgba(195,198,215,0.5) !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    text-align: left !important;
    transition: background 0.15s !important;
}
[data-testid="stDownloadButton"] button:hover {
    background: #f2f3ff !important;
}

/* ── Expanders ── */
[data-testid="stExpander"] details {
    border: 1px solid rgba(195,198,215,0.35) !important;
    border-radius: 8px !important;
    background: #ffffff !important;
    overflow: hidden;
}
[data-testid="stExpander"] summary {
    font-size: 14px !important;
    font-weight: 600 !important;
    color: #131b2e !important;
    padding: 13px 16px !important;
}
[data-testid="stExpander"] summary:hover { background: #f2f3ff !important; }

/* ── Shared typography helpers ── */
.sec-h {
    font-size: 20px; font-weight: 600; color: #131b2e;
    margin: 0 0 18px; display: block; line-height: 1.33;
}
.src-badge {
    display: inline-block; background: #eaedff; color: #434655;
    border: 1px solid #c3c6d7; border-radius: 9999px;
    font-size: 11px; font-weight: 600; padding: 2px 9px; margin: 0 3px 4px 0;
}
.safety-note {
    background: #f2f3ff; border: 1px solid rgba(195,198,215,0.35);
    border-left: 4px solid #737686; border-radius: 8px;
    padding: 10px 13px; font-size: 12px; color: #434655;
    line-height: 1.55; margin-top: 12px;
}
.gap-xl { height: 40px; }
.gap-lg { height: 24px; }
.gap-sm { height: 8px; }
</style>
""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════════
# SCREEN 1 — UPLOAD
# ═══════════════════════════════════════════════════════════════════════════════

if not _on_results:

    # ── top nav ───────────────────────────────────────────────────────────────
    st.markdown("""
    <style>
    .topbar {
        display: flex; align-items: center; justify-content: space-between;
        height: 64px; padding: 0 4px;
        border-bottom: 1px solid rgba(195,198,215,0.35);
    }
    .topbar-logo { font-size: 22px; font-weight: 700; color: #004ac6; }
    .topbar-nav  { display: flex; align-items: center; gap: 28px; }
    .topbar-nav a {
        text-decoration: none; font-size: 15px; color: #434655;
        font-weight: 400; transition: color 0.15s;
    }
    .topbar-nav a:hover { color: #004ac6; }
    .topbar-nav .active { color: #004ac6 !important; font-weight: 700;
        border-bottom: 2px solid #004ac6; padding-bottom: 3px; }
    .topbar-btn {
        background: #2563eb; color: white; border: none; border-radius: 8px;
        font-size: 14px; font-weight: 700; padding: 9px 18px; cursor: pointer;
        display: inline-flex; align-items: center; gap: 7px;
        box-shadow: 0 2px 8px rgba(37,99,235,0.22);
    }
    .topbar-btn:hover { background: #1d4ed8; }
    </style>
    <div class="topbar">
      <span class="topbar-logo">JobFit AI</span>
      <nav class="topbar-nav">
        <a href="#" class="active">Dashboard</a>
        <a href="#">My Resumes</a>
        <a href="#">Settings</a>
      </nav>
      <button class="topbar-btn">
        <span class="material-symbols-outlined"
              style="font-variation-settings:'FILL' 1;font-size:17px">auto_awesome</span>
        New Analysis
      </button>
    </div>
    """, unsafe_allow_html=True)

    # ── hero ──────────────────────────────────────────────────────────────────
    st.markdown("""
    <style>
    .hero { text-align: center; padding: 44px 16px 36px; }
    .hero-title {
        font-size: 46px; font-weight: 700; color: #131b2e;
        margin: 0 0 18px; line-height: 1.16; letter-spacing: -0.02em;
    }
    .hero-desc { font-size: 17px; color: #434655; margin: 0; line-height: 1.6; }
    </style>
    """, unsafe_allow_html=True)

    _, hero_col, _ = st.columns([1, 4, 1])
    with hero_col:
        st.markdown("""
        <div class="hero">
          <h1 class="hero-title">Tailor Your Resume with AI Precision</h1>
          <p class="hero-desc">Upload your current resume and the target job description.
          JobFit AI will analyze the gap and provide expert, actionable recommendations
          to improve your match score instantly.</p>
        </div>
        """, unsafe_allow_html=True)

    # ── input card CSS ────────────────────────────────────────────────────────
    st.markdown("""
    <style>
    .card-icon-wrap {
        display: flex; flex-direction: column; align-items: center;
        text-align: center; padding: 4px 0 14px;
    }
    .card-icon-circle {
        width: 58px; height: 58px; border-radius: 9999px; background: #d0e1fb;
        display: flex; align-items: center; justify-content: center;
        margin-bottom: 14px;
    }
    .card-icon-circle .material-symbols-outlined { font-size: 26px !important; color: #54647a; }
    .card-h3  { font-size: 22px; font-weight: 600; color: #131b2e; margin: 0 0 6px; }
    .card-p   { font-size: 13px; color: #434655; margin: 0 0 16px; line-height: 1.5; }
    .browse-hint {
        font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: #004ac6;
        text-transform: uppercase; margin-bottom: 12px; display: block;
    }
    .job-hdr { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
    .job-hdr .material-symbols-outlined { font-size: 22px !important; color: #505f76; }
    .job-hdr-title { font-size: 20px; font-weight: 600; color: #131b2e; margin: 0; }
    .field-lbl {
        display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.06em;
        color: #434655; text-transform: uppercase; margin-bottom: 5px;
    }
    .or-row { display: flex; align-items: center; gap: 12px; margin: 14px 0; }
    .or-line { flex: 1; height: 1px; background: #c3c6d7; }
    .or-txt  { font-size: 11px; font-weight: 700; color: #737686; letter-spacing: 0.07em; }
    .btn-helper { font-size: 13px; color: #434655; text-align: center; margin-top: 8px; }
    </style>
    """, unsafe_allow_html=True)

    # ── two cards ─────────────────────────────────────────────────────────────
    _, col_resume, col_job, _ = st.columns([1, 3, 3, 1], gap="large")

    with col_resume:
        with st.container(border=True):
            st.markdown("""
            <div class="card-icon-wrap">
              <div class="card-icon-circle">
                <span class="material-symbols-outlined">description</span>
              </div>
              <h3 class="card-h3">Upload Resume</h3>
              <p class="card-p">Drag and drop your PDF or DOCX file here, or click to browse.</p>
              <span class="browse-hint">Browse Files</span>
            </div>
            """, unsafe_allow_html=True)
            resume_file = st.file_uploader(
                "Resume file",
                type=["pdf", "docx"],
                label_visibility="collapsed",
            )
            if resume_file:
                st.success(f"✓  {resume_file.name}")

    with col_job:
        with st.container(border=True):
            st.markdown("""
            <div class="job-hdr">
              <span class="material-symbols-outlined">work</span>
              <h3 class="job-hdr-title">Target Job Description</h3>
            </div>
            """, unsafe_allow_html=True)
            st.markdown('<span class="field-lbl">Job Post URL</span>', unsafe_allow_html=True)
            job_url = st.text_input(
                "Job URL",
                placeholder="https://linkedin.com/jobs/...",
                label_visibility="collapsed",
            )
            st.markdown("""
            <div class="or-row">
              <div class="or-line"></div>
              <span class="or-txt">OR</span>
              <div class="or-line"></div>
            </div>
            """, unsafe_allow_html=True)
            st.markdown(
                '<span class="field-lbl">Upload Job File / Screenshot</span>',
                unsafe_allow_html=True,
            )
            job_file = st.file_uploader(
                "Job posting file",
                type=["png", "jpg", "jpeg", "webp", "pdf", "docx"],
                label_visibility="collapsed",
            )
            if job_url or job_file:
                st.success("✓  Job source ready")

    # ── analyze button ────────────────────────────────────────────────────────
    st.markdown('<div class="gap-xl"></div>', unsafe_allow_html=True)
    _, btn_col, _ = st.columns([3, 2, 3])
    with btn_col:
        analyze_clicked = st.button(
            "✨  Analyze Match",
            type="primary",
            use_container_width=True,
        )
        st.markdown(
            '<p class="btn-helper">This process typically takes less than 10 seconds.</p>',
            unsafe_allow_html=True,
        )

    # ── handler ───────────────────────────────────────────────────────────────
    if analyze_clicked:
        job_url_clean = (job_url or "").strip()

        if resume_file is None:
            st.error("Please upload a resume file before running the analysis.")
            st.stop()
        if not job_url_clean and job_file is None:
            st.error("Please provide a job URL or upload a job file/screenshot.")
            st.stop()

        temp_files = []
        try:
            resume_path = save_uploaded_file(resume_file, Path(resume_file.name).suffix)
            temp_files.append(resume_path)

            if job_file:
                job_path = save_uploaded_file(job_file, Path(job_file.name).suffix)
                temp_files.append(job_path)
                job_source_final = job_path
            else:
                job_source_final = job_url_clean

            label = job_url_clean if job_url_clean else job_file.name

            with st.spinner("Analysing your resume against the job posting…"):
                results = run_analysis(
                    resume_path=resume_path,
                    job_source=job_source_final,
                    use_claude=False,
                )

            if results.get("job_details", {}).get("canonical_requirements_length", 9999) < 100:
                st.warning(
                    "Very little job requirement text was extracted. Results may be inaccurate. "
                    "Try a clearer screenshot, another URL, or upload the job post as PDF/DOCX."
                )

            st.session_state.analysis_results = results
            st.session_state.job_label        = label
            st.rerun()

        except Exception as err:
            _show_error(err)
        finally:
            for p in temp_files:
                delete_temp_file(p)


# ═══════════════════════════════════════════════════════════════════════════════
# SCREEN 2 — RESULTS
# ═══════════════════════════════════════════════════════════════════════════════

else:
    results        = st.session_state.analysis_results
    report         = results["report"]
    tailoring_plan = results["tailoring_plan"]
    jd             = results["job_details"]
    pct            = report["fit_score"]

    # ── sidenav offset CSS ────────────────────────────────────────────────────
    st.markdown("""
    <style>
    .block-container,
    [data-testid="stMainBlockContainer"] {
        margin-left: 260px !important;
        max-width: calc(1440px - 260px) !important;
        padding: 36px 36px 56px !important;
    }
    /* Side nav */
    .results-sidenav {
        position: fixed; left: 0; top: 0; height: 100vh; width: 260px;
        background: #faf8ff; z-index: 999;
        box-shadow: 2px 0 10px rgba(0,0,0,0.06);
        display: flex; flex-direction: column; padding: 24px 14px;
    }
    .snav-logo { font-size: 21px; font-weight: 700; color: #004ac6; margin: 0 0 4px 8px; }
    .snav-sub  { font-size: 12px; color: #434655; margin: 0 0 28px 8px; }
    .snav-item {
        display: flex; align-items: center; gap: 12px; padding: 11px 12px;
        border-radius: 8px; text-decoration: none; font-size: 14px; color: #434655;
        transition: background 0.15s; cursor: pointer;
    }
    .snav-item .material-symbols-outlined { font-size: 19px !important; }
    .snav-item:hover { background: #eaedff; color: #004ac6; }
    .snav-active { background: #d0e1fb !important; color: #131b2e !important; font-weight: 700; }
    .snav-bottom {
        margin-top: auto; padding-top: 20px; border-top: 1px solid #dae2fd;
    }
    .snav-new {
        width: 100%; background: #2563eb; color: white; border: none;
        border-radius: 8px; padding: 10px 14px; font-size: 14px; font-weight: 700;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        cursor: pointer; transition: background 0.15s;
    }
    .snav-new:hover { background: #1d4ed8; }
    /* Results header */
    .res-back {
        display: flex; align-items: center; gap: 5px;
        font-size: 13px; color: #434655; margin-bottom: 8px;
    }
    .res-back .material-symbols-outlined { font-size: 15px !important; }
    .res-title { font-size: 30px; font-weight: 600; color: #131b2e; margin: 0 0 4px; letter-spacing: -0.01em; }
    .res-sub   { font-size: 14px; color: #434655; margin: 0; }
    /* Score ring */
    .score-ring-wrap { width: 148px; height: 148px; flex-shrink: 0; }
    .circular-chart  { display: block; width: 100%; height: 100%; }
    .circle-bg { fill: none; stroke: #eaedff; stroke-width: 3.8; }
    .circle    { fill: none; stroke-width: 2.8; stroke-linecap: round; }
    .score-pct-text {
        font-family: 'Inter', sans-serif; fill: #004ac6;
        font-size: 8.5px; font-weight: 700; text-anchor: middle;
    }
    .score-lbl-text {
        font-family: 'Inter', sans-serif; fill: #737686;
        font-size: 3.2px; text-anchor: middle;
    }
    /* Fit summary row */
    .fit-row   { display: flex; align-items: flex-start; gap: 26px; }
    .fit-body  { flex: 1; }
    .fit-level { font-size: 20px; font-weight: 600; color: #131b2e; margin: 0 0 10px; }
    .fit-rec   { font-size: 14px; color: #434655; line-height: 1.6; margin: 0 0 14px; }
    .fit-tip {
        background: #eaedff; border-radius: 8px; padding: 11px 13px;
        display: flex; align-items: flex-start; gap: 9px;
    }
    .fit-tip .material-symbols-outlined { color: #004ac6; font-size: 18px !important; flex-shrink: 0; margin-top: 1px; }
    .fit-tip-text { font-size: 13px; color: #434655; line-height: 1.55; }
    /* Keyword chips */
    .kw-hdr { display: flex; align-items: center; gap: 7px; margin: 0 0 10px; }
    .kw-hdr .material-symbols-outlined { font-size: 18px !important; }
    .kw-matched .material-symbols-outlined { color: #16a34a; }
    .kw-matched .kw-lbl { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #131b2e; }
    .kw-missing .material-symbols-outlined { color: #ba1a1a; }
    .kw-missing .kw-lbl { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; color: #ba1a1a; }
    .chip-row { line-height: 2.4; margin-bottom: 4px; }
    .chip {
        display: inline-block; border-radius: 6px;
        font-size: 12px; padding: 4px 10px; margin: 2px 3px;
    }
    .chip-match { background: #eaedff; color: #131b2e; }
    .chip-miss  { background: #ffdad6; color: #93000a; border: 1px solid rgba(186,26,26,0.12); }
    /* Tailoring plan */
    .tp-card {
        position: relative; overflow: hidden;
        border: 1px solid rgba(195,198,215,0.4); border-radius: 8px;
        padding: 12px 12px 12px 16px; margin-bottom: 10px; background: #ffffff;
    }
    .tp-card::before {
        content: ''; position: absolute; left: 0; top: 0;
        width: 4px; height: 100%; background: #2563eb;
    }
    .tp-amber::before { background: #f59e0b; }
    .tp-gray::before  { background: #9ca3af; }
    .tp-title { font-size: 14px; font-weight: 700; color: #131b2e; margin: 0 0 4px; }
    .tp-body  { font-size: 13px; color: #434655; line-height: 1.55; margin: 0; }
    .priority-pill {
        display: inline-block; border-radius: 9999px; font-size: 11px;
        font-weight: 700; letter-spacing: 0.05em; padding: 3px 10px;
        margin-bottom: 14px; color: white;
    }
    </style>
    """, unsafe_allow_html=True)

    # ── sidenav HTML (decorative) ─────────────────────────────────────────────
    st.markdown("""
    <nav class="results-sidenav">
      <p class="snav-logo">JobFit AI</p>
      <p class="snav-sub">Expert Guidance</p>
      <a href="#" class="snav-item snav-active">
        <span class="material-symbols-outlined">dashboard</span> Dashboard
      </a>
      <a href="#" class="snav-item">
        <span class="material-symbols-outlined">description</span> My Resumes
      </a>
      <a href="#" class="snav-item">
        <span class="material-symbols-outlined">settings</span> Settings
      </a>
      <div class="snav-bottom">
        <button class="snav-new">
          <span class="material-symbols-outlined"
                style="font-size:17px">add</span> New Analysis
        </button>
      </div>
    </nav>
    """, unsafe_allow_html=True)

    # ── results header ────────────────────────────────────────────────────────
    hdr_l, hdr_r = st.columns([7, 3])
    with hdr_l:
        label = st.session_state.get("job_label", "Job Posting")
        st.markdown(f"""
        <div class="res-back">
          <span class="material-symbols-outlined">arrow_back</span>
          Back to Dashboard
        </div>
        <h2 class="res-title">Analysis Results</h2>
        <p class="res-sub">Analysed against: {label}</p>
        """, unsafe_allow_html=True)
    with hdr_r:
        st.markdown('<div style="padding-top:34px"></div>', unsafe_allow_html=True)
        if st.button("← New Analysis", use_container_width=True):
            st.session_state.analysis_results = None
            st.session_state.job_label        = ""
            st.rerun()

    st.markdown('<div class="gap-lg"></div>', unsafe_allow_html=True)

    # ── 8 / 4 bento grid ─────────────────────────────────────────────────────
    col_left, col_right = st.columns([8, 4], gap="large")

    # ════════════ LEFT ════════════

    with col_left:

        # Fit Summary
        with st.container(border=True):
            st.markdown('<span class="sec-h">Fit Summary</span>', unsafe_allow_html=True)
            tip_text = (
                report["improvement_tips"][0]
                if report.get("improvement_tips")
                else "Review keyword matches and align your bullet points to the job requirements."
            )
            st.markdown(f"""
            <div class="fit-row">
              <div class="score-ring-wrap">
                <svg class="circular-chart" viewBox="0 0 36 36">
                  <path class="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"/>
                  <path class="circle"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831
                       a 15.9155 15.9155 0 0 1 0 -31.831"
                    stroke="#2563eb" stroke-dasharray="{pct}, 100"/>
                  <text class="score-pct-text" x="18" y="20.35">{pct}%</text>
                  <text class="score-lbl-text" x="18" y="26">MATCH SCORE</text>
                </svg>
              </div>
              <div class="fit-body">
                <h3 class="fit-level">{report['fit_level']}</h3>
                <p class="fit-rec">{report['recommendation']}</p>
                <div class="fit-tip">
                  <span class="material-symbols-outlined">lightbulb</span>
                  <p class="fit-tip-text"><strong>AI Tip:</strong> {tip_text}</p>
                </div>
              </div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown('<div class="gap-lg"></div>', unsafe_allow_html=True)

        # Keyword Match Analysis
        with st.container(border=True):
            st.markdown('<span class="sec-h">Keyword Match Analysis</span>',
                        unsafe_allow_html=True)
            matched = report["matched_keywords"]
            missing = report["missing_keywords"]

            st.markdown(f"""
            <div class="kw-hdr kw-matched">
              <span class="material-symbols-outlined">check_circle</span>
              <span class="kw-lbl">MATCHED SKILLS ({len(matched)})</span>
            </div>
            """, unsafe_allow_html=True)
            if matched:
                chips = "".join(f'<span class="chip chip-match">{k}</span>' for k in matched)
                st.markdown(f'<div class="chip-row">{chips}</div>', unsafe_allow_html=True)
            else:
                st.caption("No matched concepts found.")

            st.markdown('<div class="gap-sm"></div>', unsafe_allow_html=True)

            st.markdown(f"""
            <div class="kw-hdr kw-missing">
              <span class="material-symbols-outlined">error</span>
              <span class="kw-lbl">MISSING OR WEAK SKILLS ({len(missing)})</span>
            </div>
            """, unsafe_allow_html=True)
            if missing:
                chips = "".join(f'<span class="chip chip-miss">{k}</span>' for k in missing)
                st.markdown(f'<div class="chip-row">{chips}</div>', unsafe_allow_html=True)
            else:
                st.caption("No major missing skills detected.")

        st.markdown('<div class="gap-lg"></div>', unsafe_allow_html=True)

        # Extracted Job Requirements
        with st.container(border=True):
            st.markdown('<span class="sec-h">Extracted Job Requirements</span>',
                        unsafe_allow_html=True)
            badges = (
                f'<span class="src-badge">{jd["source_type"].upper()}</span>'
                f'<span class="src-badge">Raw {jd["raw_text_length"]:,} chars</span>'
                f'<span class="src-badge">Req {jd["canonical_requirements_length"]:,} chars</span>'
            )
            if jd.get("ocr_language"):
                badges += f'<span class="src-badge">OCR: {jd["ocr_language"]}</span>'
            st.markdown(badges, unsafe_allow_html=True)
            st.markdown('<div class="gap-sm"></div>', unsafe_allow_html=True)
            if len(results["resume_text"]) < 300:
                st.warning("Resume text is very short — try a higher-quality PDF or DOCX.")
            if jd["canonical_requirements_length"] < 300:
                st.warning("Few requirements extracted — try a more complete job source.")
            for w in jd.get("warnings", []):
                st.warning(w)
            with st.expander("Requirements Text"):
                st.text(jd["canonical_requirements"][:3000])
            with st.expander("Resume Text"):
                st.text(results["resume_text"][:3000])

    # ════════════ RIGHT ════════════

    with col_right:

        # Tailoring Plan
        with st.container(border=True):
            st.markdown('<span class="sec-h">Tailoring Plan</span>', unsafe_allow_html=True)

            priority = tailoring_plan.get("priority", "")
            pill_color = (
                "#2563eb" if "High" in priority
                else "#f59e0b" if "Medium" in priority
                else "#737686"
            )
            st.markdown(
                f'<span class="priority-pill" style="background:{pill_color}">'
                f'{priority}</span>',
                unsafe_allow_html=True,
            )

            st.markdown("""
            <div class="tp-card">
              <p class="tp-title">Revise Professional Summary</p>
              <p class="tp-body">Emphasise matched skills and relevant experience
              in your opening statement to mirror the job requirements.</p>
            </div>
            """, unsafe_allow_html=True)

            missing_tips = tailoring_plan.get("missing_keyword_suggestions", [])
            for tip in missing_tips[:2]:
                kw = tip.split("'")[1] if "'" in tip else "skill"
                st.markdown(f"""
                <div class="tp-card tp-amber">
                  <p class="tp-title">Add: {kw}</p>
                  <p class="tp-body">{tip}</p>
                </div>
                """, unsafe_allow_html=True)

            guidelines = tailoring_plan.get("bullet_guidelines", [])
            if guidelines:
                st.markdown(f"""
                <div class="tp-card tp-gray">
                  <p class="tp-title">Strengthen Bullet Points</p>
                  <p class="tp-body">{guidelines[0]}</p>
                </div>
                """, unsafe_allow_html=True)

            st.markdown("""
            <div class="safety-note">
              <strong>Safety Note:</strong> Do not add skills or experience unless true.
              This tool only helps you present your real background more clearly.
            </div>
            """, unsafe_allow_html=True)

        st.markdown('<div class="gap-lg"></div>', unsafe_allow_html=True)

        # Assets & Reports
        with st.container(border=True):
            st.markdown('<span class="sec-h">Assets &amp; Reports</span>',
                        unsafe_allow_html=True)
            st.download_button(
                label="📄  Tailored Resume — Word",
                data=read_file_bytes(results["tailored_word_path"]),
                file_name=Path(results["tailored_word_path"]).name,
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                use_container_width=True,
            )
            st.download_button(
                label="📊  Fit Report — Word",
                data=read_file_bytes(results["word_report_path"]),
                file_name=Path(results["word_report_path"]).name,
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                use_container_width=True,
            )
            st.download_button(
                label="📝  Fit Report — Text",
                data=read_file_bytes(results["text_report_path"]),
                file_name=Path(results["text_report_path"]).name,
                mime="text/plain",
                use_container_width=True,
            )
            if results.get("claude_word_path"):
                safety = results.get("claude_safety_review")
                if safety and safety.get("has_warnings"):
                    st.warning(safety["review_message"])
                st.download_button(
                    label="🤖  Claude AI Resume — Word",
                    data=read_file_bytes(results["claude_word_path"]),
                    file_name=Path(results["claude_word_path"]).name,
                    mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    use_container_width=True,
                )
