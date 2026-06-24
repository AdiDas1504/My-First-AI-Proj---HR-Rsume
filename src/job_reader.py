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
    "what you’ll do",
    "what you need",
    "what you'll need",
    "what you’ll need",
    "must have",
    "nice to have",
    "preferred",
    "skills",
    "experience",
    "about the role",
    "role overview",

    # Hebrew
    "דרישות",
    "דרישות התפקיד",
    "דרישת",
    "כישורים",
    "מיומנויות",
    "תחומי אחריות",
    "אחריות",
    "מה תעשו",
    "מה תעשה",
    "מה תעשי",
    "מה נדרש",
    "חובה",
    "יתרון",
    "ניסיון נדרש",
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
    "apply",
    "apply now",
    "submit application",
    "send resume",
    "share",
    "share this job",
    "similar jobs",
    "other jobs",
    "careers",
    "contact us",
    "life at",
    "our values",

    # Hebrew
    "הטבות",
    "למה להצטרף",
    "מי אנחנו",
    "אודות החברה",
    "שוויון הזדמנויות",
    "פרטיות",
    "עוגיות",
    "הגש מועמדות",
    "להגשת מועמדות",
    "הגשת מועמדות",
    "שליחת קורות חיים",
    "משרות נוספות",
    "משרות דומות",
    "צור קשר",
    "שתף",
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
    "search",
    "home",
    "careers",
    "jobs",
    "apply",
    "apply now",
    "upload resume",
    "share",
    "facebook",
    "linkedin",
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
    "חיפוש",
    "עמוד הבית",
    "קריירה",
    "משרות",
    "הגש מועמדות",
    "העלאת קורות חיים",
    "שתף",
    "חזרה למשרות",
    "כל הזכויות שמורות",
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
    Normalize text for keyword checks.
    """
    return text.lower().strip()


def is_noise_line(line):
    """
    Detect lines that are probably website noise and not part of the job posting.
    """
    normalized = normalize_text_for_matching(line)

    if not normalized:
        return True

    if len(normalized) < 3:
        return True

    for keyword in NOISE_KEYWORDS:
        if keyword in normalized:
            return True

    return False


def is_relevant_heading(line):
    """
    Detect headings that probably start a relevant job section.
    """
    normalized = normalize_text_for_matching(line)

    for keyword in RELEVANT_SECTION_KEYWORDS:
        if keyword in normalized:
            return True

    return False


def is_stop_heading(line):
    """
    Detect headings that probably start an irrelevant section after the job details.
    """
    normalized = normalize_text_for_matching(line)

    for keyword in STOP_SECTION_KEYWORDS:
        if keyword in normalized:
            return True

    return False


def score_job_line(line):
    """
    Give a relevance score to a line from a job posting page or OCR text.
    Higher score means the line is more likely to contain real job requirements.
    """
    normalized = normalize_text_for_matching(line)
    score = 0

    for keyword in RELEVANT_SECTION_KEYWORDS:
        if keyword in normalized:
            score += 3

    for keyword in IMPORTANT_JOB_WORDS:
        if keyword in normalized:
            score += 2

    if line.strip().startswith(("-", "•", "*")):
        score += 1

    word_count = len(normalized.split())
    if 5 <= word_count <= 35:
        score += 1

    if is_noise_line(line):
        score -= 5

    return score


def remove_duplicate_lines(lines):
    """
    Remove duplicate lines while keeping the original order.
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
    Extract visible text blocks from a webpage.
    """
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup([
        "script",
        "style",
        "noscript",
        "nav",
        "footer",
        "header",
        "form",
        "button",
        "svg",
    ]):
        tag.decompose()

    text_blocks = []

    title = soup.find("title")
    if title and title.get_text(strip=True):
        text_blocks.append(title.get_text(" ", strip=True))

    relevant_tags = soup.find_all(["h1", "h2", "h3", "h4", "p", "li"])

    for tag in relevant_tags:
        text = tag.get_text(" ", strip=True)

        if not text:
            continue

        if len(text) > 800:
            continue

        text_blocks.append(text)

    return text_blocks


def extract_relevant_job_text(text_blocks):
    """
    Extract only the relevant job description / requirements sections.

    This function is designed to work with:
    - Web pages from URLs
    - Full-page screenshots processed by OCR

    It tries to keep sections such as:
    - Requirements
    - Qualifications
    - Responsibilities
    - Must have
    - Nice to have
    - דרישות
    - חובה
    - יתרון
    - תחומי אחריות
    """
    cleaned_lines = []

    for block in text_blocks:
        cleaned_block = clean_extracted_text(block)

        if not cleaned_block:
            continue

        for line in cleaned_block.splitlines():
            line = clean_extracted_text(line)

            if not line:
                continue

            if is_noise_line(line):
                continue

            cleaned_lines.append(line)

    selected_lines = []
    inside_relevant_section = False
    lines_after_heading = 0

    for line in cleaned_lines:
        if is_stop_heading(line):
            if inside_relevant_section:
                inside_relevant_section = False
                lines_after_heading = 0
            continue

        if is_relevant_heading(line):
            inside_relevant_section = True
            lines_after_heading = 0
            selected_lines.append(line)
            continue

        if inside_relevant_section:
            selected_lines.append(line)
            lines_after_heading += 1

            # Safety limit: avoid taking the entire page after one heading.
            if lines_after_heading >= 25:
                inside_relevant_section = False
                lines_after_heading = 0

            continue

    # If we found clear requirement sections, use them.
    if selected_lines:
        return remove_duplicate_lines(selected_lines)

    # Fallback: if no clear headings were found, select high-scoring lines.
    scored_lines = []

    for line in cleaned_lines:
        score = score_job_line(line)

        if score >= 3:
            scored_lines.append(line)

    if scored_lines:
        return remove_duplicate_lines(scored_lines)

    # Last fallback: return a limited amount of cleaned text.
    return remove_duplicate_lines(cleaned_lines[:40])


def read_job_from_url(url):
    """
    Read a job posting from a URL and return only the relevant job requirements text.
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
    relevant_job_text = extract_relevant_job_text(text_blocks)
    cleaned_text = clean_extracted_text(relevant_job_text)

    if len(cleaned_text) < 100:
        raise ValueError(
            "Very little relevant job text was extracted from the URL. "
            "The site may block automated reading, require login, or load the job requirements dynamically."
        )

    return cleaned_text


