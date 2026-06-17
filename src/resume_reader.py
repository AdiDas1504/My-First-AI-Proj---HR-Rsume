from pathlib import Path

from docx import Document
from pypdf import PdfReader


def read_pdf(file_path):
    """
    Read text from a PDF resume file.
    """
    reader = PdfReader(file_path)
    text_parts = []

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text_parts.append(page_text)

    return "\n".join(text_parts)


def read_docx(file_path):
    """
    Read text from a Word resume file.
    """
    document = Document(file_path)
    text_parts = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text)

    return "\n".join(text_parts)


def read_resume(file_path):
    """
    Read a resume file and return its text.

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