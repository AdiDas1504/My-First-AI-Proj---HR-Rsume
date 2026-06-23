# BACKLOG AND SPRINT PLAN — JobFit AI Resume Tailor

## 1. Purpose

This document translates the product requirements, roadmap, user stories, risk register, and schedule into actionable work items.

The goal is to define:

* Product backlog
* Priorities
* Sprint plan
* Tasks
* Acceptance criteria
* Definition of Done
* Relationship between tasks and user stories
* What should be built next

This document helps manage the project like an Agile product development project.

---

## 2. Backlog vs Sprint

## 2.1 Product Backlog

The product backlog is the full list of features, improvements, fixes, and technical tasks that may be done in the project.

The backlog includes both MVP and future items.

## 2.2 Sprint

A sprint is a focused work period with a small set of selected tasks.

For this project, a sprint can be defined as:

```text
1–3 focused work sessions
```

The goal is to complete a small, valuable increment before moving to the next sprint.

---

## 3. Priority Method

The backlog uses the MoSCoW method.

| Priority       | Meaning                                |
| -------------- | -------------------------------------- |
| Must Have      | Required for MVP or safety             |
| Should Have    | Important but not immediately blocking |
| Could Have     | Nice improvement                       |
| Won't Have Now | Out of current scope                   |

---

## 4. Current Product Status

Current completed or partially completed capabilities:

* Local Python project setup
* Git and GitHub workflow
* Resume PDF reading
* Resume DOCX reading support
* Job posting URL reading
* Job screenshot OCR
* Hebrew and English text handling
* Text cleaning
* Concept-based match analysis
* Candidate fit report
* Word and TXT export
* Template-based tailored resume draft
* Product documentation
* Project management documentation
* Risk register
* Schedule and critical path

Current next product direction:

```text
Prepare the project for safe AI integration.
```

---

# 5. Product Backlog

## 5.1 Must Have — Before AI Integration

| ID  | Task                               | Description                                                             | Related Docs                | Status  |
| --- | ---------------------------------- | ----------------------------------------------------------------------- | --------------------------- | ------- |
| B1  | Review `.gitignore`                | Confirm private files, output files, and `.env` are ignored             | DATA_PRIVACY, RISK_REGISTER | Planned |
| B2  | Add `.env` support                 | Prepare environment variable loading for API keys                       | DATA_PRIVACY, AI_POLICY     | Planned |
| B3  | Add missing API key error handling | Show clear error when API key is missing                                | TEST_PLAN, AI_POLICY        | Planned |
| B4  | Add AI consent notice              | Notify user before sending resume/job text to external AI API           | DATA_PRIVACY, AI_POLICY     | Planned |
| B5  | Build AI client module             | Create a separate module for AI calls                                   | TECHNICAL_DESIGN            | Planned |
| B6  | Build AI prompt template           | Use strict honesty rules and prompt-injection protection                | AI_POLICY                   | Planned |
| B7  | Generate AI tailored resume draft  | Create AI-assisted tailored resume output                               | PRD, ROADMAP                | Planned |
| B8  | Save AI output to Word             | Export AI-generated draft as DOCX                                       | USER_STORIES, TEST_PLAN     | Planned |
| B9  | Run AI safety tests                | Test missing skills, fake numbers, prompt injection, and review warning | TEST_PLAN, RISK_REGISTER    | Planned |
| B10 | Keep non-AI flow working           | Ensure the current baseline still works without AI                      | TECHNICAL_DESIGN            | Planned |

---

## 5.2 Must Have — Usability Improvements

| ID  | Task                          | Description                                                      | Related Docs                   | Status  |
| --- | ----------------------------- | ---------------------------------------------------------------- | ------------------------------ | ------- |
| B11 | Make resume path configurable | User should provide resume path instead of hardcoded sample file | USER_STORIES, TECHNICAL_DESIGN | Planned |
| B12 | Improve file error messages   | Show clearer errors for missing/unsupported files                | TEST_PLAN                      | Planned |
| B13 | Warn on weak extraction       | Warn when resume/job text extraction is too short                | TEST_PLAN, RISK_REGISTER       | Planned |
| B14 | Improve terminal instructions | Make terminal prompts clearer for non-technical users            | USER_STORIES                   | Planned |

---

## 5.3 Should Have — Quality and Testing

| ID  | Task                         | Description                                        | Related Docs | Status  |
| --- | ---------------------------- | -------------------------------------------------- | ------------ | ------- |
| B15 | Create manual test checklist | Convert TEST_PLAN into practical checklist         | TEST_PLAN    | Planned |
| B16 | Test DOCX resume             | Confirm DOCX reading works with real files         | TEST_PLAN    | Planned |
| B17 | Test Hebrew job screenshot   | Confirm OCR and extraction work on Hebrew jobs     | TEST_PLAN    | Planned |
| B18 | Test English job screenshot  | Confirm OCR and extraction work on English jobs    | TEST_PLAN    | Planned |
| B19 | Test URL fallback            | Confirm failed URL suggests screenshot             | TEST_PLAN    | Planned |
| B20 | Add basic unit tests         | Add tests for cleaner, analyzer, and output writer | TEST_PLAN    | Future  |

