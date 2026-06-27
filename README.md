# JobFit AI Resume Tailor

An AI-assisted resume-job matching tool that extracts real job requirements, compares them to a candidate's resume, and suggests safe, honest improvements — without inventing experience.

---

## What It Does

JobFit AI Resume Tailor helps job candidates understand how well their resume matches a specific job posting and generate actionable tailoring recommendations.

The core principle: **the tool may rewrite, reorganize, and emphasize what already exists in the resume — it must never fabricate skills, experience, education, or achievements.**

---

## Key Features

| Feature | Details |
|---|---|
| Resume reading | PDF and DOCX |
| Job post input | URL, image/screenshot, PDF, DOCX |
| Requirements extraction | Canonical job requirements parsed from real postings |
| Fit score | Concept-based match score between resume and job |
| Gap analysis | Matched concepts, missing concepts, weak areas |
| Improvement tips | Safe rewriting suggestions tied to actual resume content |
| AI rewrite option | Claude-powered tailored resume draft (optional, consent-gated) |
| AI safety enforcement | Fabrication is blocked at prompt, generation, and validation layers |
| Streamlit UI | Two-screen interface: upload → analyze → review → download |
| Downloadable reports | TXT and Word export |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| UI | Streamlit |
| PDF reading | pdfplumber |
| DOCX reading | python-docx |
| OCR (images) | Tesseract via pytesseract |
| Web scraping | requests, BeautifulSoup |
| AI integration | Claude API (Anthropic) |
| Testing | pytest |
| Environment | python-dotenv |

---

## Architecture

```
Resume (PDF/DOCX)       Job Post (URL / image / PDF / DOCX)
        │                               │
        ▼                               ▼
  resume_reader.py              job_reader.py
        │                               │
        └──────────┬────────────────────┘
                   ▼
            text_cleaner.py
                   │
                   ▼
             analyzer.py          ← concept-based match
                   │
          ┌────────┴────────┐
          ▼                 ▼
  report_generator.py   resume_tailor.py
          │                 │
          │         (optional) claude_resume_writer.py
          │                 │
          └────────┬────────┘
                   ▼
           output_writer.py
         (TXT + Word download)
```

---

## AI Safety

This tool enforces honesty at every layer.

**The AI must not:**
- Invent skills, tools, or technologies
- Invent education, certifications, or companies
- Invent job titles, responsibilities, or achievements
- Invent years of experience, metrics, or numbers
- Convert exposure into expertise
- Claim a candidate meets a requirement that the resume does not support

**If a job requirement is missing from the resume**, the system flags it as:

> "Add only if true."

**Prompt injection protection:** resume text, job posting text, OCR output, and uploaded documents are treated as data — not instructions. The system ignores any instruction-like content embedded in input files.

**Validation layer:** `ai_output_validator.py` reviews every Claude-generated draft for fabricated content before it is shown to the user.

---

## Privacy

- `.env` files are never committed
- Real resume files are never committed
- Real job postings are never committed
- Generated output files are never committed
- No personal data, API keys, or private files are stored in the repository

Only source code, documentation, `.env.example`, and synthetic test data are version-controlled.

---

## Local Setup

**Requirements:** Python 3.10+, Tesseract OCR installed on the system.

```powershell
# Clone the repository
git clone <repo-url>
cd jobfit-portfolio-docs

# Create and activate a virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
python -m pip install -r requirements.txt

# Copy the example environment file and add your Claude API key
copy .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=your_key_here
```

**Run the Streamlit UI:**

```powershell
python -m streamlit run streamlit_app.py
```

**Run the terminal app:**

```powershell
python app.py
```

**Run tests:**

```powershell
pytest
```

**Run AI safety tests:**

```powershell
python -m tests.ai_safety_test_runner
```

**Check Claude API configuration:**

```powershell
python -c "from src.ai_config import is_ai_configured; print(is_ai_configured())"
```

---

## Demo Flow

See [`docs/DEMO_GUIDE.md`](docs/DEMO_GUIDE.md) for a step-by-step walkthrough.

**Quick summary:**
1. Open the Streamlit app
2. Upload a resume (PDF or DOCX)
3. Provide a job posting (URL, image, PDF, or DOCX)
4. Click **Analyze**
5. Review extracted job requirements
6. Review matched concepts, gaps, and improvement tips
7. Optionally generate a Claude-powered resume draft
8. Download the report or tailored resume

---

## Limitations

- **OCR accuracy:** image/screenshot input depends on image quality; DOCX and PDF inputs are more reliable
- **Fit score:** the score is assistive and concept-based — it is not a definitive hiring signal
- **Claude suggestions:** AI-generated drafts require human review before use
- **URL scraping:** some job boards block automated access; screenshot or file upload is the fallback
- **Language:** the tool is optimized for English-language resumes and job postings

---

## Project Status

Active development. Core pipeline (read → extract → analyze → report → download) is functional. Claude AI integration is optional and consent-gated.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) and [`docs/CHANGELOG.md`](docs/CHANGELOG.md) for current priorities and recent changes.

---

## License

For portfolio and educational use.
