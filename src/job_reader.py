import re
from pathlib import Path

import requests
from bs4 import BeautifulSoup
from PIL import Image
import pytesseract
from pytesseract import TesseractNotFoundError

from src.text_cleaner import clean_extracted_text
from src.resume_reader import read_resume

SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
SUPPORTED_DOCUMENT_EXTENSIONS = {".pdf", ".docx"}

RELEVANT_SECTION_KEYWORDS = {
    # English
    "requirements",
    "requirement",
    "qualifications",
    "qualification",
    "responsibilities",
    "responsibility",
    "what you will do",
    "what you'll do",
    "what you need",
    "what you'll need",
    "must have",
    "nice to have",
    "preferred",
    "preferred qualifications",
    "skills",
    "experience",
    "about the role",
    "role overview",
    "what you bring",
    # Hebrew
    "דרישות",
    "דרישות התפקיד",
    "דרישות חובה",
    "דרישת",
    "כישורים",
    "מיומנויות",
    "תחומי אחריות",
    "אחריות",
    "מה תעשו",
    "מה תעשה",
    "מה תעשי",
    "מה נדרש",
    "מה כולל התפקיד",
    "מה התפקיד כולל",
    "מה אנחנו מחפשים",
    "חובה",
    "יתרון",
    "יתרונות",
    "ניסיון נדרש",
    "ניסיון",
    "תיאור התפקיד",
    "על התפקיד",
}

STOP_SECTION_KEYWORDS = {
    # English
    "benefits",
    "why join us",
    "about us",
    "about the company",
    "equal opportunity",
    "privacy",
    "cookie",
    "cookies",
    "apply now",
    "submit application",
    "send resume",
    "share this job",
    "similar jobs",
    "related jobs",
    "recommended jobs",
    "other jobs",
    "job suggestions",
    "faq",
    "frequently asked questions",
    "careers",
    "contact us",
    "life at",
    "our values",
    "save job",
    "footer",
    # Hebrew
    "הטבות",
    "תנאים והטבות",
    "למה להצטרף",
    "מי אנחנו",
    "אודות החברה",
    "שוויון הזדמנויות",
    "פרטיות",
    "עוגיות",
    "הגש מועמדות",
    "להגשת מועמדות",
    "הגשת מועמדות",
    "הגשת קורות חיים",
    "שליחת קורות חיים",
    "רגע לפני ששולחים קורות חיים",
    "משרות נוספות",
    "משרות דומות",
    "הצעות נוספות",
    "שאלות ותשובות",
    "שאלות נפוצות",
    "צור קשר",
    "שתף",
    "שמור משרה",
    "כמה אני שווה",
    "כתוב לי מכתב מקדים",
    "פירוט התאמה ופערים",
    "ציון התאמה",
    "רגע לפני ששולחים",
    # AI/Jobify helper text and FAQ sections that appear after requirements on some job boards
    "מנתחת את קורות החיים",
    "jobify",
    "מהם תחומי האחריות",
    "איזה כישורים",
    "כיצד תפקיד",
    "באיזה תחום",
    "מהו תפקיד",
    "קורות החיים שלך",
    "החברה משתמשת",
    "תהליך הגיוס",
}

NOISE_KEYWORDS = {
    # English
    "cookie",
    "cookies",
    "privacy policy",
    "terms of use",
    "login",
    "sign in",
    "sign up",
    "menu",
    "home",
    "upload resume",
    "facebook",
    "twitter",
    "instagram",
    "newsletter",
    "subscribe",
    "back to jobs",
    # Hebrew
    "עוגיות",
    "מדיניות פרטיות",
    "תנאי שימוש",
    "התחברות",
    "הרשמה",
    "תפריט",
    "עמוד הבית",
    "קריירה",
    "הגש מועמדות",
    "העלאת קורות חיים",
    "חזרה למשרות",
    "כל הזכויות שמורות",
    # Israeli AI-helper button labels
    "כמה אני שווה",
    "כתוב לי מכתב מקדים",
    "שמור משרה",
    "פירוט התאמה ופערים",
    "ציון התאמה",
    "רגע לפני ששולחים",
    "חסר ניסיון קודם",
    "הגשת קורות חיים",
}

# Short standalone lines that are always noise regardless of length or other checks.
EXACT_NOISE_LINES = {
    "התאמה",
    "ציון",
    "חסר ניסיון קודם",
    "הגשת קורות חיים",
    "רגע לפני ששולחים קורות חיים",
    "שמור משרה",
    "שתף",
    "apply",
    "share",
    "save",
}

