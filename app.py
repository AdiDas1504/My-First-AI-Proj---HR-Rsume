from src.resume_reader import read_resume
from src.job_reader import read_job_post
from src.analyzer import analyze_match
from src.display_utils import print_preview
from src.report_generator import generate_fit_report, print_fit_report
from src.resume_tailor import generate_tailoring_plan, print_tailoring_plan
from src.output_writer import save_text_report, save_word_report


def main():
    print("Welcome to JobFit AI Resume Tailor")
    print("Version 9: Export candidate fit report")
    print()

    resume_path = "data/resumes/sample_resume.pdf"

    job_source = input("Paste the job posting URL or image path: ").strip()

    resume_text = read_resume(resume_path)
    job_text = read_job_post(job_source)

    analysis = analyze_match(resume_text, job_text)
    report = generate_fit_report(analysis)
    tailoring_plan = generate_tailoring_plan(analysis)

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

    print()
    print_preview("Resume preview", resume_text, max_chars=500)
    print()
    print_preview("Job requirements preview", job_text, max_chars=700)


if __name__ == "__main__":
    main()