---

## 5.4 Should Have — UI

| ID  | Task                     | Description                                     | Related Docs              | Status  |
| --- | ------------------------ | ----------------------------------------------- | ------------------------- | ------- |
| B21 | Add Streamlit dependency | Prepare simple UI framework                     | ROADMAP, TECHNICAL_DESIGN | Planned |
| B22 | Build resume upload UI   | Allow user to upload PDF/DOCX                   | USER_STORIES              | Planned |
| B23 | Build job input UI       | Allow URL input or screenshot upload            | USER_STORIES              | Planned |
| B24 | Show fit report in UI    | Display score, matched areas, and missing areas | PRD                       | Planned |
| B25 | Add download buttons     | Download reports and tailored resume draft      | USER_STORIES              | Planned |
| B26 | Add UI privacy notice    | Show user notice before AI processing           | DATA_PRIVACY              | Planned |

---

## 5.5 Could Have — Future Enhancements

| ID  | Task                        | Description                               | Status |
| --- | --------------------------- | ----------------------------------------- | ------ |
| B27 | Improve Word design         | Better formatting and professional layout | Future |
| B28 | Add PDF export              | Export final resume as PDF                | Future |
| B29 | Add cover letter generation | Generate tailored cover letter            | Future |
| B30 | Add interview prep          | Generate likely interview questions       | Future |
| B31 | Add ATS keyword analysis    | More advanced keyword optimization        | Future |
| B32 | Add resume version history  | Save multiple tailored versions           | Future |
| B33 | Add cloud deployment        | Deploy as a web app                       | Future |
| B34 | Add user accounts           | Save user data securely                   | Future |
| B35 | Add database                | Store sessions or resume versions         | Future |

---

## 5.6 Won't Have Now

The following items are out of scope for the current MVP:

* Payment system
* Employer dashboard
* Candidate ranking against other candidates
* Automatic job application submission
* Full ATS simulator
* Mobile app
* Production cloud deployment
* Multi-user system
* Advanced resume design preservation

---

# 6. Sprint 1 — AI Integration Preparation

## Sprint Goal

Prepare the project for safe AI integration without breaking the existing non-AI pipeline.

## Sprint Scope

Sprint 1 includes:

* Review privacy protections
* Add `.env` support
* Add AI client foundation
* Add AI consent notice
* Add strict AI prompt template
* Add missing API key handling

## Sprint Tasks

| Task ID | Task                                | Priority  |     Estimate | Status  |
| ------- | ----------------------------------- | --------- | -----------: | ------- |
| S1.1    | Review `.gitignore`                 | Must Have | 0.25 session | Planned |
| S1.2    | Add `python-dotenv` to requirements | Must Have | 0.25 session | Planned |
| S1.3    | Create `.env` example instructions  | Must Have | 0.25 session | Planned |
| S1.4    | Create AI client module             | Must Have |  0.5 session | Planned |
| S1.5    | Add missing API key error handling  | Must Have | 0.25 session | Planned |
| S1.6    | Add user AI consent prompt          | Must Have | 0.25 session | Planned |
| S1.7    | Add strict AI prompt template       | Must Have |  0.5 session | Planned |
| S1.8    | Run non-AI regression test          | Must Have | 0.25 session | Planned |

## Sprint 1 Acceptance Criteria

Sprint 1 is complete when:

1. `.env` is ignored by Git.
2. API key is not hardcoded.
3. The system gives a clear error if API key is missing.
4. User is warned before AI processing.
5. AI prompt includes honesty and privacy rules.
6. Current non-AI flow still works.
7. Changes are committed to Git.
8. Changelog is updated.

---

# 7. Sprint 2 — AI Resume Rewrite

## Sprint Goal

Add AI-powered tailored resume generation while enforcing honesty rules.

## Sprint Scope

Sprint 2 includes:

* Connect AI call
* Send structured prompt
* Generate AI tailored resume
* Save AI output to Word
* Add honesty warning to output
* Run AI safety tests

## Sprint Tasks

| Task ID | Task                             | Priority  |     Estimate | Status  |
| ------- | -------------------------------- | --------- | -----------: | ------- |
| S2.1    | Connect AI model call            | Must Have |  0.5 session | Planned |
| S2.2    | Generate AI tailored resume text | Must Have |  0.5 session | Planned |
| S2.3    | Save AI output to Word           | Must Have | 0.25 session | Planned |
| S2.4    | Add output honesty warning       | Must Have | 0.25 session | Planned |
| S2.5    | Test missing skill behavior      | Must Have | 0.25 session | Planned |
| S2.6    | Test fake number behavior        | Must Have | 0.25 session | Planned |
| S2.7    | Test prompt injection behavior   | Must Have | 0.25 session | Planned |
| S2.8    | Update changelog                 | Must Have | 0.25 session | Planned |

