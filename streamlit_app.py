from pathlib import Path
from tempfile import NamedTemporaryFile

import streamlit as st

from src.resume_reader import read_resume
from src.job_reader import read_job_post
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


def save_uploaded_file(uploaded_file, suffix):
    """
    Save an uploaded Streamlit file to a temporary file and return its path.
    """
    with NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
        temp_file.write(uploaded_file.getbuffer())
        return temp_file.name


def read_file_bytes(file_path):
    """
    Read a file as bytes for Streamlit download buttons.
    """
    return Path(file_path).read_bytes()


def run_analysis(resume_path, job_source, use_claude):
    """
    Run the existing pipeline and return generated results.
    """
    resume_text = read_resume(resume_path)
    job_text = read_job_post(job_source)

    analysis = analyze_match(resume_text, job_text)
    report = generate_fit_report(analysis)
    tailoring_plan = generate_tailoring_plan(analysis)

    tailored_resume_text = generate_tailored_resume_draft(
        resume_text=resume_text,
        analysis=analysis,
        tailoring_plan=tailoring_plan,
    )

    text_report_path = save_text_report(
        report=report,
        tailoring_plan=tailoring_plan,
        resume_text=resume_text,
        job_text=job_text,
    )

    word_report_path = save_word_report(
        report=report,
        tailoring_plan=tailoring_plan,
        resume_text=resume_text,
        job_text=job_text,
    )

    tailored_txt_path = save_tailored_resume_text(tailored_resume_text)
    tailored_word_path = save_tailored_resume_word(tailored_resume_text)

    claude_word_path = None
    claude_safety_review = None

    if use_claude:
        claude_text = generate_claude_tailored_resume(
            resume_text=resume_text,
            job_text=job_text,
            analysis=analysis,
            tailoring_plan=tailoring_plan,
        )

        claude_safety_review = validate_ai_output(claude_text)
        claude_word_path = save_claude_tailored_resume_word(claude_text)

    return {
        "resume_text": resume_text,
        "job_text": job_text,
        "analysis": analysis,
        "report": report,
        "tailoring_plan": tailoring_plan,
        "text_report_path": text_report_path,
        "word_report_path": word_report_path,
        "tailored_txt_path": tailored_txt_path,
        "tailored_word_path": tailored_word_path,
        "claude_word_path": claude_word_path,
        "claude_safety_review": claude_safety_review,
    }


st.set_page_config(
    page_title="JobFit AI Resume Tailor",
    page_icon="📄",
    layout="wide",
)

st.title("JobFit AI Resume Tailor")
st.write(
    "Upload your resume, provide a job posting, and generate a fit report "
    "plus a tailored resume draft."
)

st.info(
    "Privacy note: Resume files and generated outputs may contain personal data. "
    "Do not upload files you do not want processed. Claude AI is optional."
)

st.header("1. Upload Resume")

resume_file = st.file_uploader(
    "Upload your resume as PDF or DOCX",
    type=["pdf", "docx"],
)

st.header("2. Provide Job Posting")

job_input_type = st.radio(
    "Choose job posting input type",
    ["URL", "File"],
    horizontal=True,
)

job_url = None
job_file = None

if job_input_type == "URL":
    job_url = st.text_input("Paste job posting URL")
else:
    job_file = st.file_uploader(
        "Upload job posting as image, PDF, or DOCX",
        type=["png", "jpg", "jpeg", "webp", "pdf", "docx"],
    )

st.header("3. Claude AI Option")

claude_available = is_ai_configured()

if claude_available:
    use_claude = st.checkbox(
        "Generate Claude AI tailored resume draft",
        value=False,
    )

    if use_claude:
        st.warning(
            "Claude processing may send extracted resume and job text to Anthropic API. "
            "Use this only if you agree to external AI processing."
        )
else:
    use_claude = False
    st.warning(
        "Claude AI is not configured. The app will run in non-AI mode. "
        "To enable Claude, add ANTHROPIC_API_KEY and CLAUDE_MODEL to your .env file."
    )

st.header("4. Run Analysis")

analyze_button = st.button("Analyze Resume Match", type="primary")

if analyze_button:
    if resume_file is None:
        st.error("Please upload a resume file.")
        st.stop()

    if job_input_type == "URL" and not job_url:
        st.error("Please paste a job posting URL.")
        st.stop()

    if job_input_type == "File" and job_file is None:
        st.error("Please upload a job posting file.")
        st.stop()

    try:
        resume_suffix = Path(resume_file.name).suffix
        resume_path = save_uploaded_file(resume_file, resume_suffix)

        if job_input_type == "URL":
            job_source = job_url.strip()
        else:
            job_suffix = Path(job_file.name).suffix
            job_source = save_uploaded_file(job_file, job_suffix)

        with st.spinner("Analyzing resume and job posting..."):
            results = run_analysis(
                resume_path=resume_path,
                job_source=job_source,
                use_claude=use_claude,
            )

        st.success("Analysis completed successfully.")

        report = results["report"]
        analysis = results["analysis"]
        tailoring_plan = results["tailoring_plan"]

        st.subheader("Fit Summary")

        col1, col2, col3 = st.columns(3)
        col1.metric("Fit Score", f"{report['fit_score']}%")
        col2.metric("Fit Level", report["fit_level"])
        col3.metric("Matched Items", len(report["matched_keywords"]))

        st.subheader("Recommendation")
        st.write(report["recommendation"])

        st.subheader("Matched Keywords / Concepts")
        if report["matched_keywords"]:
            st.write(report["matched_keywords"])
        else:
            st.write("No matched keywords found.")

        st.subheader("Missing or Weak Keywords / Concepts")
        if report["missing_keywords"]:
            st.write(report["missing_keywords"])
        else:
            st.write("No missing keywords found.")

        st.subheader("Resume Improvement Tips")
        if report.get("improvement_tips"):
            for tip in report["improvement_tips"]:
                st.markdown(f"- {tip}")
        else:
            st.write("No improvement tips were generated.")

        st.subheader("Tailoring Plan")
        st.write(tailoring_plan["summary_suggestion"])

        with st.expander("Resume Text Preview"):
            st.text(results["resume_text"][:2000])

        with st.expander("Job Requirements Preview"):
            st.text(results["job_text"][:2000])

        st.subheader("Download Outputs")

        st.download_button(
            label="Download Fit Report TXT",
            data=read_file_bytes(results["text_report_path"]),
            file_name=Path(results["text_report_path"]).name,
            mime="text/plain",
        )

        st.download_button(
            label="Download Fit Report Word",
            data=read_file_bytes(results["word_report_path"]),
            file_name=Path(results["word_report_path"]).name,
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

        st.download_button(
            label="Download Tailored Resume Word",
            data=read_file_bytes(results["tailored_word_path"]),
            file_name=Path(results["tailored_word_path"]).name,
            mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

        if results["claude_word_path"]:
            st.subheader("Claude AI Safety Review")

            safety = results["claude_safety_review"]
            if safety["has_warnings"]:
                st.warning(safety["review_message"])
            else:
                st.info(safety["review_message"])

            st.download_button(
                label="Download Claude Tailored Resume Word",
                data=read_file_bytes(results["claude_word_path"]),
                file_name=Path(results["claude_word_path"]).name,
                mime="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )

    except Exception as error:
        st.error("Something went wrong while running the analysis.")
        st.exception(error)