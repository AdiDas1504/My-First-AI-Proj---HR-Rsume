# PROJECT MANAGEMENT PLAN — JobFit AI Resume Tailor

## 1. Purpose

This document defines the project management plan for JobFit AI Resume Tailor.

The goal is to manage the product as a real project, not only as a coding exercise.

This document includes:

* Project objectives
* Scope
* Work Breakdown Structure
* Milestones
* Dependencies
* Schedule assumptions
* Critical path
* Risk register
* Probability and impact assessment
* Risk response planning
* Change management
* Definition of Done

---

## 2. Project Objective

The objective of the project is to build an AI-assisted resume tailoring tool that helps job candidates compare their resume to a specific job posting and generate safe, honest, candidate-facing improvement recommendations and resume drafts.

The project should demonstrate capabilities in:

* AI product thinking
* Python development
* Data extraction
* OCR
* Document generation
* Product documentation
* Privacy and AI safety
* Project management

---

## 3. Project Scope

## 3.1 In Scope

The project includes:

* Local Python application
* Resume reading from PDF and DOCX
* Job posting reading from URL
* Job posting reading from screenshot/image
* OCR support
* Text cleaning
* Basic concept-based match analysis
* Candidate fit report
* Resume tailoring recommendations
* Word and TXT export
* Product documentation
* AI policy
* Data privacy documentation
* Test plan
* Project management plan
* Future AI integration
* Future simple UI

## 3.2 Out of Scope for Current MVP

The current MVP does not include:

* Production deployment
* User accounts
* Payment system
* Employer dashboard
* Candidate ranking against other candidates
* Automatic job application submission
* Database storage
* Full ATS simulation
* Guaranteed hiring prediction
* Full resume design preservation
* Mobile app

---

## 4. Project Assumptions

The project is based on the following assumptions:

1. The first version runs locally.
2. The developer works alone.
3. Resume files are stored locally.
4. Generated output files are stored locally.
5. GitHub is used for code and documentation only.
6. Private user files are not committed to GitHub.
7. AI integration will be added only after safety and privacy documentation.
8. The first UI will likely use Streamlit.
9. Testing will begin manually and may later include automated tests.
10. The project is designed for learning and portfolio development before production use.

---

## 5. Key Deliverables

The main project deliverables are:

1. Functional Python application
2. Resume reader module
3. Job reader module
4. OCR capability
5. Match analysis module
6. Report generator
7. Tailored resume draft generator
8. Word/TXT export
9. PRD
10. Roadmap
11. User stories
12. Technical design document
13. AI policy
14. Data privacy document
15. Test plan
16. Changelog
17. Project management plan
18. Future AI integration
19. Future UI

---

## 6. Work Breakdown Structure

## Level 1 — Product and Project Foundation

### 1.1 Define Product Idea

Description:
Define the core product concept and target problem.

Deliverables:

* Initial product concept
* Product principle: improve real background, do not fabricate experience

Status:
Completed

### 1.2 Set Up Development Environment

Description:
Set up VS Code, Python, virtual environment, Git, and GitHub.

Deliverables:

* Local development environment
* Git repository
* GitHub repository

Status:
Completed

### 1.3 Create Product Documentation

Description:
Create key product and project documents.

Deliverables:

* PRD
* Roadmap
* User stories
* Technical design
* AI policy
* Data privacy
* Test plan
* Changelog
* Project management plan

Status:
In progress

---

## Level 2 — Resume Input

### 2.1 PDF Resume Reader

Description:
Read and extract text from PDF resumes.

Deliverables:

* PDF extraction logic
* Improved extraction using PyMuPDF
* pypdf fallback

Status:
Completed partially

### 2.2 DOCX Resume Reader

Description:
Read and extract text from Word resumes.

Deliverables:

* DOCX extraction logic using python-docx

Status:
Completed partially

### 2.3 Resume Text Cleaning

Description:
Clean resume text for better analysis.

Deliverables:

* Space cleanup
* Blank line cleanup
* Basic character extraction fixes

Status:
Completed partially

---

## Level 3 — Job Posting Input

### 3.1 Job Posting URL Reader

Description:
Read job posting text from a URL.

Deliverables:

* URL reading
* HTML parsing
* Relevant section extraction

Status:
Completed partially

### 3.2 Job Posting Screenshot Reader

