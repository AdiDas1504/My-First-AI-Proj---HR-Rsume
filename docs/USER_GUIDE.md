# USER_GUIDE — JobFit AI Resume Tailor

## Overview

This guide explains how to use JobFit AI Resume Tailor step by step. The product is available as a terminal app and a Streamlit browser-based UI.

---

## 1. How to Start the App

### Requirements

Before starting, make sure you have:

- Python 3.9 or later installed
- Dependencies installed (see below)
- A virtual environment activated (recommended)

### Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### Option A — Terminal App

```powershell
python app.py
```

The terminal app guides you through each step with prompts.

### Option B — Streamlit UI

```powershell
python -m streamlit run streamlit_app.py
```

This opens a browser window. Use the Streamlit UI if you prefer a visual interface.

---

## 2. How to Upload a Resume

### Terminal App

When prompted, type the full path to your resume file.

**Example:**

```
Enter resume file path: C:\Users\yourname\Documents\my_resume.pdf
```

Supported formats: **PDF**, **DOCX**

**Tips:**
- Make sure the file path has no extra spaces.
- If the path contains spaces, wrap it in quotes.
- DOCX files generally extract more reliably than PDF files.

### Streamlit UI

Click the **Upload Resume** button and select your file from the file browser.

Supported formats: **PDF**, **DOCX**

---

## 3. How to Provide a Job Source

You can provide a job posting in four ways.

### Option A — URL

Paste the URL of the job posting when prompted.

**Example:**

```
Enter job posting URL: https://example.com/jobs/product-manager
```

**Note:** Some job sites block automated access. If the URL returns an error or empty text, use a screenshot or PDF instead.

### Option B — Screenshot or Image

Provide the file path to a screenshot of the job posting.

**Example:**

```
Enter job image path: C:\Users\yourname\Downloads\job_screenshot.png
```

Supported image formats: PNG, JPG, JPEG

The system uses OCR to read the text. For best results:
- Use a clear, high-resolution image.
- Make sure all text is visible and not cut off.
- Avoid dark backgrounds or very small fonts.

### Option C — PDF

Provide the file path to a PDF version of the job posting.

**Example:**

```
Enter job PDF path: C:\Users\yourname\Downloads\job_posting.pdf
```

### Option D — DOCX

Provide the file path to a Word file containing the job posting.

---

## 4. How to Read the Fit Score

After analysis, the system displays a fit score and fit level.

**Example output:**

```
Fit Score: 68%
Fit Level: Good
```

| Score   | Level    | What It Means                                                    |
|---------|----------|-------------------------------------------------------------------|
| 80–100% | Strong   | Your resume covers most of what the job requires.               |
| 60–79%  | Good     | Good coverage. A few important gaps exist.                      |
| 40–59%  | Moderate | Partial match. Several key areas are missing or unclear.        |
| 20–39%  | Weak     | Limited overlap. Significant gaps in how the resume is framed.  |
| 0–19%   | Very Low | Little alignment between resume and job requirements.           |

**What the score does not mean:**

- A low score does not mean you are unqualified. It may mean your resume is not presenting your experience in terms the job recognizes.
- A high score is not a guarantee of a callback. It means the resume language aligns well with the job requirements.

---

## 5. How to Review Matched and Missing Concepts

The fit report shows two sections:

### Matched Concepts

These are areas that appeared in both your resume and the job posting. This is what the system recognized as relevant overlap.

**Example:**

```
Matched: project management, stakeholder communication, data analysis, Python
```

### Missing Concepts

These are areas the job requires that were not clearly found in your resume.

**Example:**

```
Missing: machine learning, SQL, agile methodology
```

Each missing item is a signal — not a verdict. It may mean:

- You have the skill but did not mention it clearly in your resume.
- You have adjacent experience that could be presented differently.
- You genuinely do not have that skill (in which case, do not add it).

All missing items are labeled: **"Add only if true."**

---

## 6. How to Use the Tailoring Plan Safely

The tailoring plan suggests specific changes to your resume. It is a starting point for your own editing — not a final product.

### What the tailoring plan includes

