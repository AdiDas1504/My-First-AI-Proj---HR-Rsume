# Demo Guide — JobFit AI Resume Tailor

This guide walks through a complete demo session using the Streamlit UI.

---

## Prerequisites

- App is running locally: `python -m streamlit run streamlit_app.py`
- A sample resume file is available (PDF or DOCX)
- A job posting URL or screenshot is available
- Claude API key is set in `.env` if you want to demo the AI rewrite (optional)

---

## Step-by-Step Demo

### Step 1 — Open the app

Open your browser. The Streamlit app runs at `http://localhost:8501` by default.

You will see the upload screen.

---

### Step 2 — Upload a resume

Click **Browse files** under "Upload your resume."

Select a PDF or DOCX resume file.

The app will extract the resume text and display a preview.

**What to note:**
- Text is extracted from the file directly (no manual copy-paste)
- PDF and DOCX are both supported
- The raw text is shown so the candidate can confirm it was read correctly

---

### Step 3 — Provide a job posting

Choose one of the four input methods:

| Method | When to use |
|---|---|
| URL | Public job posting on LinkedIn, Indeed, company website |
| Image / screenshot | Screenshot of any job post |
| PDF | Downloaded job description file |
| DOCX | Word document job description |

Provide the input and click **Load Job Posting.**

The app will extract and display the raw job post text.

---

### Step 4 — Analyze

Click **Analyze.**

The pipeline runs:
1. Text cleaning
2. Job requirements extraction
3. Concept-based match analysis
4. Fit score calculation
5. Gap identification
6. Improvement tip generation

---

### Step 5 — Review extracted job requirements

The app displays the canonical requirements extracted from the job posting.

**What to note:**
- Requirements are extracted from real job posting content
- Nothing is invented or assumed
- The candidate can see exactly what the job is asking for

---

### Step 6 — Review the fit report

The results screen shows:

- **Fit score** — percentage match between resume concepts and job requirements
- **Matched concepts** — skills and experience the resume already covers
- **Missing concepts** — job requirements not found in the resume
- **Improvement tips** — safe suggestions tied to actual resume content

**What to note for missing items:**
- Missing requirements are flagged as **"Add only if true"**
- The tool never suggests adding something the candidate does not actually have

---

### Step 7 — Optional: AI resume rewrite

If Claude API is configured, an **AI Rewrite** option appears.

The app asks for explicit consent before sending data to the API.

After consent, Claude generates a tailored resume draft:
- Based only on content already in the resume
- Flagged with a review warning
- Shown in full for the candidate to edit before use

**What to note:**
- The AI cannot invent experience
- Any missing requirement stays flagged as "Add only if true"
- The draft is a starting point, not a final document

---

### Step 8 — Download

Use the download buttons to save:

- **Report (TXT)** — fit score, matched/missing concepts, tips
- **Tailored resume (DOCX)** — if AI rewrite was generated

---

## Demo Tips

- Use a real-looking synthetic resume for demos (not a real person's data)
- Use a public job posting URL that is reliably accessible
- If OCR demo is needed, use a clean screenshot with readable font
- The fit score will vary by resume content — a partial match is realistic and expected
- Show the "missing concept" section to highlight the honesty feature

---

## What Not to Demo

- Do not use real personal resumes in a public demo
- Do not commit any files from `data/resumes/`, `data/job_posts/`, or `output/`
- Do not share or display `.env` contents or API keys
