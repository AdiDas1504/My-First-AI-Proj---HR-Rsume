from src.resume_reader import read_resume
from src.job_reader import read_job_post
from src.analyzer import analyze_match
from src.display_utils import print_preview, prepare_for_terminal_display


def print_keyword_list(title, keywords):
    print(title)
    print("-" * 50)

    if not keywords:
        print("No keywords found.")
    else:
        for keyword in keywords:
            print(f"- {prepare_for_terminal_display(keyword)}")

    print("-" * 50)
    print()


def main():
    print("Welcome to JobFit AI Resume Tailor")
    print("Version 6: Basic resume-job match analysis")
    print()

    resume_path = "data/resumes/sample_resume.pdf"

    job_source = input("Paste the job posting URL: ").strip()

    resume_text = read_resume(resume_path)
    job_text = read_job_post(job_source)

    analysis = analyze_match(resume_text, job_text)

    print()
    print("Resume text extracted and cleaned successfully!")
    print(f"Resume characters extracted: {len(resume_text)}")
    print()

    print("Job posting text extracted and cleaned successfully!")
    print(f"Job posting characters extracted: {len(job_text)}")
    print()

    print("Basic Match Analysis")
    print("=" * 50)
    print(f"Fit score: {analysis['fit_score']}%")
    print(f"Job keywords analyzed: {analysis['job_keyword_count']}")
    print(f"Unique resume words found: {analysis['resume_word_count']}")
    print("=" * 50)
    print()

    print_keyword_list("Matched keywords", analysis["matched_keywords"])
    print_keyword_list("Missing or weak keywords", analysis["missing_keywords"])

    print_preview("Resume preview", resume_text, max_chars=500)
    print()
    print_preview("Job posting preview", job_text, max_chars=700)


if __name__ == "__main__":
    main()