# ROADMAP — JobFit AI Resume Tailor

## 1. Roadmap Purpose

This roadmap defines the planned development stages for JobFit AI Resume Tailor.

The goal is to build the product in controlled versions, where each version adds a clear capability and can be tested before moving forward.

The roadmap connects:

* Product management
* Project management
* Engineering
* AI development
* Testing
* Privacy and safety

## 2. Product Development Strategy

The product will be developed in stages.

Each version should answer:

1. What user problem does this version solve?
2. What feature is being added?
3. What technical capability is required?
4. How will we test it?
5. What risks should we watch?
6. What should not be included yet?

The project should avoid building too many features at once.

## 3. Current Product Status

Current implemented capabilities:

* Git and GitHub setup
* Python project structure
* Virtual environment
* Resume PDF reading
* Resume DOCX reading support
* Improved PDF extraction using PyMuPDF
* Job posting reading from URL
* Job posting reading from screenshot/image using OCR
* Hebrew and English display support
* Text cleaning
* Concept-based match analysis
* Candidate fit report
* Resume tailoring recommendations
* TXT report export
* Word report export
* Tailored resume draft export

Current limitations:

* No real AI model connected yet
* No user interface
* No drag-and-drop upload
* No cloud deployment
* No database
* No user accounts
* No advanced semantic analysis
* No final resume design preservation
* No automated testing framework yet

## 4. Version Roadmap

## V0 — Project Setup and Developer Workflow

### Goal

Set up the development environment and learn basic development workflow.

### Includes

* VS Code setup
* Python setup
* Git setup
* GitHub repository
* Virtual environment
* Basic project structure
* `.gitignore`
* `requirements.txt`

### Product Value

No direct user value yet. This version creates the technical foundation.

### Engineering Value

Allows safe development, version control, and structured project growth.

### Status

Completed.

---

## V1 — Resume File Reader

### Goal

Allow the system to read candidate resume files.

### Includes

* PDF resume input
* DOCX resume input
* Text extraction
* Basic text cleaning
* Handling missing or unsupported files

### Product Value

The candidate can provide a real resume file instead of manually copying text.

### Technical Notes

PDF extraction may be unstable depending on resume design. DOCX is usually more reliable.

### Status

Completed partially.

### Future Improvements

* OCR fallback for scanned resumes
* Better handling of multi-column resumes
* Better section detection inside resumes

---

## V2 — Job Posting Reader from URL

### Goal

Allow the user to provide a job posting link.

### Includes

* URL input
* HTML reading
* Text extraction from job pages
* Filtering irrelevant website text
* Identifying job requirement sections

### Product Value

The candidate can paste a job link instead of copying the job description manually.

### Risks

* Some websites block automated reading
* Some websites require login
* Some job content loads dynamically with JavaScript
* Some pages include unrelated text

### Status

Completed partially.

### Future Improvements

* Better site-specific parsing
* Browser-based extraction
* Fallback to screenshot upload when URL fails

---

## V3 — Job Posting Reader from Screenshot

### Goal

Allow the user to upload or provide a screenshot/image of a job posting.

### Includes

* Image input
* OCR using Tesseract
* Hebrew and English OCR support
* Extraction of relevant requirements from full-page screenshots

### Product Value

The user can provide job postings from LinkedIn, websites, WhatsApp, PDFs, or platforms that block URL reading.

### Risks

* Blurry screenshots
* Small text
* Poor OCR quality
* Mixed Hebrew and English text
* Multi-column layouts

### Status

Completed partially.

### Future Improvements

* Image preprocessing
* OCR confidence scoring
* Better Hebrew OCR support
* User warning when OCR quality is low

---

## V4 — Text Cleaning and Normalization

### Goal

Improve the quality of extracted text before analysis.

### Includes

* Removing extra spaces
* Removing blank lines
* Fixing character-by-character extraction
* Handling Hebrew and English text
* Normalizing text for matching

### Product Value

Cleaner text improves match analysis and future AI output.

### Status

Completed partially.

### Future Improvements

* Better resume section separation
* Better handling of bullet points
* Better preservation of original structure

---

## V5 — Basic Match Analysis

### Goal

Compare resume content with job requirements.

### Includes

* Keyword extraction
* Stopword filtering
* Hebrew-English concept matching
* Concept groups such as:

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
* Fit score calculation
* Matched and missing concepts

### Product Value

The candidate receives an initial understanding of how well the resume matches the job.

### Limitations

This is not full AI reasoning. It is a baseline analysis.

### Status

Completed partially.

### Future Improvements

* AI-based semantic matching
* Weighted scoring
* Requirement importance levels
* Separate scoring for must-have and nice-to-have requirements

---

## V6 — Candidate Fit Report

### Goal

Generate a structured report for the candidate.

### Includes

* Fit score
* Fit level
* Recommendation
* Matched concepts
* Missing or weak concepts
* Resume improvement tips

### Product Value

The user receives clear feedback instead of raw technical output.

### Status

Completed.

### Future Improvements

* More personalized recommendations
* Better explanation of why score was given
* Separate report sections for skills, experience, tools, education, and soft skills

---

