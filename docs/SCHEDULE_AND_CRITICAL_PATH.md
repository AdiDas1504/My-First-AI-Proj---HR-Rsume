# SCHEDULE AND CRITICAL PATH — JobFit AI Resume Tailor

## 1. Purpose

This document defines the project schedule and critical path for JobFit AI Resume Tailor.

The goal is to understand:

* What tasks remain
* What depends on what
* Which tasks control the project timeline
* Which tasks have flexibility
* What must be completed before AI integration, UI, testing, and portfolio readiness

This document uses project management concepts such as:

* Activity list
* Duration
* Dependencies
* Early Start
* Early Finish
* Late Start
* Late Finish
* Float
* Critical path

---

## 2. Scheduling Unit

This project is a learning and portfolio project, so time is estimated in work sessions rather than exact calendar days.

One work session means a focused development or documentation session.

Example:

```text id="7dpgbc"
1 session = one focused block of work
```

The estimates are flexible and should be updated as the project progresses.

---

## 3. Key Scheduling Concepts

## 3.1 Activity

An activity is a task that takes time.

Example:

```text id="uamjzx"
Build AI client module
```

## 3.2 Duration

Duration is the estimated amount of work needed.

Example:

```text id="i1v4r3"
Duration = 1 session
```

## 3.3 Dependency

A dependency means one activity must happen before another.

Example:

```text id="z5wyba"
AI policy must exist before AI integration
```

## 3.4 Early Start and Early Finish

Early Start is the earliest point a task can begin.

Early Finish is the earliest point a task can finish.

```text id="tov6tr"
Early Finish = Early Start + Duration
```

## 3.5 Late Start and Late Finish

Late Start is the latest point a task can start without delaying the project.

Late Finish is the latest point a task can finish without delaying the project.

```text id="gvgz4c"
Late Start = Late Finish - Duration
```

## 3.6 Float

Float is how much a task can be delayed without delaying the overall project.

```text id="b749ag"
Float = Late Start - Early Start
```

If Float = 0, the task is on the critical path.

## 3.7 Critical Path

The critical path is the longest dependent sequence of tasks.

If a task on the critical path is delayed, the entire project is delayed.

---

## 4. Current Project Position

Completed or mostly completed:

* Development setup
* Git and GitHub setup
* Resume reader
* Job reader from URL
* Job reader from screenshot
* OCR setup
* Text cleaning
* Basic match analysis
* Report generation
* Word export
* Tailored resume draft export
* Product documentation
* AI policy
* Data privacy document
* Test plan
* Changelog
* Project management plan
* Risk register

Current stage:

```text id="8p3i71"
Preparing for AI integration and then simple UI
```

---

## 5. Remaining Activity List

The following activity list focuses on the next portfolio-ready MVP.

| ID | Activity                          | Description                                                             | Duration |
| -- | --------------------------------- | ----------------------------------------------------------------------- | -------: |
| A  | Complete documentation foundation | Finish remaining project planning documents                             |        1 |
| B  | Review privacy and Git protection | Confirm `.gitignore`, `.env`, data folders, and output folders are safe |      0.5 |
| C  | Improve core usability            | Make resume path configurable and improve user-facing errors            |        1 |
| D  | Add AI environment setup          | Add `.env`, API key handling, and AI client foundation                  |        1 |
| E  | Add AI consent and user notice    | Notify user before sending resume/job text to AI API                    |      0.5 |
| F  | Build AI resume rewrite           | Generate AI-assisted tailored resume draft using strict rules           |        1 |
| G  | Run AI safety testing             | Test hallucination, fake numbers, missing skills, and prompt injection  |        1 |
| H  | Build simple Streamlit UI         | Create basic upload/input/analyze/download interface                    |        2 |
| I  | Connect UI to existing pipeline   | Connect resume upload, job input, analysis, and downloads               |        1 |
| J  | Run end-to-end testing            | Test full flow from input to Word output                                |        1 |
| K  | Portfolio cleanup                 | Improve README, screenshots, explanation, and final demo flow           |        1 |
| L  | Add automated unit tests          | Add basic tests for readers, analyzer, and output writer                |        2 |
| M  | Improve Word formatting           | Improve visual layout of generated Word files                           |        1 |
| N  | Deployment planning               | Plan cloud deployment and production privacy requirements               |        1 |

---

## 6. Dependency Table

| ID | Activity                          | Predecessors |
| -- | --------------------------------- | ------------ |
| A  | Complete documentation foundation | None         |
| B  | Review privacy and Git protection | A            |
| C  | Improve core usability            | A            |
| D  | Add AI environment setup          | B            |
| E  | Add AI consent and user notice    | D            |
| F  | Build AI resume rewrite           | C, D, E      |
| G  | Run AI safety testing             | F            |
| H  | Build simple Streamlit UI         | C, G         |
| I  | Connect UI to existing pipeline   | H            |
| J  | Run end-to-end testing            | I, G         |
| K  | Portfolio cleanup                 | J            |
| L  | Add automated unit tests          | C            |
| M  | Improve Word formatting           | G            |
| N  | Deployment planning               | K            |

---

## 7. Critical Path Calculation

This schedule uses the following project target:

```text id="9sttgx"
Portfolio-ready local MVP
```

Deployment planning is considered post-MVP and is not required to complete the portfolio-ready local MVP.

## 7.1 CPM Table