# Phrases that mark the definitive end of real job requirements.
# When any of these appears in the extracted text, everything from that line
# onward is cut — these are AI helper widgets, FAQ sections, and "similar jobs"
# blocks that job boards append after the actual posting.
CUTOFF_PHRASES = {
    # Hebrew AI/Jobify helper text
    "מנתחת את קורות החיים",
    "jobify",
    "קורות החיים שלך",
    "משרות שמתאימות",
    "משרות חדשות",
    "בלי פרסומות",
    "בלי אותיות קטנות",
    # Hebrew FAQ/explanatory sections
    "מהם תחומי האחריות",
    "תחומי האחריות העיקריים",
    "אילו כישורים",
    "כיצד תפקיד",
    "באיזה תחום",
    "מהו תפקיד",
    "שאלות ותשובות",
    "שאלות נפוצות",
    # English equivalents
    "faq",
    "frequently asked questions",
    "similar jobs",
    "recommended jobs",
    "related jobs",
    "job suggestions",
}

IMPORTANT_JOB_WORDS = {
    # English
    "ai",
    "security",
    "cyber",
    "product",
    "manager",
    "data",
    "cloud",
    "saas",
    "api",
    "python",
    "sql",
    "analytics",
    "automation",
    "stakeholders",
    "roadmap",
    "strategy",
    "technical",
    "integration",
    "project",
    "operations",
    "business",
    # Hebrew
    "מוצר",
    "ניהול",
    "מנהל",
    "מנהלת",
    "נתונים",
    "דאטה",
    "אבטחה",
    "סייבר",
    "ענן",
    "ממשקים",
    "תהליכים",
    "טכנולוגי",
    "עסקי",
    "אפיון",
    "פיתוח",
    "לקוחות",
    "מערכות",
    "אוטומציה",
}


def configure_tesseract_for_windows():
    """
    Try to find Tesseract OCR in common Windows installation folders.
    """
    common_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]
    for path in common_paths:
        if Path(path).exists():
            pytesseract.pytesseract.tesseract_cmd = path
            return


def normalize_text_for_matching(text):
    """
    Lowercase and strip for keyword matching.
    """
    return text.lower().strip()


def is_noise_line(line):
    """
    Return True for lines that are definitely website/UI noise.
    Only applied outside relevant sections to prevent noise from opening sections.
    Long lines (> 80 chars) are assumed to be real content.
    """
    normalized = normalize_text_for_matching(line)

    if not normalized:
        return True

    if len(normalized) < 3:
        return True

    if normalized in EXACT_NOISE_LINES:
        return True

    # Match-score percentage widgets (e.g. "60%", "73 %")
    if re.match(r'^\d+\s*%', normalized):
        return True

    # Long lines are almost certainly real content, not button labels
    if len(normalized) > 80:
        return False

    for keyword in NOISE_KEYWORDS:
        if keyword in normalized:
            return True

    return False


def is_relevant_heading(line):
    """
    Return True if the line looks like a section heading that introduces
    job requirements, responsibilities, or qualifications.
    """
    normalized = normalize_text_for_matching(line)
    for keyword in RELEVANT_SECTION_KEYWORDS:
        if keyword in normalized:
            return True
    return False


def is_stop_heading(line):
    """
    Return True if the line looks like a section heading that introduces
    unrelated content (similar jobs, apply, about us, etc.).
    Long lines (> 80 chars) are content bullets, never section headings.
    """
    normalized = normalize_text_for_matching(line)

    if len(normalized) > 80:
        return False

    for keyword in STOP_SECTION_KEYWORDS:
        if keyword in normalized:
            return True

    return False


def score_job_line(line):
    """
    Relevance score for a line. Used only in the fallback path when no
    clear section headings are found.
    """
    normalized = normalize_text_for_matching(line)
    score = 0

    for keyword in RELEVANT_SECTION_KEYWORDS:
        if keyword in normalized:
            score += 3

    for keyword in IMPORTANT_JOB_WORDS:
        if keyword in normalized:
            score += 2

    if line.strip().startswith(("-", "•", "*", "#")):
        score += 1

    word_count = len(normalized.split())
    if 5 <= word_count <= 35:
        score += 1

    if is_noise_line(line):
        score -= 5

    return score


def remove_duplicate_lines(lines):
    """
    Remove duplicate lines, preserving original order.
    Accepts a list of strings; returns a newline-joined string.
    """
    unique_lines = []
    seen = set()

    for line in lines:
        normalized = normalize_text_for_matching(line)
        if normalized in seen:
            continue
        seen.add(normalized)
        unique_lines.append(line)

    return "\n".join(unique_lines)


