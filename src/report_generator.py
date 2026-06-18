from src.display_utils import prepare_for_terminal_display


def classify_fit_score(fit_score):
    """
    Classify the fit score into a human-readable level.
    """
    if fit_score >= 75:
        return "High match"
    if fit_score >= 50:
        return "Medium match"
    if fit_score >= 30:
        return "Low-medium match"
    return "Low match"


def generate_recommendation(fit_score):
    """
    Generate a general recommendation based on the fit score.
    """
    if fit_score >= 75:
        return (
            "This looks like a strong match. The candidate should tailor the resume "
            "to emphasize the matched requirements and apply with confidence."
        )

    if fit_score >= 50:
        return (
            "This looks like a reasonable match. The candidate should improve the resume "
            "by highlighting relevant experience and adding missing keywords only if they are true."
        )

    if fit_score >= 30:
        return (
            "This is a partial match. The candidate may still apply, but the resume should be "
            "carefully adjusted to better reflect relevant experience."
        )

    return (
        "This looks like a weak match based on the current resume and job requirements. "
        "The candidate should review whether they truly meet the role requirements before applying."
    )


def generate_resume_improvement_tips(matched_keywords, missing_keywords):
    """
    Generate practical resume improvement tips.
    """
    tips = []

    if matched_keywords:
        tips.append(
            "Emphasize the experience related to the matched keywords in the top sections of the resume."
        )

    if missing_keywords:
        tips.append(
            "Review the missing keywords. Add them to the resume only if they reflect real skills or experience."
        )

    tips.append(
        "Rewrite bullet points to show impact, responsibility, tools used, and business value."
    )

    tips.append(
        "Keep the resume honest. Do not add skills, tools, or experience that the candidate does not actually have."
    )

    return tips


def generate_fit_report(analysis):
    """
    Generate a structured report from the match analysis.
    """
    fit_score = analysis["fit_score"]
    matched_keywords = analysis["matched_keywords"]
    missing_keywords = analysis["missing_keywords"]

    fit_level = classify_fit_score(fit_score)
    recommendation = generate_recommendation(fit_score)
    improvement_tips = generate_resume_improvement_tips(
        matched_keywords,
        missing_keywords
    )

    return {
        "fit_score": fit_score,
        "fit_level": fit_level,
        "recommendation": recommendation,
        "matched_keywords": matched_keywords,
        "missing_keywords": missing_keywords,
        "improvement_tips": improvement_tips,
    }


def print_fit_report(report):
    """
    Print the fit report in the terminal.
    """
    print("Candidate Fit Report")
    print("=" * 50)

    print(f"Fit score: {report['fit_score']}%")
    print(f"Fit level: {report['fit_level']}")
    print()

    print("Recommendation:")
    print("-" * 50)
    print(prepare_for_terminal_display(report["recommendation"]))
    print()

    print("Matched keywords:")
    print("-" * 50)
    if report["matched_keywords"]:
        for keyword in report["matched_keywords"]:
            print(f"- {prepare_for_terminal_display(keyword)}")
    else:
        print("No matched keywords found.")
    print()

    print("Missing or weak keywords:")
    print("-" * 50)
    if report["missing_keywords"]:
        for keyword in report["missing_keywords"]:
            print(f"- {prepare_for_terminal_display(keyword)}")
    else:
        print("No missing keywords found.")
    print()

    print("Resume improvement tips:")
    print("-" * 50)
    for tip in report["improvement_tips"]:
        print(f"- {prepare_for_terminal_display(tip)}")

    print("=" * 50)