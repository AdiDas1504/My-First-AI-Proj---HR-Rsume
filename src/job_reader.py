import requests
from bs4 import BeautifulSoup

from src.text_cleaner import clean_extracted_text


def read_job_from_url(url):
    """
    Read a job posting from a URL and return cleaned text.
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
    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    text_parts = []

    title = soup.find("title")
    if title and title.get_text(strip=True):
        text_parts.append(title.get_text(strip=True))

    relevant_tags = soup.find_all(["h1", "h2", "h3", "p", "li"])

    for tag in relevant_tags:
        text = tag.get_text(" ", strip=True)
        if text:
            text_parts.append(text)

    raw_text = "\n".join(text_parts)
    cleaned_text = clean_extracted_text(raw_text)

    if len(cleaned_text) < 100:
        raise ValueError(
            "Very little text was extracted from the URL. "
            "The site may block automated reading or require login."
        )

    return cleaned_text


def read_job_post(source):
    """
    Read a job posting from a source.

    Currently supported:
    - URL
    """
    source = source.strip()

    if source.startswith("http://") or source.startswith("https://"):
        return read_job_from_url(source)

    raise ValueError("Unsupported job source. Please provide a job posting URL.")