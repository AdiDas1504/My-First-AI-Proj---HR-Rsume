# CHANGELOG — JobFit AI Resume Tailor

All notable changes to this project will be documented in this file.

This changelog tracks product, technical, documentation, privacy, AI safety, and testing changes.

The format is organized by versions.

---

## Version Legend

### Added

New features, files, or capabilities.

### Changed

Updates or improvements to existing behavior.

### Fixed

Bug fixes or corrections.

### Documented

Product, technical, privacy, AI, or testing documentation.

### Planned

Future work not implemented yet.

---

## [Unreleased]
### Added

- Added optional Claude client loading so the non-AI flow can still work if the Anthropic SDK is missing.
- Added first AI output safety validator.
- Added automatic safety review section to Claude-generated Word output.
### Planned

* Add AI-powered resume rewrite.
* Add AI semantic match analysis.
* Add `.env` support for API keys.
* Add user consent notice before AI processing.
* Add stronger error handling.
* Add Streamlit user interface.
* Add automated tests.
* Add resume path input instead of hardcoded resume path.
* Add better OCR quality warnings.
* Add better Word formatting for tailored resume output.

---

## [V0.7] — Documentation Foundation

### Documented

Created the core product and project documentation:

* `docs/PRD.md`
* `docs/ROADMAP.md`
* `docs/USER_STORIES.md`
* `docs/TECHNICAL_DESIGN.md`
* `docs/AI_POLICY.md`
* `docs/DATA_PRIVACY.md`
* `docs/TEST_PLAN.md`
* `docs/CHANGELOG.md`

### Purpose

This documentation phase was added to make sure the project is developed like a real AI product, not only as a coding exercise.

The documentation now covers:

* Product requirements
* Product roadmap
* User stories
* Technical architecture
* AI safety rules
* Data privacy rules
* Testing strategy
* Change tracking

### Status

Completed.

---

## [V0.6] — Tailored Resume Draft Export

### Added

* Template-based tailored resume draft generation.
* Tailoring plan based on match analysis.
* Tailored resume export as TXT.
* Tailored resume export as Word document.

### Added Files / Updated Files

* `src/resume_tailor.py`
* `src/output_writer.py`
* `app.py`

### Product Value

The user can now receive a first draft or structured direction for tailoring the resume to the job posting.

### Limitations

* The tailored resume draft is not yet fully AI-generated.
* The draft is template-based.
* The user must manually review and edit the output.
* Missing items must be added only if true.

### Status

Completed as a basic version.

---

## [V0.5] — Report Generation and Word Export

### Added

* Candidate fit report.
* Fit score display.
* Fit level.
* Recommendation.
* Matched concepts.
* Missing or weak concepts.
* Resume improvement tips.
* TXT report export.
* Word report export.

### Added Files / Updated Files

* `src/report_generator.py`
* `src/output_writer.py`
* `app.py`

### Product Value

The system now produces candidate-facing output instead of only terminal/debug information.

### Status

Completed.

---

## [V0.4] — Concept-Based Match Analysis

### Added

* Basic match analysis between resume text and job requirements.
* Keyword extraction.
* Stopword filtering.
* Concept group matching.
* Hebrew-English concept support.

### Concept Groups Added

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

### Added Files / Updated Files

* `src/analyzer.py`

### Product Value

The user can receive a basic fit score and understand which areas match or are missing.

### Limitations

* This is not full semantic AI analysis.
* Matching is still based on keywords and concept groups.
* Future versions should use AI for deeper analysis.

### Status

Completed as a baseline version.

---

## [V0.3] — Job Posting Extraction

### Added

* Job posting reading from URL.
* Job posting reading from image or screenshot.
* OCR support using Tesseract.
* Support for PNG, JPG, JPEG, and WEBP image files.
* Relevant job section extraction.
* Noise filtering for job webpages and screenshots.

### Added Files / Updated Files

* `src/job_reader.py`
* `requirements.txt`

### Product Value

The user can provide a job posting either as a link or as a screenshot.

This makes the product usable for job platforms that block URL reading or require login.

### Limitations

* OCR quality depends on screenshot quality.
* Some websites may block automated reading.
* Some job pages load content dynamically and may not be readable through simple URL extraction.

### Status

Completed partially.

---

## [V0.2] — Resume Reading and Text Cleaning

### Added

* Resume reading from PDF.
* Resume reading from DOCX.
* Improved PDF extraction using PyMuPDF.
* Fallback PDF extraction using pypdf.
* Text cleaning.
* Extra space removal.
* Blank line cleanup.
* Basic character-by-character extraction cleanup.

### Added Files / Updated Files

* `src/resume_reader.py`
* `src/text_cleaner.py`
* `requirements.txt`

### Product Value

The system can read real resume files and prepare their text for analysis.

### Limitations

* Designed PDFs may still extract text in a poor order.
* Multi-column resumes may not preserve structure perfectly.
* Scanned resumes may require OCR in a future version.

### Status

Completed partially.

---

## [V0.1] — Project Setup

### Added

* Python project structure.
* Virtual environment.
* Git repository.
* GitHub connection.
* `.gitignore`.
* `requirements.txt`.
* Local data folders.
* Local output folder.
* Basic `app.py`.

### Project Structure Added

```text
app.py
requirements.txt
.gitignore

data/
  resumes/
  job_posts/

output/

src/
```

### Product Value

No direct user-facing value yet.

This version created the technical foundation for the product.

### Status

Completed.

---

## [V0.0] — Product Idea

### Added

Initial product concept:

JobFit AI Resume Tailor helps candidates compare their resume to a specific job posting and generate safe, honest resume tailoring recommendations.

### Core Product Principle

The product may help the candidate present their real background better.

The product must not invent false experience, skills, education, tools, companies, numbers, or achievements.

### Status

Defined.

---

## Current MVP Status

The current MVP can:

* Read a resume file.
* Read a job posting from URL.
* Read a job posting from screenshot.
* Extract and clean text.
* Analyze basic fit.
* Generate a fit report.
* Generate tailoring recommendations.
* Export reports to TXT and Word.
* Export a basic tailored resume draft to TXT and Word.
* Protect private files using `.gitignore`.

The current MVP cannot yet:

* Use a real AI model.
* Generate a fully AI-written resume rewrite.
* Run through a user interface.
* Run automated tests.
* Deploy to the cloud.
* Preserve the original resume design.
* Guarantee perfect extraction or match accuracy.

---

## Next Recommended Version

## [V0.8] — AI Integration Preparation

### Planned

* Add `.env` support.
* Add AI API key handling.
* Add AI client module.
* Add user notice before AI processing.
* Add prompt template based on `AI_POLICY.md`.
* Add AI output saved to Word.
* Add AI safety checks.

### Required Documents Before Implementation

* `AI_POLICY.md`
* `DATA_PRIVACY.md`
* `TEST_PLAN.md`

### Status

Ready to start after documentation review.

---

## Changelog Maintenance Rules

Before each commit, check whether the changelog should be updated.

The changelog should be updated when:

* A new feature is added.
* A bug is fixed.
* A major file is created.
* A document is added.
* AI behavior changes.
* Privacy behavior changes.
* Output format changes.
* User flow changes.
* A version milestone is completed.

Each entry should explain:

1. What changed.
2. Why it matters.
3. What files were affected when relevant.
4. What limitations remain.
