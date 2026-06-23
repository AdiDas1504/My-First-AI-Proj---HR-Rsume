from src.resume_reader import read_resume
from src.job_reader import read_job_post
from src.analyzer import analyze_match
from src.display_utils import print_preview
from src.report_generator import generate_fit_report, print_fit_report
from src.resume_tailor import (
    generate_tailoring_plan,
    print_tailoring_plan,
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
from src.ai_consent import ask_ai_consent
from src.claude_resume_writer import generate_claude_tailored_resume


def ask_required_input(message):
    """
    Ask the user for required input.
    Keep asking until the user provides a value.
    """
    while True:
        value = input(message).strip()

        if value:
            return value

        print("This field is required. Please provide a value.")
        print()


def main():
    print("Welcome to JobFit AI Resume Tailor")
    print("Version 13: User-provided resume and job source")
    print()

    resume_path = ask_required_input(
        "Paste your resume file path, PDF or DOCX: "
    )

    job_source = ask_required_input(
        "Paste the job posting URL, image path, PDF path, or DOCX path: "
    )

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

    output_file = save_text_report(
        report=report,
        tailoring_plan=tailoring_plan,
        resume_text=resume_text,
        job_text=job_text,
    )

    word_output_file = save_word_report(
        report=report,
        tailoring_plan=tailoring_plan,
        resume_text=resume_text,
        job_text=job_text,
    )

    tailored_resume_txt = save_tailored_resume_text(tailored_resume_text)
    tailored_resume_docx = save_tailored_resume_word(tailored_resume_text)

    claude_tailored_resume_docx = None

    if is_ai_configured():
        user_agreed = ask_ai_consent()

        if user_agreed:
            print()
            print("Generating Claude tailored resume. This may take a moment...")
            print()

            try:
                claude_tailored_resume_text = generate_claude_tailored_resume(
                    resume_text=resume_text,
                    job_text=job_text,
                    analysis=analysis,
                    tailoring_plan=tailoring_plan,
                )

                claude_tailored_resume_docx = save_claude_tailored_resume_word(
                    claude_tailored_resume_text
                )

            except Exception as error:
                print()
                print("Claude AI generation failed.")
                print("The non-AI reports were still generated successfully.")
                print(f"Error: {error}")
        else:
            print()
            print("Claude AI processing skipped by user.")
    else:
        print()
        print("Claude AI is not configured.")
        print("Skipping Claude AI generation and continuing with non-AI outputs.")
        print("To enable Claude, add ANTHROPIC_API_KEY and CLAUDE_MODEL to your .env file.")

    print()
    print("Resume text extracted and cleaned successfully!")
    print(f"Resume characters extracted: {len(resume_text)}")
    print()

    print("Relevant job requirements extracted and cleaned successfully!")
    print(f"Job posting characters extracted: {len(job_text)}")
    print()

    print_fit_report(report)

    print()
    print_tailoring_plan(tailoring_plan)

    print()
    print(f"Text report saved successfully: {output_file}")
    print(f"Word report saved successfully: {word_output_file}")
    print(f"Tailored resume TXT saved successfully: {tailored_resume_txt}")
    print(f"Tailored resume Word saved successfully: {tailored_resume_docx}")

    if claude_tailored_resume_docx:
        print(f"Claude tailored resume Word saved successfully: {claude_tailored_resume_docx}")

    print()
    print_preview("Resume preview", resume_text, max_chars=500)
    print()
    print_preview("Job requirements preview", job_text, max_chars=700)


if __name__ == "__main__":
    main()