| ID | Duration | Predecessors |  ES |  EF |  LS |  LF | Float | Critical? |
| -- | -------: | ------------ | --: | --: | --: | --: | ----: | --------- |
| A  |        1 | None         |   0 |   1 |   0 |   1 |     0 | Yes       |
| B  |      0.5 | A            |   1 | 1.5 |   1 | 1.5 |     0 | Yes       |
| C  |        1 | A            |   1 |   2 |   2 |   3 |     1 | No        |
| D  |        1 | B            | 1.5 | 2.5 | 1.5 | 2.5 |     0 | Yes       |
| E  |      0.5 | D            | 2.5 |   3 | 2.5 |   3 |     0 | Yes       |
| F  |        1 | C, D, E      |   3 |   4 |   3 |   4 |     0 | Yes       |
| G  |        1 | F            |   4 |   5 |   4 |   5 |     0 | Yes       |
| H  |        2 | C, G         |   5 |   7 |   5 |   7 |     0 | Yes       |
| I  |        1 | H            |   7 |   8 |   7 |   8 |     0 | Yes       |
| J  |        1 | I, G         |   8 |   9 |   8 |   9 |     0 | Yes       |
| K  |        1 | J            |   9 |  10 |   9 |  10 |     0 | Yes       |
| L  |        2 | C            |   2 |   4 |   8 |  10 |     6 | No        |
| M  |        1 | G            |   5 |   6 |   9 |  10 |     4 | No        |
| N  |        1 | K            |  10 |  11 |  10 |  11 |     0 | Post-MVP  |

---

## 8. Critical Path

The current critical path for the portfolio-ready local MVP is:

```text id="f3z8eo"
A → B → D → E → F → G → H → I → J → K
```

Expanded:

```text id="8z4crt"
Complete documentation foundation
→ Review privacy and Git protection
→ Add AI environment setup
→ Add AI consent and user notice
→ Build AI resume rewrite
→ Run AI safety testing
→ Build simple Streamlit UI
→ Connect UI to existing pipeline
→ Run end-to-end testing
→ Portfolio cleanup
```

Total estimated duration:

```text id="nqjhif"
10 work sessions
```

This means that if any of these critical tasks are delayed, the portfolio-ready MVP will likely be delayed.

---

## 9. Non-Critical Tasks

The following tasks are useful but not currently on the critical path:

## C — Improve Core Usability

This task has float because it can be completed before AI rewrite is finalized.

However, it should not be ignored because it improves the user flow and reduces errors.

## L — Add Automated Unit Tests

Automated tests are important, but for the immediate portfolio-ready MVP, manual testing can come first.

This task has float and may be done before or after UI if needed.

## M — Improve Word Formatting

Better formatting improves presentation, but it does not block the core product functionality.

This task can be done after the main AI and UI flow works.

## N — Deployment Planning

Deployment planning is post-MVP.

It is important for future production use but does not block the local portfolio demo.

---

## 10. Schedule Interpretation

The schedule shows that the project should not jump directly into UI before AI safety testing.

Reason:

```text id="u14myw"
If the UI is built before AI behavior is safe,
the product may look usable before it is trustworthy.
```

The recommended order is:

```text id="w0gd84"
1. Finish planning and safety documents
2. Confirm privacy protections
3. Add AI setup
4. Add consent notice
5. Build AI rewrite
6. Test AI safety
7. Build UI
8. Connect UI
9. Run end-to-end tests
10. Prepare portfolio presentation
```

---

## 11. Critical Path Risks

The following risks can delay the critical path:

| Risk                           | Affected Activity | Impact                                |
| ------------------------------ | ----------------- | ------------------------------------- |
| API key setup issue            | D                 | Delays AI integration                 |
| AI output invents experience   | F, G              | Blocks AI feature from being accepted |
| AI output invents numbers      | F, G              | Blocks AI feature from being accepted |
| Privacy notice not implemented | E                 | Blocks responsible AI processing      |
| Streamlit integration issue    | H, I              | Delays UI completion                  |
| End-to-end flow fails          | J                 | Delays portfolio readiness            |
| Scope expansion                | Any activity      | Delays entire roadmap                 |

---

## 12. Schedule Control Rules

To keep the project on track:

1. Do not add new major features before AI rewrite and UI are working.
2. Do not connect AI before privacy and AI rules are implemented.
3. Do not build deployment before local MVP works.
4. Do not polish Word formatting before core flow works.
5. Do not skip manual testing.
6. Update the changelog after each milestone.
7. Update the roadmap if scope changes.
8. Review the risk register before AI integration and before UI.

---

## 13. Baseline Schedule

The current baseline schedule is:

| Phase                               | Activities | Estimated Duration |
| ----------------------------------- | ---------- | -----------------: |
| Planning completion                 | A          |                  1 |
| Privacy and AI preparation          | B, D, E    |                  2 |
| Core usability improvement          | C          |                  1 |
| AI implementation and safety        | F, G       |                  2 |
| UI implementation                   | H, I       |                  3 |
| Final testing and portfolio cleanup | J, K       |                  2 |

Estimated portfolio-ready local MVP:

```text id="jmd776"
Approximately 10 focused work sessions
```

---

## 14. Schedule Updates

This document should be updated when:

* A new major activity is added
* A task takes longer than expected
* A task becomes unnecessary
* A task becomes critical
* AI integration changes scope
* UI implementation changes scope
* Deployment becomes part of the MVP
* Automated tests become mandatory before portfolio completion

---

## 15. Next Scheduling Actions

Immediate next actions:

1. Complete this schedule document.
2. Commit it to Git.
3. Review `.gitignore`.
4. Prepare AI environment setup.
5. Implement AI consent notice.
6. Connect AI rewrite carefully.
7. Run AI safety tests before UI.
