import re
from collections import Counter


ENGLISH_STOPWORDS = {
    "the", "and", "or", "a", "an", "to", "of", "in", "for", "with",
    "on", "at", "by", "from", "is", "are", "be", "as", "this", "that",
    "you", "your", "we", "our", "it", "job", "role", "company"
}

HEBREW_STOPWORDS = {
    "של", "על", "עם", "את", "או", "זה", "זו", "הוא", "היא", "הם",
    "הן", "יש", "אין", "לא", "כן", "אל", "כל", "גם", "כמו",
    "עבור", "לצורך", "במסגרת", "דרוש", "דרושה", "דרושים", "דרושות",
    "משרה", "תפקיד", "חברה", "אנו", "אנחנו"
}

STOPWORDS = ENGLISH_STOPWORDS.union(HEBREW_STOPWORDS)


def extract_words(text):
    """
    Extract English and Hebrew words from text.
    """
    if not text:
        return []

    text = text.lower()

    words = re.findall(r"[a-zA-Z][a-zA-Z0-9+#.-]*|[\u0590-\u05FF]{2,}", text)

    clean_words = []

    for word in words:
        word = word.strip()

        if not word:
            continue

        if word in STOPWORDS:
            continue

        if len(word) < 2:
            continue

        clean_words.append(word)

    return clean_words


def extract_keywords(text, max_keywords=40):
    """
    Extract the most common meaningful words from text.
    """
    words = extract_words(text)
    counter = Counter(words)

    most_common = counter.most_common(max_keywords)

    return [word for word, count in most_common]


def analyze_match(resume_text, job_text):
    """
    Analyze a basic match between resume text and job posting text.

    This is a simple keyword-based analysis.
    Later, we will replace or improve it with AI.
    """
    job_keywords = extract_keywords(job_text, max_keywords=40)
    resume_words = set(extract_words(resume_text))

    matched_keywords = []
    missing_keywords = []

    for keyword in job_keywords:
        if keyword in resume_words:
            matched_keywords.append(keyword)
        else:
            missing_keywords.append(keyword)

    if not job_keywords:
        fit_score = 0
    else:
        fit_score = round((len(matched_keywords) / len(job_keywords)) * 100)

    return {
        "fit_score": fit_score,
        "job_keywords": job_keywords,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "resume_word_count": len(resume_words),
        "job_keyword_count": len(job_keywords),
    }