# USER STORIES — JobFit AI Resume Tailor

## 1. Purpose

This document defines the main user stories for JobFit AI Resume Tailor.

User stories describe what the user wants to do, why it matters, and how we know the feature works.

The standard format is:

As a [type of user],
I want to [do something],
so that [I get value].

Each user story includes acceptance criteria that define when the feature is considered complete.

## 2. Primary User

The primary user is a job candidate.

The candidate wants to understand whether their resume fits a specific job posting and how to improve the resume honestly and effectively.

## 3. User Story Categories

The user stories are grouped into the following epics:

1. Resume Input
2. Job Posting Input
3. Job Requirement Extraction
4. Match Analysis
5. Candidate Fit Report
6. Resume Tailoring Recommendations
7. Tailored Resume Draft
8. Export
9. Privacy and Safety
10. AI Assistance
11. User Interface
12. Error Handling

---

# Epic 1 — Resume Input

## User Story 1.1 — Upload PDF Resume

As a job candidate,
I want to upload my resume as a PDF file,
so that the system can analyze my existing resume without requiring me to copy and paste the text manually.

### Acceptance Criteria

* The system accepts a PDF resume file.
* The system extracts readable text from the PDF.
* The system cleans unnecessary spaces and formatting issues.
* The system warns the user if very little text was extracted.
* The resume file is not committed to GitHub.

### Status

Partially implemented.

---

## User Story 1.2 — Upload Word Resume

As a job candidate,
I want to upload my resume as a Word document,
so that the system can analyze resumes that are written in a standard editable format.

### Acceptance Criteria

* The system accepts a DOCX file.
* The system extracts paragraph text from the Word document.
* The system cleans the extracted text.
* The system rejects unsupported file types.
* The system explains the error if the file cannot be read.

### Status

Partially implemented.

---

## User Story 1.3 — Detect Poor Resume Extraction

As a job candidate,
I want the system to detect when my resume was not extracted properly,
so that I know when the analysis may be inaccurate.

### Acceptance Criteria

* The system checks how much text was extracted.
* The system warns if the extracted resume text is too short.
* The system suggests using a clearer PDF or Word file.
* Future versions may support OCR for scanned resumes.

### Status

Partially implemented.

---

# Epic 2 — Job Posting Input

## User Story 2.1 — Provide Job Posting URL

As a job candidate,
I want to paste a job posting URL,
so that the system can analyze the job requirements without making me copy the job description manually.

### Acceptance Criteria

* The system accepts a valid URL.
* The system reads the webpage.
* The system extracts visible job-related text.
* The system filters irrelevant page content when possible.
* The system warns if the site blocks reading or requires login.

### Status

Partially implemented.

---

## User Story 2.2 — Provide Job Posting Screenshot

As a job candidate,
I want to upload or provide a screenshot of a job posting,
so that I can use the system even when the job site blocks links, requires login, or appears inside another platform.

### Acceptance Criteria

* The system accepts image files such as PNG, JPG, JPEG, and WEBP.
* The system uses OCR to extract text from the screenshot.
* The system supports English OCR.
* The system attempts Hebrew OCR when available.
* The system warns if little text was extracted.
* The image file is not committed to GitHub.

### Status

Partially implemented.

---

## User Story 2.3 — Full Screenshot Support

As a job candidate,
I want to upload a full-page screenshot of a job posting,
so that I do not need to manually crop only the requirements section.

### Acceptance Criteria

* The system can process a full screenshot.
* The system searches for relevant sections such as Requirements, Qualifications, Must Have, Nice to Have, דרישות, חובה, יתרון.
* The system ignores irrelevant areas such as menus, cookies, login buttons, share buttons, and similar jobs.
* The system prioritizes job requirements over general page text.

### Status

Partially implemented.

---

# Epic 3 — Job Requirement Extraction

## User Story 3.1 — Extract Requirement Sections

As a job candidate,
I want the system to identify the real job requirements,
so that the match analysis is based on relevant information rather than the whole webpage.

