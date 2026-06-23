import re


RISKY_CLAIM_PATTERNS = [
    r"\b\d+%",
    r"\b\d+\s+percent\b",
    r"\bimproved\b",
    r"\bincreased\b",
    r"\breduced\b",
    r"\bled\b",
    r"\bmanaged\b",
    r"\bowned\b",
    r"\bexpert\b",
    r"\badvanced\b",
    r"\bcertified\b",
    r"\byears of experience\b",
]


def find_risky_claims(ai_output_text):
    """
    Find potentially risky claims in AI output.

    This is not a perfect hallucination detector.
    It is a first safety layer that helps the user review the output.
    """
    findings = []

    for pattern in RISKY_CLAIM_PATTERNS:
        matches = re.findall(pattern, ai_output_text, flags=re.IGNORECASE)

        for match in matches:
            findings.append(match)

    return sorted(set(findings))


def validate_ai_output(ai_output_text):
    """
    Validate AI output and return a safety review result.
    """
    risky_claims = find_risky_claims(ai_output_text)

    return {
        "has_warnings": bool(risky_claims),
        "risky_claims": risky_claims,
        "review_message": build_review_message(risky_claims),
    }


def build_review_message(risky_claims):
    """
    Build a user-facing review message.
    """
    if not risky_claims:
        return (
            "No obvious risky claims were detected automatically. "
            "The user must still review the full AI output before use."
        )

    claims_text = ", ".join(risky_claims)

    return (
        "Potentially risky claims were detected and should be reviewed manually: "
        f"{claims_text}. "
        "Make sure every claim is supported by the original resume."
    )