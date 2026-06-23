# TECHNICAL DESIGN — JobFit AI Resume Tailor

## 1. Purpose

This document describes the technical design of JobFit AI Resume Tailor.

It explains how the system is structured, how data flows between modules, what each file is responsible for, and how future AI features should be integrated safely.

This document connects the product requirements with the actual engineering implementation.

---

## 2. System Overview

JobFit AI Resume Tailor is a local Python-based application that helps job candidates analyze and tailor their resume for a specific job posting.

The system currently works through the terminal.

The user provides:

1. A resume file.
2. A job posting URL or screenshot.

The system then:

1. Extracts text from the resume.
2. Extracts job requirements from the job source.
3. Cleans and normalizes the extracted text.
4. Analyzes the match between resume and job requirements.
5. Generates a candidate fit report.
6. Generates resume tailoring recommendations.
7. Exports reports and tailored resume drafts to TXT and Word files.

---

## 3. Current Architecture

Current project structure:

```text
project-root/
│
├── app.py
├── requirements.txt
├── .gitignore
│
├── data/
│   ├── resumes/
│   └── job_posts/
│
├── output/
│
├── docs/
│   ├── PRD.md
│   ├── ROADMAP.md
│   ├── USER_STORIES.md
│   └── TECHNICAL_DESIGN.md
│
└── src/
    ├── resume_reader.py
    ├── job_reader.py
    ├── text_cleaner.py
    ├── display_utils.py
    ├── analyzer.py
    ├── report_generator.py
    ├── resume_tailor.py
    └── output_writer.py
```

---

## 4. Main Data Flow

The main flow is:

```text
Resume file
    ↓
resume_reader.py
    ↓
Extracted resume text
    ↓
text_cleaner.py
    ↓
Clean resume text

Job URL or image
    ↓
job_reader.py
    ↓
Extracted job requirements
    ↓
text_cleaner.py
    ↓
Clean job requirements text

Clean resume text + clean job requirements text
    ↓
analyzer.py
    ↓
Match analysis

Match analysis
    ↓
report_generator.py
    ↓
Candidate fit report

Match analysis + resume text
    ↓
resume_tailor.py
    ↓
Tailored resume draft

Reports and drafts
    ↓
output_writer.py
    ↓
TXT and Word files in output/
```

---

## 5. Module Responsibilities

## 5.1 app.py

`app.py` is the main entry point of the application.

Responsibilities:

* Start the program.
* Ask the user for a job posting URL or image path.
* Define the resume file path.
* Call the resume reader.
* Call the job reader.
* Run match analysis.
* Generate reports.
* Generate resume tailoring draft.
* Save output files.
* Print previews and status messages to the terminal.

Current limitation:

* The resume path is currently hardcoded.
* The user still interacts through the terminal.
* Future versions should replace this with a user interface.

---

## 5.2 resume_reader.py

`resume_reader.py` is responsible for reading resume files.

Supported formats:

* PDF
* DOCX

Current libraries:

* PyMuPDF / `pymupdf` for improved PDF extraction
* `pypdf` as fallback
* `python-docx` for Word files

Responsibilities:

* Detect file type.
* Read resume text.
* Clean extracted text.
* Return resume text to the main application.
* Raise clear errors for unsupported files or missing files.

Risks:

* Some PDF resumes are highly designed and difficult to extract.
* Multi-column resumes may produce text in the wrong order.
* Scanned resumes may require OCR.

Future improvements:

* OCR fallback for scanned resumes.
* Resume section detection.
* Better preservation of original resume structure.

---

## 5.3 job_reader.py

`job_reader.py` is responsible for reading job postings.

Supported sources:

* URL
* Image or screenshot

Current libraries:

* `requests` for URL reading
* `beautifulsoup4` for HTML parsing
* `pillow` for image handling
* `pytesseract` for OCR
* Tesseract OCR engine installed on the local machine

Responsibilities:

* Detect whether the source is a URL or image path.
* Extract job text from webpages.
* Extract job text from screenshots using OCR.
* Search for relevant job sections.
* Remove website noise.
* Return relevant job requirements text.

Relevant job sections include:

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

Noise to remove includes:

* Menus
* Cookies
* Login buttons
* Apply buttons
* Share buttons
* Similar jobs
* Privacy text
* Website navigation

Risks:

* Some websites block automated reading.
* Some websites require login.
* Some job pages load content dynamically.
* OCR quality may be poor.
* Hebrew OCR may require additional language support.

Future improvements:

* Browser-based extraction.
* OCR confidence scoring.
* Image preprocessing.
* Better Hebrew OCR support.
* Manual fallback option.

---

## 5.4 text_cleaner.py

