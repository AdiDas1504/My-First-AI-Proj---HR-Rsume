import re

from bidi.algorithm import get_display


HEBREW_PATTERN = re.compile(r"[\u0590-\u05FF]")


def contains_hebrew(text):
    """
    Check if the text contains Hebrew characters.
    """
    return bool(HEBREW_PATTERN.search(text))


def prepare_for_terminal_display(text):
    """
    Prepare text for better display in the terminal.

    Important:
    This function is only for printing text to the terminal.
    It should not be used before sending text to an AI model.
    """
    if not text:
        return ""

    if not contains_hebrew(text):
        return text

    lines = text.splitlines()
    display_lines = []

    for line in lines:
        display_lines.append(get_display(line))

    return "\n".join(display_lines)


def print_preview(title, text, max_chars=1000):
    """
    Print a clean preview of text in the terminal.
    Supports English and Hebrew display.
    """
    print(f"{title}:")
    print("-" * 50)

    preview = text[:max_chars]
    print(prepare_for_terminal_display(preview))

    print("-" * 50)