Description:
Read job posting text from an image using OCR.

Deliverables:

* Image reading
* OCR using Tesseract
* Hebrew and English OCR attempt

Status:
Completed partially

### 3.3 Job Requirement Extraction

Description:
Extract relevant job sections from full webpage or screenshot text.

Deliverables:

* Requirements extraction
* Qualifications extraction
* Noise filtering

Status:
Completed partially

---

## Level 4 — Match Analysis

### 4.1 Keyword Extraction

Description:
Extract meaningful keywords from job requirements.

Deliverables:

* Stopword filtering
* Frequent keyword extraction

Status:
Completed partially

### 4.2 Concept-Based Matching

Description:
Compare job requirements and resume using concept groups.

Deliverables:

* Concept groups
* Matched concepts
* Missing concepts

Status:
Completed partially

### 4.3 Fit Score Calculation

Description:
Calculate basic fit score.

Deliverables:

* Fit score
* Fit level

Status:
Completed as baseline

---

## Level 5 — Report and Output

### 5.1 Candidate Fit Report

Description:
Generate candidate-facing analysis report.

Deliverables:

* Fit score
* Recommendation
* Matched areas
* Missing areas
* Improvement tips

Status:
Completed

### 5.2 Word and TXT Export

Description:
Save reports and resume drafts as files.

Deliverables:

* TXT report
* Word report
* TXT tailored draft
* Word tailored draft

Status:
Completed

### 5.3 Tailored Resume Draft

Description:
Generate safe, template-based resume tailoring draft.

Deliverables:

* Tailoring plan
* Draft resume output
* Honesty warning

Status:
Completed partially

---

## Level 6 — AI Integration

### 6.1 AI API Preparation

Description:
Prepare environment variables, API key handling, and AI client module.

Deliverables:

* `.env`
* AI client file
* Missing key error handling

Status:
Planned

### 6.2 AI Resume Rewrite

Description:
Use AI to generate a stronger tailored resume draft.

Deliverables:

* AI-generated professional summary
* AI-generated bullet improvements
* Missing items marked as “Add only if true”
* AI Word output

Status:
Planned

### 6.3 AI Safety Validation

Description:
Check AI output for unsupported claims.

Deliverables:

* Manual safety checklist
* Future automated validation

Status:
Planned

---

## Level 7 — User Interface

### 7.1 Simple UI

Description:
Create a simple interface for file upload and job input.

Deliverables:

* Resume upload
* URL input
* Screenshot upload
* Analyze button
* Download buttons

Status:
Planned

### 7.2 UI Error Handling

Description:
Show clear user-facing errors.

Deliverables:

* Unsupported file messages
* OCR warning
* URL extraction failure message

Status:
Planned

---

## Level 8 — Testing and Quality

### 8.1 Manual Test Cases

Description:
Run the test plan manually.

Deliverables:

* Test results
* Bugs found
* Fix list

Status:
Planned

### 8.2 Automated Tests

Description:
Add unit tests for key modules.

Deliverables:

* Test files
* Automated test runner

Status:
Planned

---

## 7. Milestone Plan

| Milestone | Description                          | Status              |
| --------- | ------------------------------------ | ------------------- |
| M1        | Development environment ready        | Completed           |
| M2        | Resume reading works                 | Completed partially |
| M3        | Job reading from URL works           | Completed partially |
| M4        | Job reading from screenshot works    | Completed partially |
| M5        | Basic match analysis works           | Completed           |
| M6        | Reports and Word export work         | Completed           |
| M7        | Product documentation created        | In progress         |
| M8        | Project management plan created      | In progress         |
| M9        | AI integration ready                 | Planned             |
| M10       | AI rewrite works                     | Planned             |
| M11       | Simple UI works                      | Planned             |
| M12       | Testing and quality review completed | Planned             |
| M13       | Portfolio-ready version              | Planned             |

---

## 8. Dependency Map

The project has the following major dependencies:

```text id="fwouvk"
Development setup
    ↓
Resume reader
    ↓
Text cleaning
    ↓
Match analysis
    ↓
Report generation
    ↓
Export

Development setup
    ↓
Job reader from URL
    ↓
Requirement extraction
    ↓
Match analysis

Development setup
    ↓
Job reader from screenshot
    ↓
OCR
    ↓
Requirement extraction
    ↓
Match analysis

AI policy + data privacy + test plan
    ↓
AI integration
    ↓
AI resume rewrite
    ↓
AI validation
    ↓
UI

Technical design + user stories
    ↓
UI design
    ↓
UI implementation
```

