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

## [V1.0-web] — Paid Website (web/)

### Added

- New `web/` Next.js app: Hebrew RTL landing page, pricing, FAQ, legal pages and accessibility statement, with visuals generated in Higgsfield.
- Phone login with SMS one-time codes, rate-limited.
- Free fit check (score + top 3 gaps), limited to one per phone and one per device, and 3 per network per day.
- Plans: 19.90 ₪ 7-day trial (once per phone), 49.90 ₪ monthly, 119 ₪ quarterly; fair-use quotas; one-click cancel.
- Claude tailoring with forced structured output; match score computed from the requirement list.
- Deterministic honesty check: numbers, employers, titles, institutions, skills and certifications must trace to the original resume; it re-runs after every edit.
- Resume editor, cover letter, ATS-friendly Word export with proper RTL, and PDF via print.
- Accessibility toolbar, keyboard support, screen-reader status messages.
- Demo mode for local runs; production guard that blocks demo login codes and demo payments.
- Unit tests for pricing, quotas, phone parsing and the honesty check.
- Skills the resume and answers do not support are removed from the skills list automatically and offered as "add only if true" (tailoring) or mentioned in the notes (builder).
- Stability: the free check runs three independent Haiku assessments in parallel and keeps the middle one; the full analysis is requested again when it comes back incomplete (too little research, no questions, placeholder text); clearer rule for "years required" (met / two thirds = partial / less = missing); Hebrew prefix matching fixed in the honesty and evidence checks ("והשמה" matches "השמה").
- Tuning from the first real-Claude evaluation: the seniority factor is milder (missing years are usually also a core requirement, so it no longer double-punishes); the writer may not compute totals the resume does not state (e.g. "7+ years"); the honesty check accepts other Hebrew forms of the same word (רווחה / רווחת), cutting false flags on professional rewording.
- Fix: removed `temperature` from AI requests. Claude 5.5 models reject it ("Extra inputs are not permitted"), which broke the free fit check after the score v2 release. The mock API now rejects it too.
- **Match score v2 (reliability).** The AI no longer drifts to a middle score: it assesses each requirement with a kind (core / skill / credential / soft) and an exact quote from the resume; quotes not found in the resume are discarded and the status lowered. The score is computed in code: core requirements weigh most, "partial" is worth 40%, soft skills little, a missing core must-have caps the score (55, or 35 for two), a missing required credential caps at 60, and role alignment (same / adjacent / transferable / unrelated) and seniority gap adjust it. The same rubric is used by the free check and the full analysis.
- **Research and questions before writing.** Tailoring is now two steps: (1) `/api/tailor` analyzes the fit and researches what employers look for in this role and similar roles beyond the ad (e.g. for HR manager: business partnering, HR metrics/ROI, people management), shows it on a new review page `/app/new/[id]`, and asks the candidate 3-7 targeted questions; (2) `/api/tailor/[id]/generate` writes the resume using the analysis and the candidate's answers. Answers are short, casual notes: the engine owns the wording, turns the facts into polished, job-tailored resume language and never pastes them (checked by the eval); it never inflates scope or adds numbers. Answers are part of the honesty-check source. A credit is used only in step 2, once per analysis. New table `tailor_sessions` (migration `web/supabase/migrations/2026-11-24_tailor_sessions.sql`).
- **Quality evaluation.** `web/eval` holds fictional resumes and jobs with expected score bands and an HR case; `npm run eval` measures separation, stability, band accuracy, role research, use of answers and invented facts against the real API. GitHub workflow "Quality evaluation" runs it (secret `ANTHROPIC_API_KEY`) on a push to `run-eval` or by hand, and saves the report to the `eval-results` branch.
- **Privacy.** Data past its retention is deleted automatically once a day (documents and built resumes 180 days after the last update, tailoring sessions after 7 days, expired login codes, old rate-limit counters). Phone numbers and IPs in the free-scan list and in rate-limit keys are stored as keyed hashes (`PHONE_HASH_SECRET`, falling back to `SESSION_SECRET`); older rows are converted on first use. Privacy policy and accessibility statement updated; PDFs are generated tagged.
- Free fit check limits temporarily turned off at the owner's request (`config.freeScanLimits = false`): anyone can run the free check again, with a safety cap of 10 per user per day. Set it back to `true` to restore one per phone/device and 3 per network a day.
- "Download PDF" now downloads a ready A4 file made on the server (headless Chromium via `@sparticuz/chromium` + `puppeteer-core`), instead of opening the browser print dialog. New routes `/api/builder/[id]/pdf` and `/api/documents/[id]/pdf` (owner only, rate-limited). Resumes up to ~25% too long are shrunk evenly to fit one page (min 80%); longer ones run onto full extra pages with the sidebar color to the bottom. The print page stays available as a fallback, with a note to choose A4 paper.
- Resume layout redesigned to the current Israeli market standard: two columns with a colored sidebar (name, contact, education, skills, tools, certifications, languages) and a main column ("על עצמי", experience, a separate military service section). No job title under the name. Three color themes (classic blue, modern green, light minimal). AI writing rules tightened for short, scannable, one-page resumes (bullet limits per role, 2-3 sentence profile). Word export keeps a single ATS-friendly column with the same sections.
- Fixed AI-400 on resume generation and tailoring: Claude Sonnet 5.5 rejects forced tool use, so calls to it now use tool_choice "auto" with strict tools (additionalProperties: false everywhere), an explicit "answer via the tool" instruction, one retry if it answers in text, and up-front thinking off ("between_tools"). Haiku 5.5 keeps forced tool use. Verified end to end against a mock API that enforces the documented rules.
- Claude API failures now show a short code on screen (AI-401, AI-404, AI-429, AI-CREDIT, AI-SPEND, AI-TIMEOUT…) and log full details; truncated answers are detected; output token budgets lowered to realistic sizes (tailor 8k, builder 7k) so new low-tier API accounts aren't rate-limited up front.
- Resume builder (one-time product, 49 ₪): improve an existing resume or build from scratch through a 6-step interview with AI follow-up questions per role; free interview, payment unlocks generation; 3 single-column ATS-friendly templates (classic, modern, minimal); editing, Word and PDF export; honesty check against the person's own answers; one-click bridge to job tailoring. New `builder_drafts` table.
- Free-scan results redesigned to convert, honestly: second-person coaching tone, strengths first, potential score after rewording (only gaps that are a wording problem count, never missing experience), one real resume line shown before/after (rejected automatically if it adds numbers or isn't copied from the resume), gaps tagged "fixable by wording" vs "missing", stronger call to action.
- Optional `PREVIEW_PASSWORD` site-wide password for private preview deployments.
- AI review warning on every tailored draft in the web editor (per the project AI safety rules). It is shown on screen, not inside the exported file the candidate sends.

### Planned

- Real Israeli payment processor (needs a registered business).
- Israeli SMS gateway.
- Renewal reminders by SMS or email.

---

## [Unreleased]
### Added

- Added optional Claude client loading so the non-AI flow can still work if the Anthropic SDK is missing.
- Added first AI output safety validator.
- Added automatic safety review section to Claude-generated Word output.
- Added AI safety test cases document.
- Added Claude safety test runner with synthetic resume and job inputs.
- Added tests for missing skills, fake metrics, prompt injection, missing certifications, and overstated leadership.
- Added initial Streamlit user interface for resume upload, job input, analysis results, and Word report downloads.
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
