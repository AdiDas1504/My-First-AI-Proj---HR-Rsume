import re


def remove_extra_spaces(text):
    """
    Replace multiple spaces with a single space.
    """
    return re.sub(r"[ \t]+", " ", text)


def remove_too_many_blank_lines(text):
    """
    Replace many blank lines with a maximum of two line breaks.
    """
    return re.sub(r"\n{3,}", "\n\n", text)


def clean_extracted_text(text):
    """
    Clean text extracted from PDF or Word files.

    This function does basic cleaning:
    - removes unnecessary spaces
    - removes too many blank lines
    - strips spaces from each line
    """
    if not text:
        return ""

    lines = text.splitlines()
    cleaned_lines = []

    for line in lines:
        cleaned_line = line.strip()
        cleaned_line = remove_extra_spaces(cleaned_line)

        if cleaned_line:
            cleaned_lines.append(cleaned_line)

    cleaned_text = "\n".join(cleaned_lines)
    cleaned_text = remove_too_many_blank_lines(cleaned_text)

    return cleaned_text.strip()