### Acceptance Criteria

* The system detects English requirement sections.
* The system detects Hebrew requirement sections.
* The system extracts responsibilities, qualifications, must-have requirements, and nice-to-have requirements.
* The system removes obvious website noise.
* The system keeps enough context for analysis.

### Status

Partially implemented.

---

## User Story 3.2 — Support Hebrew and English Jobs

As a job candidate,
I want the system to support both Hebrew and English job postings,
so that I can use it for local and international roles.

### Acceptance Criteria

* The system extracts English job text.
* The system extracts Hebrew job text.
* The system displays Hebrew text in a readable way in the terminal.
* The system supports basic Hebrew-English concept matching.
* Future versions should improve bilingual semantic analysis using AI.

### Status

Partially implemented.

---

# Epic 4 — Match Analysis

## User Story 4.1 — Calculate Fit Score

As a job candidate,
I want to receive a fit score,
so that I can quickly understand how closely my resume matches the job posting.

### Acceptance Criteria

* The system compares resume content with job requirements.
* The system calculates a fit score.
* The system shows the score clearly.
* The system does not present the score as an absolute hiring prediction.
* The system explains that the score is based on extracted text and matching logic.

### Status

Implemented as a basic version.

---

## User Story 4.2 — Identify Matched Areas

As a job candidate,
I want to see which parts of my resume match the job requirements,
so that I know what strengths to emphasize.

### Acceptance Criteria

* The system identifies matched concepts or keywords.
* The system displays matched areas in the report.
* The system uses concept groups where possible.
* The system supports some Hebrew-English matching.

### Status

Partially implemented.

---

## User Story 4.3 — Identify Missing or Weak Areas

As a job candidate,
I want to see which job requirements are missing or weak in my resume,
so that I know what to improve before applying.

### Acceptance Criteria

* The system identifies missing or weak concepts.
* The system displays missing areas clearly.
* The system marks missing items as “add only if true”.
* The system does not instruct the user to add false experience.

### Status

Partially implemented.

---

# Epic 5 — Candidate Fit Report

## User Story 5.1 — Generate Candidate Fit Report

As a job candidate,
I want to receive a structured fit report,
so that I can understand my match level, strengths, gaps, and next steps.

### Acceptance Criteria

* The report includes fit score.
* The report includes fit level.
* The report includes recommendation.
* The report includes matched concepts.
* The report includes missing or weak concepts.
* The report includes resume improvement tips.

### Status

Implemented.

---

## User Story 5.2 — Explain Recommendation

As a job candidate,
I want the system to explain whether I should apply, tailor carefully, or reconsider,
so that I can decide how much effort to invest in the application.

### Acceptance Criteria

* The system classifies the match level.
* The system provides a recommendation based on the score.
* The recommendation is practical and not misleading.
* The recommendation does not guarantee interview success.

### Status

Implemented as a basic version.

---

# Epic 6 — Resume Tailoring Recommendations

## User Story 6.1 — Suggest What to Emphasize

As a job candidate,
I want the system to tell me which existing experiences to emphasize,
so that I can tailor my resume more effectively.

### Acceptance Criteria

* The system uses matched concepts to suggest areas to emphasize.
* The system does not add new experience.
* The system gives practical guidance for resume sections.
* The system recommends focusing on real experience.

### Status

Partially implemented.

---

## User Story 6.2 — Suggest What to Add Only If True

As a job candidate,
I want the system to tell me which missing keywords I may add only if they are true,
so that I can improve my resume without lying.

### Acceptance Criteria

* The system lists missing concepts.
* Each missing concept is marked as “add only if true”.
* The system does not present missing items as facts.
* The system reinforces honesty rules.

### Status

Implemented as a basic version.

---

## User Story 6.3 — Provide Bullet Rewrite Guidelines

As a job candidate,
I want guidance on how to rewrite bullet points,
so that my resume better communicates responsibility, impact, and relevance.

### Acceptance Criteria