---

## 9. Critical Path

The critical path is the sequence of tasks that controls the minimum time needed to reach a portfolio-ready MVP.

If one task on the critical path is delayed, the whole project is delayed.

Current critical path:

```text id="gv92kd"
1. Development setup
2. Resume reader
3. Job reader
4. Text cleaning
5. Match analysis
6. Report generation
7. Word export
8. Product documentation
9. AI policy
10. Data privacy
11. Test plan
12. AI integration
13. AI resume rewrite
14. AI safety review
15. Simple UI
16. Manual testing
17. Portfolio cleanup
```

## 9.1 Tasks Not Currently on the Critical Path

The following tasks are useful but not required for the next MVP:

* Full resume design preservation
* Database storage
* User accounts
* Payment system
* Cloud deployment
* Employer dashboard
* Advanced ATS simulation
* Multiple resume version history

These should not block the MVP.

---

## 10. Schedule Estimate

This is a learning project, so estimates are flexible.

| Phase                       | Estimated Effort | Notes                            |
| --------------------------- | ---------------: | -------------------------------- |
| Documentation completion    |     1–2 sessions | Mostly in progress               |
| AI integration              |     1–2 sessions | Depends on API setup             |
| AI safety testing           |        1 session | Manual tests first               |
| UI with Streamlit           |     2–3 sessions | Simple MVP UI                    |
| Error handling improvements |     1–2 sessions | Important before demo            |
| Manual testing              |     1–2 sessions | Based on test plan               |
| Portfolio cleanup           |        1 session | README, screenshots, explanation |

---

## 11. Risk Register

Risk score is calculated as:

```text id="3yjjy7"
Risk Score = Probability × Impact
```

Scale:

```text id="gjzmb8"
Probability:
1 = Very Low
2 = Low
3 = Medium
4 = High
5 = Very High

Impact:
1 = Very Low
2 = Low
3 = Medium
4 = High
5 = Very High
```

| ID  | Risk                                                    | Probability | Impact | Score | Response Strategy | Mitigation                                                            | Owner             | Status  |
| --- | ------------------------------------------------------- | ----------: | -----: | ----: | ----------------- | --------------------------------------------------------------------- | ----------------- | ------- |
| R1  | PDF extraction is poor for designed resumes             |           4 |      4 |    16 | Mitigate          | Use PyMuPDF, support DOCX, consider OCR fallback                      | Developer         | Open    |
| R2  | Job websites block URL extraction                       |           4 |      3 |    12 | Mitigate          | Support screenshot OCR as fallback                                    | Developer         | Open    |
| R3  | OCR quality is poor for blurry screenshots              |           4 |      3 |    12 | Mitigate          | Add warning for low extracted text; improve image preprocessing later | Developer         | Open    |
| R4  | AI invents skills or experience                         |           4 |      5 |    20 | Avoid/Mitigate    | Strict AI policy, prompt rules, honesty check, manual review          | Developer/Product | Open    |
| R5  | Resume or output files accidentally committed to GitHub |           3 |      5 |    15 | Mitigate          | `.gitignore`, pre-commit check using `git status`                     | Developer         | Open    |
| R6  | API key is exposed                                      |           2 |      5 |    10 | Avoid             | Store in `.env`, never hardcode, ignore `.env`                        | Developer         | Planned |
| R7  | Fit score is misleading                                 |           3 |      4 |    12 | Mitigate          | Explain score is estimate, not hiring prediction                      | Product           | Open    |
| R8  | User relies on AI output without review                 |           3 |      4 |    12 | Mitigate          | Add review warnings and honesty check                                 | Product           | Open    |
| R9  | AI prompt injection from job posting text               |           3 |      4 |    12 | Mitigate          | Treat job text as data, not instructions                              | Developer         | Planned |
| R10 | Hebrew-English matching is inaccurate                   |           4 |      3 |    12 | Mitigate          | Use concept groups now, AI semantic matching later                    | Developer         | Open    |
| R11 | Project scope becomes too large                         |           4 |      4 |    16 | Mitigate          | Follow roadmap and MVP boundaries                                     | Product/Project   | Open    |
| R12 | No automated tests leads to regressions                 |           3 |      3 |     9 | Mitigate          | Add manual test plan now, unit tests later                            | Developer         | Open    |
| R13 | UI adds complexity before backend is stable             |           3 |      3 |     9 | Accept/Mitigate   | Build UI only after AI and test plan basics                           | Project           | Open    |
| R14 | External AI API cost or availability issue              |           2 |      3 |     6 | Accept/Mitigate   | Handle API errors, allow non-AI baseline mode                         | Developer         | Planned |
| R15 | Generated Word formatting is not professional enough    |           3 |      2 |     6 | Accept/Mitigate   | Improve formatting after core flow works                              | Developer         | Open    |

