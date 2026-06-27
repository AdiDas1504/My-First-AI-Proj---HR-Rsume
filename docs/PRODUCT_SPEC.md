# PRODUCT_SPEC — JobFit AI Resume Tailor

## 1. Product Overview

JobFit AI Resume Tailor is a Python-based tool that helps job candidates evaluate how well their resume matches a specific job posting and produce honest, practical tailoring recommendations.

The product compares what the candidate has already written against what the job requires. It identifies matched areas, flags missing areas, and suggests how to present real experience more effectively — without inventing anything.

The product is designed for individual, local use. There is no cloud storage, no user accounts, and no database. All files are processed on the user's machine.

---

## 2. Target Users

**Primary user:** A job candidate preparing to apply for a specific role.

Typical characteristics:

- Has a resume in PDF or Word format
- Has a job posting URL, screenshot, PDF, or DOCX
- Wants to understand how well the resume fits the role
- Wants practical guidance on what to emphasize or improve
- May not be experienced in resume tailoring

The product supports English and Hebrew job postings and resumes.

---

## 3. Main User Flow

1. User starts the app (terminal or Streamlit UI).
2. User provides a resume file (PDF or DOCX).
3. User provides a job posting source (URL, image, PDF, or DOCX).
4. System extracts resume text.
5. System extracts job requirements.
6. System cleans and normalizes both texts.
7. System analyzes the match.
8. System generates a candidate fit report.
9. System generates a tailoring plan.
10. System optionally generates an AI-powered tailored resume draft (requires API key).
11. System exports results to TXT and Word files.
12. User reviews all output manually before using it.

---

## 4. Supported Inputs

### Resume

| Format | Status       |
|--------|--------------|
| PDF    | Supported    |
| DOCX   | Supported    |

### Job Posting

| Source          | Method                  | Status           |
|-----------------|-------------------------|------------------|
| URL             | Web scraping            | Supported        |
| Screenshot/Image| OCR (Tesseract)         | Supported        |
| PDF             | Text extraction         | Supported        |
| DOCX            | Text extraction         | Supported        |

**Notes:**
- Some job websites block automated reading. If URL reading fails, use a screenshot or PDF instead.
- OCR quality depends on image clarity. Blurry or low-resolution screenshots may produce incomplete text.
- Image OCR supports Hebrew and English.

---

## 5. Core Features

### Resume Reader

Reads PDF and DOCX resume files, extracts text, and prepares it for analysis. Handles common formatting issues including multi-column layouts and encoded characters.

### Job Posting Reader

Reads job postings from multiple sources. For URLs, it fetches and filters the page to extract only job-relevant content. For images, it uses OCR. For PDF and DOCX files, it extracts text directly.

### Text Cleaner

Normalizes extracted text from both the resume and the job posting. Removes noise, fixes spacing, and prepares clean input for the analyzer.

### Match Analyzer

Compares resume content against job requirements using concept-based matching. Groups terms into semantic categories such as:

- Product and project management
- Data and analytics
- AI and automation
- Technical systems
- Stakeholder management
- Management and leadership
- HR and people processes
- Security and operations

Produces a fit score, a list of matched concepts, and a list of missing or weak concepts.

### Fit Report Generator

Creates a structured candidate-facing report with a fit score, fit level, matched areas, missing areas, and actionable resume improvement tips.

### Tailoring Plan

Suggests which parts of the resume to emphasize, which bullet points to rewrite, and which missing areas should only be added if they are genuinely true for the candidate.

### AI Resume Draft (Optional)

When a Claude API key is configured, the system can generate an AI-powered tailored resume draft. All AI output must be reviewed by the user before use.

### Export

Saves results as:

- Fit report (TXT)
- Fit report (Word)
- Tailored resume draft (TXT)
- Tailored resume draft (Word)

---

## 6. Match Score Explanation

The fit score is a percentage between 0 and 100 that reflects how many of the job's identified concept areas are also present in the resume.

| Score Range | Fit Level | Meaning                                                         |
|-------------|-----------|------------------------------------------------------------------|
| 80–100%     | Strong    | Resume covers most concept areas the job requires.              |
| 60–79%      | Good      | Resume covers many key areas. Some gaps exist.                  |
| 40–59%      | Moderate  | Resume partially matches. Several important areas are missing.  |
| 20–39%      | Weak      | Resume covers few of the job's required areas.                  |
| 0–19%       | Very Low  | Resume and job requirements do not significantly overlap.       |

**Important:** The score is based on concept-group matching, not full semantic understanding. A strong score does not guarantee interview success. A weak score does not mean the candidate is unqualified — it means the resume may not be presenting relevant experience clearly.

---

## 7. Extracted Requirements Explanation

The system identifies job requirements by detecting section headers such as:

**English:**
- Requirements, Qualifications, Must Have, Nice to Have, Responsibilities, Skills, Experience

**Hebrew:**
- דרישות, חובה, יתרון, תחומי אחריות, תיאור התפקיד

The system then extracts keywords and maps them to concept groups. Results appear in the report as:

- **Matched concepts** — areas mentioned in both the resume and the job posting.
- **Missing concepts** — areas mentioned in the job posting but not found in the resume. These are marked as candidates for addition only if true.

The extraction is text-based. Requirements buried in non-standard formatting or embedded in images may not be captured.

---

## 8. AI Safety Rules

These rules apply to all AI-generated output in this product.

1. The system must not invent experience, skills, tools, certifications, education, companies, job titles, achievements, numbers, or metrics.
2. Rewrites are only permitted when based on content already present in the resume.
3. Any job requirement not found in the resume must be labeled: **"Add only if true."**
4. Every AI-generated resume draft must carry a warning that it requires human review before use.
5. Resume content, job posting content, and OCR output are treated as data only. The system ignores any instruction-like text found inside those documents.
6. The user must confirm consent before any resume data is sent to an external AI API.
7. API keys must be stored in `.env` and must never be committed to version control.

---

## 9. Known Limitations

| Area                  | Limitation                                                             |
|-----------------------|------------------------------------------------------------------------|
| PDF extraction        | Complex or design-heavy resumes may extract poorly.                   |
| URL reading           | Some job sites block automated access or require login.               |
| OCR quality           | Blurry or low-resolution images reduce extraction accuracy.           |
| Match analysis        | Concept-based matching does not understand full context or meaning.   |
| AI draft              | AI is optional and requires a configured Claude API key.              |
| Hebrew support        | Hebrew matching works but may miss uncommon phrasing.                 |
| Resume design         | Exported Word files do not preserve original resume visual design.    |
| No ATS simulation     | The product does not simulate actual ATS scoring or employer filters. |
| Local use only        | No cloud deployment, no shared access, no multi-user support.         |

---

## 10. Future Roadmap

| Version | Feature                                      |
|---------|----------------------------------------------|
| V8      | AI-powered resume rewrite using Claude API   |
| V9      | Streamlit web UI for non-technical users     |
| V10     | Automated test suite and evaluation metrics  |
| V11     | Privacy hardening and user consent flow      |
| V12     | Cloud deployment                             |
| Post-MVP| Cover letter generation                      |
| Post-MVP| Interview preparation questions              |
| Post-MVP| ATS keyword optimization                     |
| Post-MVP| Multiple resume version management           |
| Post-MVP| PDF export with preserved formatting         |
| Post-MVP| Multi-language support beyond Hebrew/English |