* The system suggests action-oriented bullet writing.
* The system suggests adding context and business value.
* The system suggests adding measurable impact where true.
* The system warns not to invent numbers or achievements.

### Status

Implemented as a basic version.

---

# Epic 7 — Tailored Resume Draft

## User Story 7.1 — Generate Tailored Resume Draft

As a job candidate,
I want the system to generate a tailored resume draft,
so that I have a starting point for editing my resume for the specific job.

### Acceptance Criteria

* The system generates a tailored resume draft.
* The draft includes a targeted profile direction.
* The draft includes areas to emphasize.
* The draft includes missing items to add only if true.
* The draft includes the original extracted resume text.
* The draft does not invent candidate experience.

### Status

Partially implemented.

---

## User Story 7.2 — Preserve Honesty

As a job candidate,
I want the tailored resume draft to avoid false claims,
so that I do not submit inaccurate or misleading information.

### Acceptance Criteria

* The system includes an honesty rule in the draft.
* The system marks unsupported items as “add only if true”.
* The system does not automatically add missing skills as facts.
* Future AI output must follow the same rule.

### Status

Partially implemented.

---

# Epic 8 — Export

## User Story 8.1 — Export Fit Report as TXT

As a job candidate,
I want to export the fit report as a text file,
so that I can save or review the analysis later.

### Acceptance Criteria

* The system creates a TXT report.
* The report is saved in the output folder.
* The file includes the fit report and tailoring recommendations.
* The output folder is ignored by Git.

### Status

Implemented.

---

## User Story 8.2 — Export Fit Report as Word

As a job candidate,
I want to export the fit report as a Word document,
so that I can read it in a more user-friendly format.

### Acceptance Criteria

* The system creates a DOCX report.
* The Word document includes headings.
* The Word document includes bullet lists.
* The file is saved in the output folder.
* The output file is not committed to GitHub.

### Status

Implemented.

---

## User Story 8.3 — Export Tailored Resume Draft as Word

As a job candidate,
I want to export the tailored resume draft as a Word document,
so that I can edit it manually before applying.

### Acceptance Criteria

* The system creates a DOCX tailored resume draft.
* The draft is saved in the output folder.
* The user can open and edit the file.
* The system does not treat the draft as final without user review.

### Status

Implemented as a basic version.

---

# Epic 9 — Privacy and Safety

## User Story 9.1 — Keep Resume Files Private

As a job candidate,
I want my resume file to remain private,
so that my personal information is not accidentally uploaded to GitHub.

### Acceptance Criteria

* Resume files are stored in a local ignored folder.
* `.gitignore` excludes resume files.
* The project documentation warns not to commit resumes.
* The system should avoid exposing personal data in public repositories.

### Status

Partially implemented.

---

## User Story 9.2 — Keep Output Files Private

As a job candidate,
I want generated reports and tailored drafts to remain private,
so that sensitive personal information is not uploaded publicly.

### Acceptance Criteria

* Output files are stored in the output folder.
* `.gitignore` excludes generated output files.
* Only `.gitkeep` is committed.
* Documentation explains why output files are ignored.

### Status

Implemented.

---

## User Story 9.3 — Keep API Keys Secret

As a developer,
I want API keys to be stored outside the code,
so that secrets are not exposed in GitHub.

### Acceptance Criteria

* API keys are stored in `.env`.
* `.env` is included in `.gitignore`.
* The code reads API keys from environment variables.
* The API key is never hardcoded.

### Status

Planned.

---

# Epic 10 — AI Assistance

## User Story 10.1 — Generate AI-Powered Resume Rewrite

As a job candidate,
I want AI to rewrite my resume for a specific job,
so that I get a stronger tailored draft based on my real experience.

### Acceptance Criteria

* AI receives resume text and job requirements.
* AI receives strict honesty rules.
* AI does not invent unsupported experience.
* AI marks missing requirements as “add only if true”.
* AI output is saved as Word.
* User must review the draft before using it.

### Status

Planned.

---

## User Story 10.2 — AI Semantic Match Analysis