`text_cleaner.py` is responsible for cleaning text extracted from files, URLs, and images.

Responsibilities:

* Remove extra spaces.
* Remove excessive blank lines.
* Clean line breaks.
* Fix some character-by-character extraction issues.
* Normalize extracted text before analysis.

Current limitation:

* Cleaning is still basic.
* Some PDF extraction issues may remain.
* Some OCR errors cannot be fixed reliably without AI or better preprocessing.

Future improvements:

* Better bullet preservation.
* Better Hebrew-English mixed text handling.
* Better section-based cleaning.
* Better handling of resume layout.

---

## 5.5 display_utils.py

`display_utils.py` is responsible for terminal display support.

Responsibilities:

* Improve Hebrew display in the terminal.
* Print text previews.
* Support right-to-left display using `python-bidi`.

Important rule:

This module is only for display.
It should not modify the actual text used for analysis or AI prompts.

---

## 5.6 analyzer.py

`analyzer.py` is responsible for comparing resume text with job requirements.

Current method:

* Keyword extraction.
* Stopword filtering.
* Concept-based matching.
* Hebrew-English concept groups.
* Fit score calculation.
* Matched and missing concept detection.

Concept groups include:

* Product management
* Project management
* Data and analytics
* AI and automation
* Security and cyber
* Technical systems
* Stakeholder management
* Business operations
* HR and people processes
* Management and leadership

Responsibilities:

* Extract meaningful concepts from job requirements.
* Check whether those concepts appear in the resume.
* Calculate fit score.
* Return matched and missing concepts.

Current limitation:

The current analysis is not true AI semantic reasoning.
It is a baseline matching system.

Future improvements:

* AI semantic fit analysis.
* Weighted scoring.
* Separate scoring for must-have and nice-to-have requirements.
* Strong/medium/weak evidence classification.
* Requirement-level explanations.

---

## 5.7 report_generator.py

`report_generator.py` is responsible for generating a candidate-facing fit report.

Responsibilities:

* Classify fit score into a fit level.
* Generate a recommendation.
* Display matched concepts.
* Display missing or weak concepts.
* Generate improvement tips.
* Print the report in the terminal.

Output includes:

* Fit score
* Fit level
* Recommendation
* Matched keywords or concepts
* Missing or weak keywords or concepts
* Resume improvement tips

Future improvements:

* More personalized recommendations.
* Separate sections for skills, experience, tools, education, and soft skills.
* AI-generated explanations.

---

## 5.8 resume_tailor.py

`resume_tailor.py` is responsible for generating resume tailoring recommendations and a first tailored resume draft.

Current method:

* Template-based tailoring.
* Uses matched concepts.
* Uses missing concepts.
* Adds honesty warnings.
* Generates a structured draft.

Responsibilities:

* Suggest what to emphasize.
* Suggest what to add only if true.
* Generate bullet rewriting guidelines.
* Generate a tailored resume draft.
* Avoid fabricating information.

Current limitation:

The current draft is not a full AI rewrite.
It is a structured, safe draft based on templates and analysis results.

Future improvements:

* AI-powered rewriting.
* Section-by-section resume editing.
* Better preservation of resume format.
* User confirmation before adding missing items.
* Final editable Word resume.

---

## 5.9 output_writer.py

`output_writer.py` is responsible for saving generated outputs.

Current exports:

* Candidate fit report as TXT
* Candidate fit report as Word
* Tailored resume draft as TXT
* Tailored resume draft as Word

Responsibilities:

* Create output files.
* Save files in the output folder.
* Format Word documents with headings and bullet lists.
* Return generated file paths.

Privacy rule:

Output files may contain personal data.
They must not be committed to GitHub.

Future improvements:

* Better Word formatting.
* PDF export.
* File naming based on candidate and job title.
* Automatic cleanup of temporary files.
* Download support in UI.

---

## 6. Dependencies

Current Python dependencies:

```text
pypdf
python-docx
requests
beautifulsoup4
python-bidi
pillow
pytesseract
pymupdf
```

External dependency:

```text
Tesseract OCR
```

Tesseract is required for image and screenshot OCR.

---

## 7. File and Data Storage

Current local folders:

```text
data/resumes/
data/job_posts/
output/
```

### data/resumes/

Stores local resume files for testing.

Privacy rule:

Resume files must not be committed to GitHub.

### data/job_posts/

Stores local job screenshots or test job files.

Privacy rule:

Job screenshots may contain company or user data and must not be committed to GitHub.

### output/

Stores generated reports and tailored resume drafts.

Privacy rule:

Output files may contain personal information and must not be committed to GitHub.

---

## 8. Git Ignore Rules

The project should ignore:

```text
.venv/
.env
__pycache__/
*.pyc
data/resumes/*
data/job_posts/*
output/*
```

The project may keep empty folders using `.gitkeep`.

Required exceptions:

```text
!data/resumes/.gitkeep
!data/job_posts/.gitkeep
!output/.gitkeep
```

---

## 9. Error Handling Strategy

The system should handle common errors clearly.

Examples:

### Unsupported resume file

Message should explain:

* Supported formats are PDF and DOCX.
* User should upload a valid file.

### Missing file

Message should explain:

* The file path does not exist.
* User should check the file name and folder.

### Failed URL extraction

Message should explain:

* Site may block automated reading.
* Site may require login.
* User can use a screenshot instead.

### Weak OCR extraction

Message should explain:

* Screenshot may be blurry or too small.
* User should upload a clearer screenshot.

### Missing Tesseract OCR

Message should explain:

* Tesseract OCR is not installed.
* User must install it before screenshot reading works.

---

## 10. Privacy and Security Considerations

The product handles sensitive personal data.

Sensitive data may include:

* Full name
* Email
* Phone number
* Work history
* Education
* Skills
* Personal links
* Job application intent

Current privacy controls:

* Resume files are ignored by Git.
* Job screenshots are ignored by Git.
* Output files are ignored by Git.
* API keys should be stored in `.env`.
* `.env` should be ignored by Git.

Future privacy requirements:

* User consent before sending resume data to an AI API.
* Clear privacy notice.
* Temporary file cleanup.
* Redaction options.
* Secure file upload handling in deployed versions.

---

## 11. AI Integration Design

AI integration is planned but should only be implemented after AI policy and data privacy documents are created.

Planned AI capabilities:

1. AI semantic fit analysis.
2. AI-generated resume rewrite.
3. AI-generated professional summary.
4. AI-generated bullet point improvements.
5. AI-generated missing requirement explanations.
6. AI honesty check.

AI input should include:

* Clean resume text
* Clean job requirements text
* Baseline match analysis
* Tailoring plan
* Strict honesty rules

AI output should include:

* Tailored professional summary
* Key strengths
* Suggested rewritten bullet points
* Missing items to add only if true
* Final tailored resume draft
* Honesty check

Strict AI rules:

* Do not invent experience.
* Do not invent skills.
* Do not invent education.
* Do not invent tools.
* Do not invent achievements.
* Do not invent numbers.
* Mark unsupported requirements as “add only if true”.
* Require user review before use.

---

## 12. Future User Interface Design

The current product runs in the terminal.

Future UI should support:

* Resume upload
* Job URL input
* Job screenshot upload
* Analyze button
* Loading/progress state
* Fit report display
* Tailored resume preview
* Download report
* Download tailored resume draft

Recommended first UI tool:

```text
Streamlit
```

Reason:

* Fast to build
* Good for AI demos
* Supports file uploads
* Supports buttons and downloads
* Good for MVP stage

Later versions may use:

* FastAPI backend
* React frontend
* Database
* Authentication
* Cloud deployment

---

## 13. Testing Strategy Overview

The project should test:

* PDF resume extraction
* DOCX resume extraction
* URL job extraction
* Screenshot OCR
* Hebrew job postings
* English job postings
* Mixed Hebrew-English postings
* Weak OCR cases
* Missing files
* Unsupported files
* Low match cases
* High match cases
* AI hallucination risk after AI integration

Testing should include both:

* Manual testing
* Automated unit tests in future versions

---

## 14. Current Technical Limitations

Current limitations:

* Terminal-based interaction
* Hardcoded resume path
* No UI
* No real AI model connected yet
* No automated tests
* Limited OCR quality control
* Limited semantic understanding
* Basic Word formatting
* No original resume design preservation
* No cloud deployment
* No database
* No user accounts

---

## 15. Recommended Next Technical Steps

Before AI integration:

1. Create `AI_POLICY.md`.
2. Create `DATA_PRIVACY.md`.
3. Create `TEST_PLAN.md`.
4. Improve error messages.
5. Make resume path user-configurable.
6. Add test files or test instructions.
7. Only then connect a real AI model.

After AI integration:

1. Add AI semantic analysis.
2. Add AI resume rewrite.
3. Add AI output validation.
4. Add UI.
5. Add automated tests.
6. Prepare deployment plan.

---

## 16. Technical Design Status

Current status:

* Core local pipeline is functional.
* Resume reading works.
* Job URL reading works partially.
* Job screenshot OCR works.
* Concept-based matching works.
* Report generation works.
* Word export works.
* Tailored resume draft export works.
* Documentation is in progress.
* AI integration is planned but not yet implemented.