- Which resume sections to strengthen
- How to reframe existing bullet points to match the job language
- Which skills or keywords to add (only if they are genuinely part of your experience)
- Which gaps to leave as-is unless they are truly applicable

### Rules to follow when using the tailoring plan

1. **Only add what is true.** If the plan suggests adding a skill or tool you do not have, do not add it.
2. **Rewrite based on what is already there.** You may reorder, clarify, or reframe existing experience — but do not invent experience.
3. **Review every suggestion manually.** The plan is generated from text matching, not from understanding your full background.
4. **You own the final resume.** The system's output is a draft and a guide. You decide what goes into the final version.

### AI-generated tailoring draft (optional)

If a Claude API key is configured, the system can generate a full AI-powered resume draft. This draft:

- Is based entirely on your original resume content
- Includes a warning that it requires review before use
- Must not be submitted without your own review and editing

---

## 7. How to Download Outputs

After analysis, the system saves output files in the `output/` folder.

### Files generated

| File                        | Contents                                 |
|-----------------------------|------------------------------------------|
| `fit_report.txt`            | Plain text version of the fit report     |
| `fit_report.docx`           | Word version of the fit report           |
| `tailored_resume_draft.txt` | Plain text version of the tailored draft |
| `tailored_resume_draft.docx`| Word version of the tailored draft       |

### Terminal App

Output files are saved automatically. The terminal will display the file paths when done.

### Streamlit UI

Download buttons appear on screen after analysis completes. Click to save each file to your machine.

**Note:** Output files are stored locally and are not uploaded anywhere. Do not commit files from the `output/` folder to version control.

---

## 8. Troubleshooting Common Issues

### Resume text is empty or garbled

**Likely cause:** The PDF was created from a scan or uses complex formatting that prevents text extraction.

**Fix:**
- Try a DOCX version of your resume if you have one.
- Copy your resume text into a plain Word document and save as DOCX.
- If using a scanned PDF, the system cannot extract text from it in the current version.

---

### Job URL returned empty or very short text

**Likely cause:** The website blocks automated reading or loads content with JavaScript.

**Fix:**
- Take a screenshot of the job posting and provide it as an image.
- Save the job posting as a PDF and provide the file path instead.

---

### OCR output is missing text or has many errors

**Likely cause:** The image is low resolution, blurry, or has unusual formatting.

**Fix:**
- Use a higher-resolution screenshot.
- Zoom in before taking the screenshot to increase text size.
- Avoid dark backgrounds or light-on-dark text.
- Crop the image to remove irrelevant parts of the page.

---

### Fit score seems unexpectedly low

**Likely cause:** The resume uses different terminology than the job posting, or key skills are mentioned only in passing.

**Fix:**
- Review the missing concepts list. If you have those skills, add them explicitly to your resume.
- Reframe existing bullet points to use the same language the job uses.
- Re-run the analysis after updating your resume.

---

### AI draft not available

**Likely cause:** No Claude API key is configured.

**Fix:**
- Create a `.env` file in the project root based on `.env.example`.
- Add your Claude API key to `.env`.
- Restart the app.

---

### Output Word file is not formatted well

**Likely cause:** The current export does not preserve the original resume visual design.

**Fix:**
- Use the Word output as a starting point for content.
- Copy the suggested text into your original formatted resume template manually.

---

### Hebrew text appears reversed or broken in the terminal

**Likely cause:** Terminal does not support right-to-left rendering.

**Fix:**
- The Streamlit UI handles Hebrew display more reliably.
- Run `python -m streamlit run streamlit_app.py` to use the browser-based interface.

---

## Quick Reference

| Task                        | Command                                          |
|-----------------------------|--------------------------------------------------|
| Install dependencies        | `python -m pip install -r requirements.txt`      |
| Run terminal app            | `python app.py`                                  |
| Run Streamlit UI            | `python -m streamlit run streamlit_app.py`       |
| Check AI configuration      | `python -c "from src.ai_config import is_ai_configured; print(is_ai_configured())"` |
| Run AI safety tests         | `python -m tests.ai_safety_test_runner`          |
