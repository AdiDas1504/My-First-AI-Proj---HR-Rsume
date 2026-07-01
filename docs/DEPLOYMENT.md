# Deployment Guide — JobFit AI Resume Tailor

## Local Run

### 1. Install dependencies

```powershell
python -m pip install -r requirements.txt
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```powershell
Copy-Item .env.example .env
```

Edit `.env` — see the [Environment Variables](#environment-variables) section below.

### 3. Run the Streamlit app

```powershell
python -m streamlit run streamlit_app.py
```

Open your browser at `http://localhost:8501`.

### 4. Run the terminal app

```powershell
python app.py
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Optional | Claude API key. Leave blank to run without AI features. |
| `CLAUDE_MODEL` | Optional | Claude model ID. Defaults to `claude-sonnet-4-6` if not set. |

**Claude AI is optional.** The app runs without an API key. AI features (Claude-powered resume drafts) are only activated when a valid key is provided and the user gives explicit consent.

---

## Claude API Setup (Optional)

1. Create an account at [console.anthropic.com](https://console.anthropic.com).
2. Generate an API key.
3. Add it to your `.env` file:

```
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-sonnet-4-6
```

4. Verify configuration:

```powershell
python -c "from src.ai_config import is_ai_configured; print(is_ai_configured())"
```

Expected output: `True`

---

## Tesseract / OCR Setup

Tesseract is required to read job postings from image files or screenshots.

### Windows

1. Download the installer from the [UB Mannheim Tesseract releases page](https://github.com/UB-Mannheim/tesseract/wiki).
2. Run the installer. The default path is `C:\Program Files\Tesseract-OCR\tesseract.exe`.
3. Add Tesseract to your system PATH, or set the path in your code.

### macOS

```bash
brew install tesseract
```

### Linux (Ubuntu/Debian)

```bash
sudo apt-get install tesseract-ocr
```

If OCR is not installed, the app will still work for PDF, DOCX, and URL job sources. Image input will fail with an error message.

### Streamlit Community Cloud

Streamlit Cloud uses `packages.txt` in the repo root to install system (apt) packages before the Python environment is built. The file **must be committed** for OCR to work on Streamlit Cloud:

```
tesseract-ocr
tesseract-ocr-eng
tesseract-ocr-heb
```

This file is already present in the repo as `packages.txt`. Do not remove it.

---

## Privacy Warning

**Never commit the following to any repository:**

- `.env` — contains your API key
- `data/resumes/` — real candidate resume files
- `data/job_posts/` — real job posting files
- `output/` — generated reports and resume drafts

These paths are protected by `.gitignore`. Do not remove those protections.

Before every commit:

```powershell
git status
```

Do not use `git add .` without reviewing the status output first.

---

## Running Tests

```powershell
python -m pytest tests/
```

AI safety tests only:

```powershell
python -m tests.ai_safety_test_runner
```

---

## Troubleshooting

**App fails to start — missing module**

```
ModuleNotFoundError: No module named 'X'
```

Run:

```powershell
python -m pip install -r requirements.txt
```

**PDF extraction returns empty text**

Some PDFs are image-based. Install Tesseract and retry, or use a text-based PDF.

**Claude AI features not appearing**

Check your `.env` file has a valid `ANTHROPIC_API_KEY`. Verify with:

```powershell
python -c "from src.ai_config import is_ai_configured; print(is_ai_configured())"
```

**Streamlit port already in use**

```powershell
python -m streamlit run streamlit_app.py --server.port 8502
```

**OCR not working on Windows**

Ensure Tesseract is installed and on your PATH, or update the `tesseract_cmd` path in `src/job_reader.py`.