## Sprint 2 Acceptance Criteria

Sprint 2 is complete when:

1. AI generates a tailored resume draft.
2. AI output is saved to Word.
3. AI does not invent missing skills in test cases.
4. AI does not invent numbers in test cases.
5. AI ignores prompt injection inside job text.
6. Output clearly says it must be reviewed.
7. Non-AI flow still works.
8. Git commit and push are completed.

---

# 8. Sprint 3 — Simple User Interface

## Sprint Goal

Create a basic interface so the product can be used without the terminal.

## Sprint Scope

Sprint 3 includes:

* Streamlit setup
* Resume upload
* Job URL input
* Job screenshot upload
* Analyze button
* Report display
* Download buttons

## Sprint Tasks

| Task ID | Task                           | Priority    |     Estimate | Status  |
| ------- | ------------------------------ | ----------- | -----------: | ------- |
| S3.1    | Add Streamlit dependency       | Should Have | 0.25 session | Planned |
| S3.2    | Create `streamlit_app.py`      | Should Have |  0.5 session | Planned |
| S3.3    | Add resume upload              | Should Have |  0.5 session | Planned |
| S3.4    | Add job URL input              | Should Have | 0.25 session | Planned |
| S3.5    | Add job screenshot upload      | Should Have |  0.5 session | Planned |
| S3.6    | Connect pipeline to UI         | Should Have |    1 session | Planned |
| S3.7    | Add download buttons           | Should Have |  0.5 session | Planned |
| S3.8    | Add user-facing error messages | Should Have |  0.5 session | Planned |

## Sprint 3 Acceptance Criteria

Sprint 3 is complete when:

1. User can upload a resume.
2. User can provide job URL or screenshot.
3. User can run analysis from UI.
4. User can see fit report.
5. User can download Word outputs.
6. Errors are understandable.
7. Sensitive files are not committed.
8. Changelog is updated.

---

# 9. Sprint 4 — Portfolio Readiness

## Sprint Goal

Prepare the project to be shown as a serious AI product portfolio project.

## Sprint Scope

Sprint 4 includes:

* README improvement
* Screenshots
* Demo instructions
* Architecture explanation
* Limitations
* Privacy explanation
* Risk explanation
* Final manual testing

## Sprint Tasks

| Task ID | Task                      | Priority    |     Estimate | Status  |
| ------- | ------------------------- | ----------- | -----------: | ------- |
| S4.1    | Improve README            | Should Have |  0.5 session | Planned |
| S4.2    | Add project screenshots   | Should Have |  0.5 session | Planned |
| S4.3    | Add demo flow             | Should Have |  0.5 session | Planned |
| S4.4    | Add architecture summary  | Should Have |  0.5 session | Planned |
| S4.5    | Add limitations section   | Should Have | 0.25 session | Planned |
| S4.6    | Run full manual test plan | Must Have   |    1 session | Planned |
| S4.7    | Final GitHub cleanup      | Must Have   |  0.5 session | Planned |

## Sprint 4 Acceptance Criteria

Sprint 4 is complete when:

1. README explains the project clearly.
2. Product documentation exists.
3. Demo flow is clear.
4. Sensitive files are not in GitHub.
5. MVP works end-to-end.
6. Project can be shown in a portfolio or interview.

---

# 10. Current Recommended Next Sprint

The next sprint should be:

```text
Sprint 1 — AI Integration Preparation
```

Reason:

* Documentation foundation is mostly complete.
* AI integration is the next major product capability.
* AI has privacy and hallucination risks.
* The project should prepare AI safely before building UI.

---

# 11. Definition of Ready

A task is ready to start when:

1. The goal is clear.
2. The related user story is known.
3. The risk is understood.
4. The expected output is defined.
5. Required files or dependencies are available.
6. The task is small enough to complete in one focused session.

---

# 12. Definition of Done

A task is done when:

1. Code or documentation is completed.
2. It was manually tested if relevant.
3. It does not break existing functionality.
4. Private files are not tracked by Git.
5. Related docs are updated if needed.
6. Changelog is updated for meaningful changes.
7. Git commit is created.
8. Git push is completed.

---

# 13. Session Checklist

At the start of each work session:

1. Review the current sprint goal.
2. Run `git status`.
3. Confirm no private files are staged.
4. Choose one or two tasks only.
5. Work on the selected tasks.

At the end of each work session:

1. Run the application if code changed.
2. Run `git status`.
3. Check private files are not tracked.
4. Update documentation or changelog if needed.
5. Commit and push safe files.
6. Write down the next task.

---

# 14. Current Next Action

The next action is:

```text
Start Sprint 1 — AI Integration Preparation
```

The first technical task should be:

```text
Review `.gitignore` and confirm `.env`, data files, and output files are protected.
```

Only after this should the project add AI API key handling.
