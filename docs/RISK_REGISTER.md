# RISK REGISTER — JobFit AI Resume Tailor

## 1. Purpose

This document defines the risk register for JobFit AI Resume Tailor.

A risk register is a project management tool used to identify, assess, prioritize, and manage risks that may affect the project.

This document focuses on:

* Technical risks
* AI risks
* Data privacy risks
* Product risks
* Project management risks
* Testing risks
* Future deployment risks

The risk register should be reviewed and updated throughout the project.

---

## 2. What Is a Risk?

A risk is something that may happen in the future and could affect the project negatively.

Example:

“AI may invent candidate experience.”

This is a risk because it may happen when AI integration is added.

---

## 3. Risk vs Issue

A risk is something that may happen.

An issue is something that already happened.

Example:

Risk:
OCR may fail on blurry screenshots.

Issue:
OCR failed on the current uploaded screenshot.

Risks should be monitored.

Issues should be fixed.

---

## 4. Risk Scoring Method

Each risk is evaluated using:

```text
Risk Score = Probability × Impact
```

## 4.1 Probability Scale

| Score | Meaning   | Description                               |
| ----: | --------- | ----------------------------------------- |
|     1 | Very Low  | Unlikely to happen                        |
|     2 | Low       | May happen, but not likely                |
|     3 | Medium    | Could reasonably happen                   |
|     4 | High      | Likely to happen                          |
|     5 | Very High | Very likely or already close to happening |

## 4.2 Impact Scale

| Score | Meaning   | Description                                      |
| ----: | --------- | ------------------------------------------------ |
|     1 | Very Low  | Minimal effect                                   |
|     2 | Low       | Small delay or small quality issue               |
|     3 | Medium    | Noticeable impact on product quality or timeline |
|     4 | High      | Major impact on MVP, privacy, or trust           |
|     5 | Very High | Critical impact, may block or damage the project |

## 4.3 Risk Priority Levels

| Score Range | Priority | Action                        |
| ----------: | -------- | ----------------------------- |
|         1–5 | Low      | Monitor                       |
|        6–10 | Medium   | Mitigate when possible        |
|       11–15 | High     | Actively manage               |
|       16–25 | Critical | Immediate mitigation required |

---

## 5. Risk Response Strategies

The project will use four standard risk response strategies.

## 5.1 Avoid

Change the project plan to remove the risk.

Example:
Do not allow AI to automatically add missing skills as facts.

## 5.2 Mitigate

Reduce the probability or impact of the risk.

Example:
Use `.gitignore` to reduce the risk of committing private resume files.

## 5.3 Transfer

Move the risk to another system, provider, or tool.

Example:
Use an external OCR engine instead of building OCR from scratch.

## 5.4 Accept

Acknowledge the risk and proceed.

Example:
Accept that Word formatting will be basic in the MVP.

---

## 6. Risk Register Table