As a job candidate,
I want AI to understand meaning beyond exact keywords,
so that the fit analysis is more accurate.

### Acceptance Criteria

* AI compares resume content and job requirements semantically.
* AI explains why the candidate matches or does not match.
* AI separates strong evidence from weak evidence.
* AI identifies missing requirements.
* AI avoids unsupported assumptions.

### Status

Planned.

---

# Epic 11 — User Interface

## User Story 11.1 — Upload Resume Through UI

As a job candidate,
I want to upload my resume through a simple interface,
so that I do not need to use the terminal.

### Acceptance Criteria

* User can upload PDF or DOCX.
* User sees the uploaded file name.
* User receives an error if the file is unsupported.
* User can replace the file before analysis.

### Status

Planned.

---

## User Story 11.2 — Provide Job URL or Screenshot Through UI

As a job candidate,
I want to paste a job URL or upload a screenshot through the interface,
so that I can analyze any job posting easily.

### Acceptance Criteria

* User can paste a URL.
* User can upload an image.
* User can choose which input type to use.
* User receives a clear error if extraction fails.

### Status

Planned.

---

## User Story 11.3 — Download Reports Through UI

As a job candidate,
I want to download the fit report and tailored resume draft,
so that I can review and edit them outside the app.

### Acceptance Criteria

* User can download the fit report.
* User can download the tailored resume draft.
* Files are generated only after analysis.
* Downloaded files are clearly named.

### Status

Planned.

---

# Epic 12 — Error Handling

## User Story 12.1 — Unsupported Resume File

As a job candidate,
I want a clear error message if my resume file is unsupported,
so that I know how to fix the issue.

### Acceptance Criteria

* The system rejects unsupported file types.
* The error message explains supported formats.
* The system does not crash without explanation.

### Status

Partially implemented.

---

## User Story 12.2 — Failed Job URL Reading

As a job candidate,
I want a clear error message if the system cannot read a job URL,
so that I can use a screenshot instead.

### Acceptance Criteria

* The system detects when URL extraction fails.
* The system explains possible reasons.
* The system suggests using a screenshot as fallback.

### Status

Partially implemented.

---

## User Story 12.3 — Weak OCR Extraction

As a job candidate,
I want to know when screenshot text extraction is weak,
so that I can upload a clearer screenshot.

### Acceptance Criteria

* The system checks the amount of extracted text.
* The system warns if OCR output is too short.
* The system suggests using a clearer image.

### Status

Partially implemented.

---

# 4. MVP User Stories

The MVP should include the following user stories:

* 1.1 Upload PDF Resume
* 1.2 Upload Word Resume
* 2.1 Provide Job Posting URL
* 2.2 Provide Job Posting Screenshot
* 2.3 Full Screenshot Support
* 3.1 Extract Requirement Sections
* 3.2 Support Hebrew and English Jobs
* 4.1 Calculate Fit Score
* 4.2 Identify Matched Areas
* 4.3 Identify Missing or Weak Areas
* 5.1 Generate Candidate Fit Report
* 6.1 Suggest What to Emphasize
* 6.2 Suggest What to Add Only If True
* 7.1 Generate Tailored Resume Draft
* 8.2 Export Fit Report as Word
* 8.3 Export Tailored Resume Draft as Word
* 9.1 Keep Resume Files Private
* 9.2 Keep Output Files Private
* 12.1 Unsupported Resume File
* 12.2 Failed Job URL Reading
* 12.3 Weak OCR Extraction

# 5. Definition of Done

A user story is considered done when:

1. The feature works locally.
2. The feature was manually tested.
3. Errors are handled clearly.
4. Sensitive files are not committed to GitHub.
5. The code is committed to Git.
6. The relevant documentation is updated.
7. The feature supports the product goal defined in the PRD.

# 6. Current Next Steps

The next recommended documents are:

1. TECHNICAL_DESIGN.md
2. AI_POLICY.md
3. DATA_PRIVACY.md
4. TEST_PLAN.md

After those are complete, the project can continue to AI integration and user interface development.
