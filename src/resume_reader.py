from pathlib import Path

import fitz  # PyMuPDF
from docx import Document
from pypdf import PdfReader

from src.text_cleaner import clean_extracted_text


def read_pdf_with_pymupdf(file_path):
    """
    Read text from a PDF resume using PyMuPDF.
    This often works better than pypdf for designed resumes.
    """
    document = fitz.open(file_path)
    text_parts = []

    for page in document:
        page_text = page.get_text("text")

        if page_text:
            text_parts.append(page_text)

    raw_text = "\n".join(text_parts)
    return clean_extracted_text(raw_text)


def read_pdf_with_pypdf(file_path):
    """
    Fallback PDF reader using pypdf.
    """
    reader = PdfReader(file_path)
    text_parts = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text_parts.append(page_text)

    raw_text = "\n".join(text_parts)
    return clean_extracted_text(raw_text)


def read_pdf(file_path):
    """
    Read text from a PDF resume file.
    First try PyMuPDF, then fallback to pypdf.
    """
    try:
        text = read_pdf_with_pymupdf(file_path)

        if len(text) >= 200:
            return text

    except Exception:
        pass

    return read_pdf_with_pypdf(file_path)


def read_docx(file_path):
    """
    Read text from a Word resume file.
    """
    document = Document(file_path)
    text_parts = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text)

    raw_text = "\n".join(text_parts)
    return clean_extracted_text(raw_text)


def read_resume(file_path):
    """
    Read a resume file and return its cleaned text.

    Supported formats:
    - PDF
    - DOCX
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    file_extension = path.suffix.lower()

    if file_extension == ".pdf":
        return read_pdf(str(path))

    if file_extension == ".docx":
        return read_docx(str(path))

    raise ValueError("Unsupported file type. Please use PDF or DOCX.")