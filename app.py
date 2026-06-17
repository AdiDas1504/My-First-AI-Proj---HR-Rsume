from src.resume_reader import read_resume


def main():
    print("Welcome to JobFit AI Resume Tailor")
    print("Version 2: Reading resume files")
    print()

    resume_path = "data/resumes/sample_resume.pdf"

    resume_text = read_resume(resume_path)

    print("Resume text extracted successfully!")
    print()
    print("First 1000 characters:")
    print("-" * 50)
    print(resume_text[:1000])
    print("-" * 50)


if __name__ == "__main__":
    main()