# PRD — JobFit AI Resume Tailor

## 1. Product Name

JobFit AI Resume Tailor

## 2. Product Vision

JobFit AI Resume Tailor helps job candidates understand how well their resume matches a specific job posting and generate a tailored resume draft based on the job requirements, without inventing false experience.

The product is designed to help candidates improve the way they present their real background, not to fabricate skills, achievements, education, or work history.

## 3. Target User

The primary user is a job candidate who wants to apply for a specific role.

The user may have:

* A resume in PDF or Word format
* A job posting URL
* A screenshot or image of a job posting
* Limited knowledge of how to tailor a resume professionally
* A need for fast, clear, and practical feedback

## 4. User Problem

Candidates often struggle to understand:

* Whether their resume matches a specific job
* Which requirements they already meet
* Which important keywords or skills are missing from their resume
* How to adjust their resume without lying
* How to present their real experience in a way that fits the role better

This creates wasted time, weak applications, and uncertainty before applying.

## 5. Product Goal

The product should help the candidate:

1. Upload a resume file.
2. Provide a job posting using a URL or screenshot.
3. Extract the relevant job requirements.
4. Analyze the match between the resume and the job.
5. Show a fit score and explanation.
6. Identify matched and missing areas.
7. Recommend resume improvements.
8. Generate a tailored resume draft.
9. Export the analysis and tailored draft to usable files.

## 6. MVP Scope

The first MVP should include:

### Resume Input

* PDF resume
* Word resume

### Job Posting Input

* Job posting URL
* Job posting screenshot or image

### Analysis

* Extract resume text
* Extract job requirements
* Clean extracted text
* Identify relevant job sections such as:

  * Requirements
  * Qualifications
  * Responsibilities
  * Must have
  * Nice to have
  * דרישות
  * חובה
  * יתרון
  * תחומי אחריות
* Compare resume content with job requirements
* Produce a basic fit score
* Identify matched concepts
* Identify missing or weak concepts

### Output

* Candidate fit report
* Resume tailoring recommendations
* Tailored resume draft
* TXT export
* Word export

## 7. Out of Scope for MVP

The MVP will not include:

* Automatic job application submission
* Candidate ranking against other candidates
* Employer-side screening
* Guarantee of interview or hiring success
* Full visual preservation of the original resume design
* Advanced ATS scoring
* User accounts
* Payment system
* Cloud deployment
* Database storage
* Multi-user dashboard

These may be considered in later versions.

## 8. Key Features

### Feature 1 — Resume File Reader

The system should allow the user to provide a resume file.

Supported formats:

* PDF
* DOCX

The system should extract readable text and clean it for analysis.

### Feature 2 — Job Posting Reader

The system should allow the user to provide a job posting through:

* URL
* Screenshot or image

The system should extract only the relevant job description and requirements, not the entire page.

### Feature 3 — Requirement Extraction

The system should detect and prioritize sections such as:

* Requirements
* Qualifications
* Responsibilities
* Must have
* Nice to have
* Skills
* Experience
* דרישות
* חובה
* יתרון
* תיאור התפקיד
* תחומי אחריות

### Feature 4 — Match Analysis

The system should compare resume text with job requirements and identify:

* Matched areas
* Missing areas
* Weak areas
* Relevant concepts
* Fit score

The current version may use keyword and concept-based matching. Later versions may use AI-based semantic analysis.

### Feature 5 — Candidate Fit Report

The system should generate a report that includes:

* Fit score
* Fit level
* Recommendation
* Matched keywords or concepts
* Missing or weak keywords or concepts
* Resume improvement tips

### Feature 6 — Resume Tailoring Plan

The system should suggest:

* What to emphasize
* What to add only if true
* How to rewrite bullet points
* Which parts of the resume may need more focus

### Feature 7 — Tailored Resume Draft

The system should generate a tailored resume draft based on:

* Existing resume text
* Matched job requirements
* Missing areas
* Safe rewriting rules

The draft must not invent information.

### Feature 8 — Export

The system should export:

* Fit report as TXT
* Fit report as Word
* Tailored resume draft as TXT
* Tailored resume draft as Word

## 9. AI Safety and Honesty Rules

The system must follow these rules:

1. Do not invent experience.
2. Do not invent skills.
3. Do not invent education.
4. Do not invent certifications.
5. Do not invent tools.
6. Do not invent numbers or achievements.
7. Do not invent companies or job titles.
8. Rewriting is allowed only when based on existing resume content.
9. Missing job requirements should be marked as “Add only if true”.
10. The user must review every AI-generated resume draft before using it.

## 10. Data Privacy Requirements

The system may process sensitive personal data from resumes.

Therefore:

* Resume files must not be committed to GitHub.
* Job screenshots must not be committed to GitHub.
* Output files must not be committed to GitHub.
* API keys must be stored in `.env`.
* `.env` must not be committed to GitHub.
* User data should be processed locally in the MVP.
* Future versions should include clear privacy notices.

## 11. Success Metrics

The MVP will be considered successful if:

* The system can read a PDF resume.
* The system can read a DOCX resume.
* The system can extract job requirements from a URL.
* The system can extract job requirements from a screenshot.
* The system can produce a fit score.
* The system can generate a useful candidate report.
* The system can generate a safe tailored resume draft.
* The system can export results to Word.
* The system avoids fabricating candidate experience.

## 12. User Flow

1. User provides resume file.
2. User provides job posting URL or screenshot.
3. System extracts resume text.
4. System extracts job requirements.
5. System cleans and prepares both texts.
6. System analyzes match.
7. System generates fit report.
8. System generates tailoring plan.
9. System generates tailored resume draft.
10. System exports report and draft.
11. User reviews and edits final resume manually.

## 13. Main Risks

### Risk 1 — Poor PDF Extraction

Some resumes may be designed in a way that makes text extraction difficult.

Mitigation:

* Use better PDF extraction libraries.
* Support DOCX.
* Add OCR fallback in future versions.

### Risk 2 — Poor OCR from Screenshots

Screenshots may be blurry, partial, or poorly structured.

Mitigation:

* Use OCR.
* Improve image preprocessing.
* Ask user for clearer screenshot if extraction is weak.

### Risk 3 — Website Blocks URL Reading

Some job sites may block scraping or require login.

Mitigation:

* Support screenshot upload.
* Support manual fallback in later versions.

### Risk 4 — AI Hallucination

AI may invent information.

Mitigation:

* Use strict prompts.
* Add honesty rules.
* Mark missing items as “Add only if true”.
* Require user review.

### Risk 5 — Privacy Exposure

Resumes contain personal information.

Mitigation:

* Use `.gitignore`.
* Avoid committing files.
* Store output locally.
* Add privacy documentation.

## 14. Future Enhancements

Future versions may include:

* AI-powered semantic fit analysis
* AI-generated resume rewrite
* Cover letter generation
* Interview preparation questions
* ATS keyword optimization
* Web interface
* Drag-and-drop file upload
* Multiple resume versions
* Multi-language support
* User authentication
* Cloud deployment
* Database storage
* Resume design preservation
* Export to formatted PDF

## 15. Current Product Status

Current status:

* Resume PDF reading works.
* Resume DOCX reading is planned and partially supported.
* Job URL reading works.
* Job screenshot OCR works.
* Text cleaning works.
* Basic concept-based matching works.
* Fit report export works.
* Word export works.
* Tailored resume draft export works.
* AI-powered rewrite has not yet been implemented.

## 16. Next Product Step

Before connecting a real AI model, the project should define:

* Roadmap
* User stories
* Technical design
* Test plan
* AI policy
* Data privacy policy

Only after these are documented should the project continue to AI integration.