def extract_text_blocks_from_html(html):
    """
    Extract visible text blocks from HTML.
    Removes navigation, footers, sidebars, and other non-content tags.
    """
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup([
        "script", "style", "noscript", "nav", "footer",
        "header", "form", "button", "svg", "aside",
    ]):
        tag.decompose()

    text_blocks = []

    title = soup.find("title")
    if title and title.get_text(strip=True):
        text_blocks.append(title.get_text(" ", strip=True))

    for tag in soup.find_all(["h1", "h2", "h3", "h4", "p", "li"]):
        text = tag.get_text(" ", strip=True)
        if not text:
            continue
        if len(text) > 800:
            continue
        text_blocks.append(text)

    return text_blocks


def truncate_at_first_noise_section(text):
    """
    Post-processing cut: scan the extracted requirements text line by line and
    stop at the first line that signals the start of a helper/FAQ/similar-jobs
    block.  Everything from that line onward is discarded.

    This handles AI-helper platforms (e.g. Jobify) and FAQ sections that appear
    AFTER real requirements on some job boards and are not caught by the
    section-heading filter during extraction.
    """
    kept = []
    for line in text.splitlines():
        normalized = normalize_text_for_matching(line)
        hit = any(phrase in normalized for phrase in CUTOFF_PHRASES)
        if hit:
            break
        kept.append(line)
    return "\n".join(kept)


def extract_relevant_job_text(text_blocks):
    """
    Extract only the relevant job requirements sections from text blocks or lines.

    Loop ordering (critical):
      1. Stop-heading check  — exits the current section immediately
      2. Inside-section keep — all content lines are preserved; light filter for
                               known UI noise widgets (percentages, exact noise labels)
      3. Noise filter        — applied only outside sections; blocks noise lines
                               from accidentally opening a new section
      4. Relevant-heading    — opens a new section when outside one

    This ordering ensures:
    - All bullet content inside genuine sections is preserved.
    - Noise button labels that contain requirement keywords (e.g. a line containing
      "ניסיון") cannot open a false section.
    - Multiple consecutive relevant sections are all captured.
    """
    # Build cleaned lines — no noise pre-filter here.
    # Pre-filtering would silently drop valid section headers.
    cleaned_lines = []
    for block in text_blocks:
        cleaned_block = clean_extracted_text(block)
        if not cleaned_block:
            continue
        for line in cleaned_block.splitlines():
            line = clean_extracted_text(line)
            if not line:
                continue
            cleaned_lines.append(line)

    selected_lines = []
    inside_relevant_section = False
    lines_after_heading = 0

    for line in cleaned_lines:
        # 1. Stop heading — always exit, discard this line
        if is_stop_heading(line):
            inside_relevant_section = False
            lines_after_heading = 0
            continue

        # 2. Inside a section — keep lines; drop known UI score/noise widgets only
        if inside_relevant_section:
            _n = normalize_text_for_matching(line)
            if _n not in EXACT_NOISE_LINES and not re.match(r'^\d+\s*%', _n):
                selected_lines.append(line)
                lines_after_heading += 1
                if lines_after_heading >= 60:
                    inside_relevant_section = False
                    lines_after_heading = 0
            continue

        # 3. Outside a section — noise filter prevents noise from opening sections
        if is_noise_line(line):
            continue

        # 4. Relevant heading — enter a new section
        if is_relevant_heading(line):
            inside_relevant_section = True
            lines_after_heading = 0
            selected_lines.append(line)
            continue

    if selected_lines:
        return remove_duplicate_lines(selected_lines)

    # Fallback: if no clear headings were found, select high-scoring lines
    scored_lines = []
    for line in cleaned_lines:
        if not is_noise_line(line) and score_job_line(line) >= 3:
            scored_lines.append(line)

    if scored_lines:
        return remove_duplicate_lines(scored_lines)

    # Last fallback: return a limited amount of cleaned text
    return remove_duplicate_lines(cleaned_lines[:40])


def _run_ocr(image_path):
    """
    Run Tesseract OCR on an image file.
    Returns (cleaned_text, language_used).
    Tries heb+eng first, falls back to eng only.
    """
    configure_tesseract_for_windows()

    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    try:
        image = Image.open(path)

        try:
            raw_text = pytesseract.image_to_string(image, lang="heb+eng")
            lang_used = "heb+eng"
        except pytesseract.TesseractError:
            raw_text = pytesseract.image_to_string(image, lang="eng")
            lang_used = "eng"

    except TesseractNotFoundError as exc:
        raise RuntimeError(
            "Tesseract OCR is not installed or Python cannot find it. "
            "Install Tesseract OCR on Windows, then run the project again."
        ) from exc

    cleaned_text = clean_extracted_text(raw_text)

    if len(cleaned_text) < 50:
        raise ValueError(
            "Very little text was extracted from the image. "
            "Try uploading a clearer screenshot with higher resolution."
        )

    return cleaned_text, lang_used