| ID  | Category   | Risk                                                                      | Probability | Impact | Score | Priority | Response        | Mitigation Plan                                                           | Trigger                                                | Contingency Plan                                          | Owner             | Status  |
| --- | ---------- | ------------------------------------------------------------------------- | ----------: | -----: | ----: | -------- | --------------- | ------------------------------------------------------------------------- | ------------------------------------------------------ | --------------------------------------------------------- | ----------------- | ------- |
| R1  | Technical  | PDF extraction may be poor for designed or multi-column resumes           |           4 |      4 |    16 | Critical | Mitigate        | Use PyMuPDF, support DOCX, consider OCR fallback                          | Extracted resume text is unreadable or too short       | Ask user for DOCX or clearer file; add OCR fallback later | Developer         | Open    |
| R2  | Technical  | DOCX resume extraction may miss tables, headers, or complex formatting    |           3 |      3 |     9 | Medium   | Mitigate        | Improve DOCX reader and test with multiple resume formats                 | Missing sections in extracted text                     | Add table/header extraction support                       | Developer         | Open    |
| R3  | Technical  | Job websites may block URL extraction                                     |           4 |      3 |    12 | High     | Mitigate        | Support screenshot OCR as fallback                                        | URL returns empty or irrelevant text                   | Ask user to upload screenshot                             | Developer         | Open    |
| R4  | Technical  | Job pages may load content dynamically with JavaScript                    |           4 |      3 |    12 | High     | Mitigate        | Use screenshot fallback; consider browser-based extraction later          | Extracted URL text does not include job requirements   | Use screenshot or future browser automation               | Developer         | Open    |
| R5  | OCR        | OCR may fail on blurry or low-quality screenshots                         |           4 |      3 |    12 | High     | Mitigate        | Add warning when extracted text is too short; improve preprocessing later | OCR text is short, broken, or meaningless              | Ask user for clearer screenshot                           | Developer         | Open    |
| R6  | OCR        | Hebrew OCR may be inaccurate                                              |           4 |      3 |    12 | High     | Mitigate        | Use Hebrew OCR when available; improve with AI semantic analysis later    | Hebrew text appears reversed, missing, or corrupted    | Ask user for clearer image or manual text input           | Developer         | Open    |
| R7  | Analysis   | Fit score may be misleading or too simplistic                             |           3 |      4 |    12 | High     | Mitigate        | Explain that score is an estimate; improve scoring later                  | User receives score that does not match human judgment | Add explanation and AI semantic analysis                  | Product           | Open    |
| R8  | Analysis   | Keyword matching may miss semantic matches                                |           4 |      3 |    12 | High     | Mitigate        | Use concept groups now; add AI semantic analysis later                    | Relevant experience is not recognized                  | Add AI-based analysis                                     | Developer         | Open    |
| R9  | AI Safety  | AI may invent skills, tools, achievements, or experience                  |           4 |      5 |    20 | Critical | Avoid/Mitigate  | Use strict AI policy, strong prompt, honesty check, manual review         | AI output includes unsupported claims                  | Block or flag unsupported claims; require user review     | Product/Developer | Planned |
| R10 | AI Safety  | AI may invent numbers or measurable impact                                |           4 |      5 |    20 | Critical | Avoid/Mitigate  | Prompt AI not to invent metrics; add validation checklist                 | Output includes fake numbers like 30% improvement      | Remove invented metrics and mark as “add only if true”    | Product/Developer | Planned |
| R11 | AI Safety  | Prompt injection from job posting may manipulate AI                       |           3 |      4 |    12 | High     | Mitigate        | Treat resume and job text as data, not instructions                       | Job text includes “ignore previous instructions”       | Add prompt-injection warning in AI prompt                 | Developer         | Planned |
| R12 | Privacy    | Resume files may be accidentally committed to GitHub                      |           3 |      5 |    15 | High     | Mitigate        | Use `.gitignore`; check `git status` before commit                        | Resume file appears in Git status                      | Remove file from tracking immediately                     | Developer         | Open    |
| R13 | Privacy    | Output files may contain personal data and be committed                   |           3 |      5 |    15 | High     | Mitigate        | Ignore `output/`; review status before commit                             | Generated report appears in Git status                 | Remove from Git tracking; update `.gitignore`             | Developer         | Open    |
| R14 | Privacy    | API key may be exposed in code or GitHub                                  |           2 |      5 |    10 | Medium   | Avoid           | Store key in `.env`; never hardcode; ignore `.env`                        | `.env` or key appears in Git status or code            | Rotate API key immediately                                | Developer         | Planned |
| R15 | Privacy    | Resume data may be sent to external AI API without clear user notice      |           3 |      5 |    15 | High     | Mitigate        | Add consent notice before AI processing                                   | AI integration sends resume to API                     | Add confirmation step before AI call                      | Product           | Planned |
| R16 | Product    | Product scope may become too large                                        |           4 |      4 |    16 | Critical | Mitigate        | Follow PRD and Roadmap; separate MVP and post-MVP                         | New features added before core flow is stable          | Move feature to backlog                                   | Product/Project   | Open    |
| R17 | Product    | User may think the product guarantees hiring success                      |           3 |      4 |    12 | High     | Mitigate        | Add wording that fit score is not a hiring prediction                     | User interprets score as final judgment                | Add stronger disclaimer in report/UI                      | Product           | Open    |
| R18 | Product    | User may submit AI-generated resume without reviewing                     |           3 |      4 |    12 | High     | Mitigate        | Add user review warning in every output                                   | User treats AI draft as final                          | Add mandatory review notice                               | Product           | Planned |
| R19 | Quality    | No automated tests may lead to regressions                                |           3 |      3 |     9 | Medium   | Mitigate        | Use manual test plan now; add unit tests later                            | Previously working feature breaks                      | Add tests for key functions                               | Developer         | Open    |
| R20 | Quality    | Generated Word documents may look unprofessional                          |           3 |      2 |     6 | Medium   | Accept/Mitigate | Improve formatting after core features work                               | Word output is readable but visually weak              | Improve templates later                                   | Developer         | Open    |
| R21 | Project    | Critical path may be delayed by too much documentation or scope expansion |           3 |      3 |     9 | Medium   | Mitigate        | Keep documents useful and tied to implementation                          | Documentation replaces implementation for too long     | Return to roadmap and next build task                     | Project           | Open    |
| R22 | Project    | Developer may lose track of what changed                                  |           3 |      2 |     6 | Medium   | Mitigate        | Maintain CHANGELOG and Git commits                                        | Hard to remember which version added what              | Update changelog after each milestone                     | Project           | Open    |
| R23 | Deployment | Cloud deployment may expose private files if designed poorly              |           2 |      5 |    10 | Medium   | Avoid/Mitigate  | Do not deploy before privacy design is ready                              | Deployment is considered                               | Add secure upload and deletion policy first               | Developer         | Planned |
| R24 | Cost       | External AI API may create unexpected cost                                |           2 |      3 |     6 | Medium   | Mitigate        | Limit text length, test carefully, monitor usage                          | API usage increases unexpectedly                       | Add usage limits and non-AI fallback                      | Developer         | Planned |
| R25 | UX         | Terminal interface may be hard for non-technical users                    |           4 |      2 |     8 | Medium   | Mitigate        | Add Streamlit UI later                                                    | User cannot run terminal flow easily                   | Build simple upload/download UI                           | Product/Developer | Planned |