## V7 — Resume Tailoring Draft

### Goal

Generate a safe first draft for tailoring the resume.

### Includes

* Tailored profile direction
* Areas to emphasize
* Missing areas to add only if true
* Bullet rewrite guidelines
* Draft export to TXT and Word

### Product Value

The candidate receives practical guidance on how to adapt the resume.

### Limitations

The current draft is template-based and not fully AI-written.

### Status

Completed partially.

### Future Improvements

* AI-powered rewrite
* Section-by-section resume editing
* Better preservation of resume structure
* User confirmation before adding missing items

---

## V8 — AI-Powered Resume Rewrite

### Goal

Connect a real AI model to generate a stronger tailored resume draft.

### Includes

* AI API integration
* Secure API key handling using `.env`
* Prompt design
* Strict honesty rules
* AI-generated professional summary
* AI-generated bullet point rewrites
* Missing items marked as “Add only if true”
* AI output saved to Word

### Product Value

The system becomes much more useful by generating high-quality tailored resume content.

### Risks

* AI hallucination
* Overwriting true resume content
* Adding false skills
* Poor prompt design
* Sensitive data sent to external API

### Required Before Implementation

* AI Policy document
* Data Privacy document
* Test Plan
* Prompt evaluation checklist

### Status

Not started.

---

## V9 — User Interface

### Goal

Move from terminal usage to a real user-facing interface.

### Includes

* Upload resume file
* Paste job URL
* Upload job screenshot
* Analyze button
* Fit report display
* Download report
* Download tailored resume draft

### Possible Tools

* Streamlit for fast MVP
* Flask or FastAPI for a web backend
* React for a more advanced frontend later

### Product Value

The product becomes usable by non-technical users.

### Status

Not started.

### Future Improvements

* Drag-and-drop upload
* Progress indicators
* Error messages users can understand
* Hebrew/English UI support

---

## V10 — Testing and Evaluation

### Goal

Create a reliable testing process.

### Includes

* Test PDF resume reading
* Test DOCX resume reading
* Test URL job extraction
* Test screenshot OCR
* Test Hebrew jobs
* Test English jobs
* Test mixed Hebrew-English jobs
* Test weak OCR cases
* Test no-match cases
* Test high-match cases
* Test AI hallucination behavior

### Product Value

Improves trust and reduces risk of wrong outputs.

### Status

Not started.

### Future Improvements

* Automated unit tests
* Test dataset
* Evaluation metrics
* Human review checklist

---

## V11 — Privacy and Safety Hardening

### Goal

Reduce privacy and misuse risks.

### Includes

* Clear privacy documentation
* Local file handling rules
* No resume files in GitHub
* No output files in GitHub
* No API keys in GitHub
* AI honesty rules
* User review warnings
* Safe export behavior

### Product Value

Protects sensitive user data and improves trust.

### Status

Partially started.

### Future Improvements

* Automatic file cleanup
* Local-only mode
* Consent notice before AI API use
* Redaction options

---

## V12 — Deployment

### Goal

Make the product accessible outside the local development environment.

### Includes

* Web deployment
* Environment variables
* File upload handling
* Temporary storage
* Security configuration
* Usage monitoring

### Product Value

Users can access the product without running code locally.

### Risks

* Data privacy
* Hosting cost
* File storage security
* API cost
* Unauthorized access

### Status

Not started.

---

## 5. MVP Definition

The MVP is considered complete when the system can:

1. Accept a resume file.
2. Accept a job posting URL or screenshot.
3. Extract job requirements.
4. Analyze fit.
5. Generate a candidate-facing report.
6. Generate tailoring recommendations.
7. Export report and tailored draft to Word.
8. Avoid fabricating candidate information.
9. Work with at least basic Hebrew and English inputs.

## 6. Post-MVP Direction

After MVP, the product may expand into:

* AI-powered full resume rewriting
* Cover letter generation
* Interview preparation
* ATS optimization
* Multiple job comparison
* Resume version management
* Web app
* User dashboard
* Cloud deployment
* Paid product model

## 7. Development Priorities

Immediate priorities:

1. Finish documentation.
2. Define AI safety policy.
3. Define data privacy policy.
4. Define test plan.
5. Connect AI model only after safety and testing are documented.
6. Build a simple UI.
7. Improve output quality.

## 8. Project Management View

The roadmap should be managed as an iterative project.

Each version should have:

* Clear scope
* Clear deliverables
* Clear risks
* Testing criteria
* Git commit
* GitHub update
* Changelog entry

## 9. Suggested Work Method

For each new version:

1. Create or update documentation.
2. Create a Git branch if the change is large.
3. Implement the feature.
4. Run manual tests.
5. Fix bugs.
6. Commit changes.
7. Push to GitHub.
8. Update CHANGELOG.
9. Review whether the PRD or ROADMAP needs changes.

## 10. Current Next Steps

The next recommended documents are:

1. `USER_STORIES.md`
2. `TECHNICAL_DESIGN.md`
3. `AI_POLICY.md`
4. `DATA_PRIVACY.md`
5. `TEST_PLAN.md`

After these are created, the project can continue safely toward real AI integration.