def read_job_from_image(image_path):
    """
    Read job posting text from an image or screenshot using OCR.
    Returns raw OCR text. Canonical filtering is done by extract_canonical_job_requirements.
    """
    text, _ = _run_ocr(image_path)
    return text


def read_job_from_url(url):
    """
    Fetch job posting text from a URL.
    Returns raw extracted text. Canonical filtering is done by extract_canonical_job_requirements.
    """
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        )
    }

    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()

    if response.encoding:
        response.encoding = response.apparent_encoding or response.encoding
    else:
        response.encoding = "utf-8"

    text_blocks = extract_text_blocks_from_html(response.text)

    raw_parts = []
    for block in text_blocks:
        cleaned = clean_extracted_text(block)
        if cleaned:
            raw_parts.append(cleaned)

    raw_text = "\n".join(raw_parts)

    if len(raw_text) < 100:
        raise ValueError(
            "Very little text was extracted from the URL. "
            "The site may block automated reading, require login, "
            "or load the job requirements dynamically."
        )

    return raw_text


def read_job_from_document(file_path):
    """
    Read a job posting from a PDF or DOCX document.
    Returns raw document text.
    """
    return read_resume(file_path)


def _get_raw_job_text(job_source):
    """
    Dispatch to the appropriate reader and return raw text without filtering.
    """
    if job_source.startswith("http://") or job_source.startswith("https://"):
        return read_job_from_url(job_source)

    path = Path(job_source)

    if not path.exists():
        raise FileNotFoundError(f"Job source not found: {job_source}")

    ext = path.suffix.lower()

    if ext in SUPPORTED_IMAGE_EXTENSIONS:
        return read_job_from_image(str(path))

    if ext in SUPPORTED_DOCUMENT_EXTENSIONS:
        return read_job_from_document(str(path))

    raise ValueError(
        "Unsupported job source. Please provide a URL, image, PDF, or DOCX file."
    )


def extract_canonical_job_requirements(raw_text):
    """
    Apply section-based extraction to raw job text.
    Returns the canonical requirements text used for scoring and display.
    This is the single extraction point for all source types.
    """
    if not raw_text:
        return ""
    lines = raw_text.splitlines()
    result = extract_relevant_job_text(lines)
    result = truncate_at_first_noise_section(result)
    return clean_extracted_text(result)


def read_job_post(job_source):
    """
    Read job posting from URL, image, PDF, or DOCX.
    Returns canonical requirements text as a string.
    Backward compatible entry point.
    """
    raw_text = _get_raw_job_text(job_source)
    return extract_canonical_job_requirements(raw_text)


def read_job_post_details(job_source):
    """
    Read job posting from URL, image, PDF, or DOCX.
    Returns a dict with raw text, canonical requirements, metadata, and warnings.
    """
    ocr_language = None

    if job_source.startswith("http://") or job_source.startswith("https://"):
        source_type = "url"
        raw_text = read_job_from_url(job_source)
    else:
        path = Path(job_source)

        if not path.exists():
            raise FileNotFoundError(f"Job source not found: {job_source}")

        ext = path.suffix.lower()

        if ext in SUPPORTED_IMAGE_EXTENSIONS:
            source_type = "image"
            raw_text, ocr_language = _run_ocr(str(path))
        elif ext in SUPPORTED_DOCUMENT_EXTENSIONS:
            source_type = "document"
            raw_text = read_job_from_document(str(path))
        else:
            raise ValueError(
                "Unsupported job source. Please provide a URL, image, PDF, or DOCX file."
            )

    canonical_requirements = extract_canonical_job_requirements(raw_text)

    warnings = []
    if len(raw_text) < 300:
        warnings.append(
            "Very little text was extracted from this source. "
            "The analysis may be inaccurate."
        )
    if len(canonical_requirements) < 200:
        warnings.append(
            "Very few requirement lines were found. "
            "The fit score may not be reliable."
        )

    return {
        "source_type": source_type,
        "raw_text": raw_text,
        "canonical_requirements": canonical_requirements,
        "raw_text_length": len(raw_text),
        "canonical_requirements_length": len(canonical_requirements),
        "warnings": warnings,
        "ocr_language": ocr_language,
    }
