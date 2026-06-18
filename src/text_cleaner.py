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


def looks_like_spaced_characters(line):
    """
    Detect lines where most of the content is separated character by character.

    Example:
    P R O F E S S I O N A L
    a d i 1 5 0 4 4 @ g m a i l . c o m
    """
    tokens = line.split()

    if len(tokens) < 4:
        return False

    single_character_tokens = [token for token in tokens if len(token) == 1]
    ratio = len(single_character_tokens) / len(tokens)

    return ratio >= 0.7


def fix_spaced_characters(line):
    """
    Join character-by-character lines into normal text.
    """
    if looks_like_spaced_characters(line):
        return "".join(line.split())

    return line


def clean_extracted_text(text):
    """
    Clean text extracted from PDF or Word files.

    This function does basic cleaning:
    - fixes character-by-character lines
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
        cleaned_line = fix_spaced_characters(cleaned_line)

        if cleaned_line:
            cleaned_lines.append(cleaned_line)

    cleaned_text = "\n".join(cleaned_lines)
    cleaned_text = remove_too_many_blank_lines(cleaned_text)

    return cleaned_text.strip()