---

## 12. Risk Priority

Highest priority risks:

1. R4 — AI invents skills or experience
2. R1 — Poor PDF extraction
3. R5 — Private files committed to GitHub
4. R11 — Scope becomes too large
5. R2 — Job websites block extraction
6. R3 — OCR quality is poor

These risks should be reviewed before every major version.

---

## 13. Risk Response Types

The project will use four response types:

## Avoid

Change the plan to remove the risk.

Example:
Do not allow AI to automatically add missing skills as facts.

## Mitigate

Reduce probability or impact.

Example:
Use `.gitignore` to reduce risk of committing private files.

## Transfer

Move the risk to another party or tool.

Example:
Use a reliable AI provider or OCR engine instead of building everything manually.

## Accept

Acknowledge the risk and proceed.

Example:
Accept that Word formatting will be basic in the MVP.

---

## 14. Issue Management

An issue is a problem that already happened.

Difference:

```text id="xm0r12"
Risk = may happen in the future
Issue = already happened
```

Examples:

Risk:
OCR may fail on blurry screenshots.

Issue:
OCR failed on the current screenshot.

Issues should be tracked with:

* Description
* Date found
* Severity
* Affected file or module
* Fix plan
* Status

Future versions may use GitHub Issues for this.

---

## 15. Change Management

Changes should be managed carefully.

A change request should be created when:

* A new feature is added
* A feature changes scope
* AI behavior changes
* Privacy behavior changes
* Output format changes
* User flow changes
* A new dependency is added

Each change should answer:

1. What is changing?
2. Why is it needed?
3. What files are affected?
4. What risks does it add?
5. Does the PRD need updating?
6. Does the roadmap need updating?
7. Does the test plan need updating?

---

## 16. Definition of Done

A feature is considered done when:

1. The code works locally.
2. The feature was manually tested.
3. Errors are handled clearly.
4. Private data is not committed.
5. Documentation is updated.
6. Changelog is updated.
7. Git commit is created.
8. GitHub is updated.
9. The feature matches the PRD and roadmap.
10. The feature does not violate AI policy or privacy rules.

---

## 17. Project Communication Plan

Since this is currently a solo learning project, communication is mostly through documentation.

Current communication artifacts:

* README
* PRD
* Roadmap
* User stories
* Technical design
* AI policy
* Data privacy
* Test plan
* Changelog
* Project management plan

Future communication may include:

* GitHub Issues
* GitHub Projects board
* Pull requests
* Release notes
* Demo video
* Portfolio summary

---

## 18. Project Monitoring

Project progress should be monitored using:

* Roadmap status
* Changelog versions
* Git commits
* Test plan status
* Open risks
* Completed milestones
* Remaining MVP features

Recommended review after each session:

1. What did we complete?
2. What changed?
3. Did we add risk?
4. Did we update documentation?
5. Did we commit safely?
6. What is the next critical task?

---

## 19. Current Project Status

Current status:

* Core backend pipeline is functional.
* Documentation is being formalized.
* Risk management is now defined.
* AI integration is planned but not started.
* UI is planned but not started.
* Manual testing exists but is not fully structured.
* Automated testing is not started.

---

## 20. Next Project Management Steps

Recommended next steps:

1. Finish this project management plan.
2. Add `RISK_REGISTER.md` if a separate detailed risk file is needed.
3. Add `SCHEDULE.md` if a more detailed timeline is needed.
4. Add GitHub Issues for remaining tasks.
5. Use the roadmap to decide whether AI integration or UI comes next.
6. Review the critical path before adding new features.
