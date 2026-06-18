from src.resume_reader import read_resume


def main():
    print("Welcome to JobFit AI Resume Tailor")
    print("Version 3: Reading and cleaning resume files")
    print()

    resume_path = "data/resumes/sample_resume.pdf"

    resume_text = read_resume(resume_path)

    print("Resume text extracted and cleaned successfully!")
    print()
    print(f"Total characters extracted: {len(resume_text)}")
    print()

    if len(resume_text) < 200:
        print("Warning: Very little text was extracted.")
        print("This may be a scanned PDF or an image-based resume.")
        print("Later, we will handle this with OCR.")
        print()

    print("First 1000 characters:")
    print("-" * 50)
    print(resume_text[:1000])
    print("-" * 50)


if __name__ == "__main__":
    main()