---

## 7. Top Risks Requiring Active Management

The highest priority risks are:

## R9 — AI Invents Skills or Experience

Why it matters:
This could damage user trust and lead to dishonest resume content.

Current response:
Avoid and mitigate.

Required controls:

* Strict AI prompt
* AI policy
* Honesty check
* User review warning
* Future automated validation

---

## R10 — AI Invents Numbers or Achievements

Why it matters:
Fake metrics can make the resume misleading.

Current response:
Avoid and mitigate.

Required controls:

* Do not invent metrics
* Suggest metrics only if true
* Flag unsupported numbers
* Require manual review

---

## R1 — Poor PDF Extraction

Why it matters:
If the resume text is extracted badly, every later step becomes unreliable.

Current response:
Mitigate.

Required controls:

* Use PyMuPDF
* Support DOCX
* Warn when extracted text is too short
* Consider OCR fallback

---

## R16 — Scope Becomes Too Large

Why it matters:
The project may lose focus if too many features are added before the MVP is stable.

Current response:
Mitigate.

Required controls:

* Follow PRD
* Follow roadmap
* Keep MVP boundaries
* Move extra ideas to future backlog

---

## R12/R13 — Private Files Committed to GitHub

Why it matters:
Resume and output files may contain personal information.

Current response:
Mitigate.

Required controls:

* `.gitignore`
* `git status` before every commit
* Do not use `git add .` without checking
* Keep data and output folders local

---

## 8. Risk Triggers

Risk triggers are warning signs that a risk may be happening.

Examples:

| Risk ID | Trigger                                       |
| ------- | --------------------------------------------- |
| R1      | Resume preview looks unreadable               |
| R3      | URL extraction returns irrelevant page text   |
| R5      | OCR output has very few characters            |
| R7      | Fit score feels unrelated to the job          |
| R9      | AI output includes a skill not in the resume  |
| R10     | AI output includes invented numbers           |
| R12     | Resume file appears in `git status`           |
| R14     | `.env` appears in `git status`                |
| R16     | New feature is added without updating roadmap |
| R19     | A previously working feature breaks           |

---

## 9. Risk Review Cadence

The risk register should be reviewed:

* Before AI integration
* Before creating the UI
* Before deployment
* After major bugs
* After adding new dependencies
* Before presenting the project as a portfolio item

Recommended review questions:

1. Did we add a new risk?
2. Did any risk become more likely?
3. Did any risk become more severe?
4. Did we close or reduce any risk?
5. Do we need to update the mitigation plan?
6. Does the roadmap need to change?

---

## 10. Risk Status Definitions

| Status    | Meaning                                    |
| --------- | ------------------------------------------ |
| Open      | Risk exists and needs monitoring           |
| Planned   | Risk relates to future feature             |
| Mitigated | Controls were added but risk still exists  |
| Closed    | Risk is no longer relevant                 |
| Issue     | Risk occurred and became an active problem |

---

## 11. Escalation Rules

Since this is currently a solo learning project, escalation means stopping development and addressing the risk before moving forward.

Escalate immediately if:

* API key is exposed
* Resume files are committed to GitHub
* AI produces unsupported professional claims
* Output files with personal data are pushed publicly
* A major feature produces misleading results
* A new feature violates the PRD, AI policy, or privacy rules

---

## 12. Immediate Risk Actions

Immediate actions to take before AI integration:

1. Confirm `.gitignore` protects private files.
2. Confirm `.env` is ignored by Git.
3. Add AI consent notice before external AI processing.
4. Add strict prompt rules based on `AI_POLICY.md`.
5. Add AI output review warning.
6. Test that AI does not invent missing skills.
7. Test that AI does not invent numbers.
8. Add clear error message for missing API key.
9. Keep non-AI baseline mode working.

---

## 13. Current Risk Summary

Current overall risk level:

High.

Reason:

* The core local pipeline works.
* Private file protection exists through `.gitignore`.
* AI has not been connected yet.
* The highest risks are related to future AI hallucination and privacy exposure.
* These risks are manageable if AI policy, privacy rules, and test plan are followed.

---

## 14. Risk Register Maintenance

This document should be updated when:

* A new feature is added
* A new dependency is added
* AI behavior changes
* File handling changes
* Privacy behavior changes
* The UI is added
* Deployment is considered
* A risk becomes an issue
* A mitigation is completed

Every major version should include a quick risk review.