def read_job_from_image(image_path):
    """
    Read job posting text from an image or screenshot using OCR.
    """
    configure_tesseract_for_windows()

    path = Path(image_path)

    if not path.exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    try:
        image = Image.open(path)

        try:
            raw_text = pytesseract.image_to_string(image, lang="heb+eng")
        except pytesseract.TesseractError:
            raw_text = pytesseract.image_to_string(image, lang="eng")

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

    lines = cleaned_text.splitlines()
    relevant_job_text = extract_relevant_job_text(lines)
    relevant_job_text = clean_extracted_text(relevant_job_text)

    # For screenshots, if filtering is too strict, return the OCR text.
    if len(relevant_job_text) < 100:
        return cleaned_text

    return relevant_job_text


def read_job_from_document(file_path):
    """
    Read a job posting from a PDF or DOCX document.
    """
    document_text = read_resume(file_path)
    lines = document_text.splitlines()
    return extract_relevant_job_text(lines)


def read_job_post(job_source):
    """
    Read job posting from URL, image, PDF, or DOCX.
    """
    if job_source.startswith("http://") or job_source.startswith("https://"):
        return read_job_from_url(job_source)

    path = Path(job_source)

    if not path.exists():
        raise FileNotFoundError(f"Job source not found: {job_source}")

    file_extension = path.suffix.lower()

    if file_extension in SUPPORTED_IMAGE_EXTENSIONS:
        return read_job_from_image(str(path))

    if file_extension in SUPPORTED_DOCUMENT_EXTENSIONS:
        return read_job_from_document(str(path))

    raise ValueError(
        "Unsupported job source. Please provide a URL, image, PDF, or DOCX file."
    )