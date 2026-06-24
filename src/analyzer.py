import re
from collections import Counter


ENGLISH_STOPWORDS = {
    "the", "and", "or", "a", "an", "to", "of", "in", "for", "with",
    "on", "at", "by", "from", "is", "are", "be", "as", "this", "that",
    "you", "your", "we", "our", "it", "its", "they", "their", "them",
    "what", "how", "why", "who", "when", "where", "which",
    "new", "all", "more", "most", "some", "any", "each", "other",
    "will", "can", "may", "must", "should", "would", "could",
    "join", "fast", "across", "about", "into", "out", "up", "down",
    "job", "role", "company", "team", "work", "working", "looking",
    "required", "requirements", "responsibilities", "experience",
    "years", "year", "strong", "excellent", "good", "great",
    "ability", "skills", "skill", "knowledge", "background",
    "candidate", "candidates", "position", "description"
}

HEBREW_STOPWORDS = {
    "של", "על", "עם", "את", "או", "זה", "זו", "הוא", "היא", "הם",
    "הן", "יש", "אין", "לא", "כן", "אל", "כל", "גם", "כמו", "אם",
    "כי", "אך", "אבל", "אשר", "כאשר", "ללא", "עבור", "לצורך",
    "במסגרת", "דרוש", "דרושה", "דרושים", "דרושות", "משרה",
    "תפקיד", "חברה", "אנו", "אנחנו", "מחפש", "מחפשים", "חובה",
    "יתרון", "ניסיון", "יכולת", "יכולות", "עבודה", "ידע", "רקע",
    "שנה", "שנים", "תחום", "צוות", "בעל", "בעלי", "בעלת", "כולל",
    "מול", "תוך", "וכן", "מאוד", "לפחות", "נדרש", "נדרשת",
    "המשרה", "התפקיד", "דרישות", "אחריות"
}

STOPWORDS = ENGLISH_STOPWORDS.union(HEBREW_STOPWORDS)


SEMANTIC_GROUPS = [
    {"manager", "management", "lead", "leading", "מנהל", "מנהלת", "ניהול", "הובלה", "להוביל"},
    {"product", "products", "מוצר", "מוצרים"},
    {"project", "projects", "פרויקט", "פרויקטים"},
    {"security", "cyber", "cybersecurity", "אבטחה", "סייבר"},
    {"ai", "artificial", "intelligence", "genai", "llm", "בינה", "מלאכותית"},
    {"data", "analytics", "analysis", "דאטה", "נתונים", "ניתוח"},
    {"cloud", "ענן"},
    {"api", "apis", "integration", "integrations", "ממשקים", "אינטגרציה"},
    {"stakeholders", "interfaces", "managers", "לקוחות", "מנהלים", "ממשקים"},
    {"process", "processes", "operations", "תהליך", "תהליכים", "תפעול"},
    {"technical", "technology", "technological", "טכנולוגי", "טכנולוגיה"},
    {"business", "עסקי", "ביזנס"},
    {"strategy", "strategic", "אסטרטגיה", "אסטרטגי"},
    {"roadmap", "planning", "plan", "תכנון", "מפת"},
    {"automation", "אוטומציה"},
    {"recruitment", "recruiting", "גיוס"},
    {"onboarding", "קליטה"},
    {"employees", "employee", "עובדים", "עובד"},
    {"hr", "human", "resources", "משאבי", "אנוש"},
    {"python", "sql", "excel", "powerbi", "tableau"},
]


IMPORTANT_SKILLS = set()

for group in SEMANTIC_GROUPS:
    IMPORTANT_SKILLS.update(group)


def extract_words(text):
    """
    Extract English and Hebrew words from text.
    """
    if not text:
        return []

    text = text.lower()

    words = re.findall(
        r"[a-zA-Z][a-zA-Z0-9+#.-]*|[\u0590-\u05FF]{2,}",
        text
    )

    clean_words = []

    for word in words:
        word = word.strip(".,:;!?()[]{}\"'")

        if not word:
            continue

        if word in STOPWORDS:
            continue

        if len(word) < 3 and word not in {"ai", "hr"}:
            continue

        clean_words.append(word)

    return clean_words


def extract_keywords(text, max_keywords=40):
    """
    Extract meaningful keywords from job text.

    Priority:
    1. Known important skills
    2. Frequent meaningful words
    """
    words = extract_words(text)
    counter = Counter(words)

    priority_keywords = []

    for word in words:
        if word in IMPORTANT_SKILLS and word not in priority_keywords:
            priority_keywords.append(word)

    frequent_keywords = []

    for word, count in counter.most_common(80):
        if word not in priority_keywords and word not in frequent_keywords:
            frequent_keywords.append(word)

    combined_keywords = priority_keywords + frequent_keywords

    return combined_keywords[:max_keywords]


def get_semantic_group(keyword):
    """
    Return the semantic group of a keyword if it belongs to one.
    """
    for group in SEMANTIC_GROUPS:
        if keyword in group:
            return group

    return {keyword}


def word_exists_in_resume(term, resume_text, resume_words):
    """
    Check if a term exists in the resume.
    """
    term = term.lower()

    if term in resume_words:
        return True

    # Avoid false positive for very short terms like AI.
    if len(term) <= 2:
        pattern = rf"\b{re.escape(term)}\b"
        return bool(re.search(pattern, resume_text.lower()))

    if term in resume_text.lower():
        return True

    for resume_word in resume_words:
        if len(term) >= 5 and term in resume_word:
            return True

        if len(resume_word) >= 5 and resume_word in term:
            return True

    return False


def keyword_matches_resume(keyword, resume_text, resume_words):
    """
    Check if a job keyword or a related semantic term appears in the resume.
    """
    related_terms = get_semantic_group(keyword)

    for term in related_terms:
        if word_exists_in_resume(term, resume_text, resume_words):
            return True

    return False


def analyze_match(resume_text, job_text):
    """
    Analyze a basic match between resume text and job posting text.

    This version supports:
    - exact keyword matching
    - partial matching
    - Hebrew-English semantic groups
    """
    job_keywords = extract_keywords(job_text, max_keywords=40)
    resume_words = set(extract_words(resume_text))

    matched_keywords = []
    missing_keywords = []

    for keyword in job_keywords:
        if keyword_matches_resume(keyword, resume_text, resume_words):
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