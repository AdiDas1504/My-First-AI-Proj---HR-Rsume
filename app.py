from src.resume_reader import read_resume
from src.job_reader import read_job_post
from src.display_utils import print_preview


def main():
    print("Welcome to JobFit AI Resume Tailor")
    print("Version 5: Reading resume and job posting with Hebrew display support")
    print()

    resume_path = "data/resumes/sample_resume.pdf"

    job_source = input("Paste the job posting URL: ").strip()

    resume_text = read_resume(resume_path)
    job_text = read_job_post(job_source)

    print()
    print("Resume text extracted and cleaned successfully!")
    print(f"Resume characters extracted: {len(resume_text)}")
    print()

    print("Job posting text extracted and cleaned successfully!")
    print(f"Job posting characters extracted: {len(job_text)}")
    print()

    print_preview("Resume preview", resume_text, max_chars=700)
    print()
    print_preview("Job posting preview", job_text, max_chars=1000)


if __name__ == "__main__":
    main()