# DATA PRIVACY — JobFit AI Resume Tailor

## 1. Purpose

This document defines the data privacy rules for JobFit AI Resume Tailor.

The product processes resumes and job postings. Resumes may contain sensitive personal information, so the system must be designed to reduce privacy risks and prevent accidental exposure.

This document explains:

* What data the system handles
* Where data is stored
* What must not be committed to GitHub
* How API keys should be protected
* What privacy risks exist
* What privacy controls should be added before AI integration and deployment

---

## 2. Types of Data Processed

The system may process the following data types:

## 2.1 Resume Data

Resume files may include:

* Full name
* Email address
* Phone number
* City or location
* LinkedIn profile
* Portfolio links
* Work history
* Education
* Skills
* Certifications
* Military service
* Languages
* Achievements
* Personal projects

This is considered sensitive personal data.

## 2.2 Job Posting Data

Job posting data may include:

* Company name
* Job title
* Job description
* Job requirements
* Salary range, if included
* Location
* Hiring manager or recruiter information
* Internal company wording

Job posting data may be public, but screenshots or saved files may still include user-specific or platform-specific information.

## 2.3 Generated Output Data

Generated files may include:

* Fit report
* Match score
* Matched keywords
* Missing keywords
* Resume improvement suggestions
* Tailored resume draft
* AI-generated resume rewrite in future versions

Generated output may include personal resume information and must be treated as private.

## 2.4 Secret Data

Secret data includes:

* API keys
* Environment variables
* Authentication tokens
* Service credentials

Secret data must never be committed to GitHub.

---

## 3. Current Local Storage

The current MVP stores files locally.

Current folders:

```text
data/resumes/
data/job_posts/
output/
```

## 3.1 data/resumes/

This folder stores resume files used for testing.

Privacy rule:

Resume files must not be committed to GitHub.

## 3.2 data/job_posts/

This folder stores job posting screenshots or test job files.

Privacy rule:

Job screenshots and job source files must not be committed to GitHub.

## 3.3 output/

This folder stores generated reports and tailored resume drafts.

Privacy rule:

Output files must not be committed to GitHub because they may contain personal data.

---

## 4. GitHub Privacy Rules

The project must not commit the following files or folders:

```text
.venv/
.env
data/resumes/*
data/job_posts/*
output/*
__pycache__/
*.pyc
```

The project may commit only placeholder `.gitkeep` files to preserve empty folders.

Required `.gitignore` rules:

```gitignore
# Python virtual environment
.venv/

# Python cache
__pycache__/
*.pyc

# Environment variables and secrets
.env

# Private user data
data/resumes/*
data/job_posts/*

# Generated output files
output/*

# Keep empty folders
!data/resumes/.gitkeep
!data/job_posts/.gitkeep
!output/.gitkeep
```

---

## 5. API Key Privacy

When AI integration is added, API keys must be stored in a `.env` file.

Example:

```env
Claude_API_KEY=your_api_key_here
```

Rules:

* The API key must not be hardcoded in Python files.
* The API key must not be committed to GitHub.
* The `.env` file must be included in `.gitignore`.
* The application should read the API key from environment variables.
* The application should show a clear error if the API key is missing.

---

## 6. AI Provider Data Considerations

When the product connects to an external AI API, resume text and job requirement text may be sent to the AI provider for processing.

Before sending data to an external AI API, the product should clearly inform the user that:

* Resume content may be processed by an external AI service.
* Job posting content may be processed by an external AI service.
* The user should review the output before using it.
* The user should not upload data they do not want processed.
* The system does not guarantee job success.

For the local MVP, this notice can be included in documentation and terminal messages.

For a future UI version, this notice should appear before AI processing.

---

## 7. Consent Requirement

Before AI processing is added, the system should eventually ask for user consent.

Example consent text:

“Your resume and job posting text may be sent to an AI provider to generate a tailored resume draft. Do not continue if you do not want this information processed by an external AI service.”

The user should confirm before AI processing.

For the first technical MVP, this may be handled manually.
For the UI version, it should be a clear checkbox or confirmation step.

---

## 8. Data Minimization

The system should process only the data needed to generate the analysis.

Rules:

* Do not store unnecessary copies of resumes.
* Do not store unnecessary copies of job postings.
* Do not log full resume text by default.
* Do not send more text to AI than needed.
* Limit extracted text length when sending to AI.
* Avoid storing raw AI prompts unless needed for debugging and approved by the user.

---

## 9. Local Processing Rules

In the current MVP:

* Resume files are processed locally.
* Job screenshots are processed locally using OCR.
* Reports are generated locally.
* Tailored resume drafts are generated locally.
* No database is used.
* No cloud storage is used.
* No user accounts exist.

This lowers privacy risk during development.

---

## 10. Output File Privacy

Generated output files may contain personal data.

Examples:

```text
output/fit_report_20260620_143000.txt
output/fit_report_20260620_143000.docx
output/tailored_resume_20260620_143000.docx
```

Rules:

* Output files must stay local.
* Output files must not be committed to GitHub.
* Output files should be deleted when no longer needed.
* Future versions should offer a cleanup option.

---

## 11. Logging Policy

The MVP should avoid logging personal data.

Allowed logs:

```text
Resume extraction completed.
Resume character count: 4,500.
Job extraction completed.
Job character count: 2,000.
Report generated successfully.
```

Not allowed logs:

```text
Full resume text
Full phone number
Full email address
Full AI prompt containing resume text
API key
```

If debugging requires viewing extracted text, it should be done locally and not committed.

---

## 12. Error Handling and Privacy

Error messages should be helpful but should not expose sensitive information unnecessarily.

Good error:

```text
Resume file could not be read. Please check that the file is a valid PDF or DOCX.
```

Bad error:

```text
Failed to read C:\Users\Name\PrivateFolder\PersonalResumeWithPhoneNumber.pdf
```

Where possible, avoid printing full private paths or full sensitive content.

---

## 13. Privacy Risks

## Risk 1 — Accidental GitHub Commit

A developer may accidentally commit resumes, screenshots, or output files.

Mitigation:

* Use `.gitignore`.
* Run `git status` before every commit.
* Review files before `git add`.
* Never run `git add .` without checking status when sensitive files exist.

## Risk 2 — API Key Exposure

A developer may accidentally commit an API key.

Mitigation:

* Store keys in `.env`.
* Ignore `.env`.
* Never paste keys into code.
* Rotate exposed keys immediately if leakage occurs.

## Risk 3 — AI Provider Processing Sensitive Data

When AI is connected, resume data may be sent to an external service.

Mitigation:

* Add user consent.
* Minimize text sent to AI.
* Avoid sending unnecessary personal details when possible.
* Add clear privacy notice.

## Risk 4 — Generated Output Contains Private Data

Reports and tailored resumes may include personal information.

Mitigation:

* Store output locally.
* Ignore output folder in Git.
* Provide cleanup instructions.
* Do not upload generated files publicly.

## Risk 5 — Debug Files Contain Personal Data

Debug files may include extracted resume or job text.

Mitigation:

* Store debug files only locally.
* Add debug files to `.gitignore`.
* Delete debug files after use.
* Avoid debug output in GitHub.

---

## 14. Recommended Developer Workflow

Before committing:

1. Run:

```powershell
git status
```

2. Check that no private files appear.

Private files include:

```text
resume files
job screenshots
output reports
.env
debug files
```

3. Add only safe files.

Example safe commit:

```powershell
git add app.py src/analyzer.py docs/DATA_PRIVACY.md
git commit -m "Add data privacy documentation"
git push
```

Avoid:

```powershell
git add .
```

when private test files exist, unless you have carefully checked `.gitignore`.

---

## 15. Future Privacy Features

Future versions should include:

* User consent screen
* Local file cleanup button
* Temporary file storage
* Automatic deletion after processing
* Redaction of phone/email before AI processing if needed
* Option to run without AI API
* Privacy notice in UI
* Secure upload handling
* Server-side file deletion policy
* Data retention policy
* User-controlled delete option

---

## 16. Deployment Privacy Requirements

Before cloud deployment, the project must define:

* Where files are stored
* How long files are stored
* Who can access files
* Whether files are encrypted
* How users delete their data
* How API keys are managed
* Whether logs contain personal data
* How errors are monitored safely
* Whether the system complies with applicable privacy rules

The current MVP is local only and should not be treated as production-ready.

---

## 17. Privacy Checklist Before AI Integration

Before connecting AI, confirm:

* `.env` exists and is ignored by Git.
* API keys are not hardcoded.
* Resume files are ignored by Git.
* Job screenshots are ignored by Git.
* Output files are ignored by Git.
* User receives an AI processing notice.
* AI prompt does not include unnecessary data.
* AI output includes an honesty warning.
* No full resume text is logged unnecessarily.

---

## 18. Privacy Checklist Before Deployment

Before deployment, confirm:

* File upload security is designed.
* Temporary storage is controlled.
* User consent is implemented.
* Data deletion process exists.
* Logs do not expose personal data.
* API keys are stored securely.
* Output files are protected.
* Unauthorized users cannot access files.
* Clear privacy notice is available to users.

---

## 19. Current Privacy Status

Current status:

* Resume files are stored locally.
* Job screenshots are stored locally.
* Output files are stored locally.
* `.gitignore` protects private folders.
* No database is used.
* No cloud deployment exists.
* AI integration has not yet been added.
* API key handling is planned through `.env`.

Current privacy maturity:

Development-stage privacy controls are in place, but production-level privacy controls are not yet implemented.

---

## 20. Next Privacy Steps

Recommended next steps:

1. Confirm `.gitignore` is correct.
2. Add `.env` handling before AI integration.
3. Add user notice before AI processing.
4. Add cleanup instructions.
5. Add privacy section to README.
6. Add privacy checks to TEST_PLAN.md.
