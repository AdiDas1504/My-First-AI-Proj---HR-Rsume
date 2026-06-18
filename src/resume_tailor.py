from src.display_utils import prepare_for_terminal_display


def limit_keywords(keywords, max_items=10):
    """
    Limit keyword list for readable output.
    """
    return keywords[:max_items]


def generate_tailored_summary_suggestion(matched_keywords):
    """
    Generate a safe professional summary suggestion based on matched keywords.
    """
    if not matched_keywords:
        return (
            "No clear matching keywords were found yet. Before rewriting the resume summary, "
            "the candidate should verify that the resume contains relevant experience for this role."
        )

    selected_keywords = ", ".join(limit_keywords(matched_keywords, max_items=6))

    return (
        "Suggested resume summary direction:\n"
        f"Emphasize experience related to: {selected_keywords}.\n\n"
        "Example direction:\n"
        "Professional with relevant experience aligned with the role requirements, "
        "including work related to the matched areas above. Focused on delivering value, "
        "working with stakeholders, and supporting business or operational goals.\n\n"
        "Important: edit this summary manually so it reflects the candidate's real background."
    )


def generate_keywords_to_add_if_true(missing_keywords):
    """
    Suggest missing keywords that may be added only if true.
    """
    if not missing_keywords:
        return []

    suggestions = []

    for keyword in limit_keywords(missing_keywords, max_items=12):
        suggestions.append(
            f"Consider adding '{keyword}' only if the candidate truly has this skill, experience, or exposure."
        )

    return suggestions


def generate_bullet_rewrite_guidelines(matched_keywords):
    """
    Generate guidelines for rewriting resume bullets.
    """
    guidelines = [
        "Start bullet points with action verbs such as led, managed, coordinated, analyzed, improved, supported, or implemented.",
        "Add context: what was the responsibility, who were the stakeholders, and what was the business value.",
        "Add measurable impact where possible, such as number of employees, projects, processes, systems, or improvement results.",
        "Use language from the job posting only when it accurately reflects the candidate's real experience.",
    ]

    if matched_keywords:
        selected_keywords = ", ".join(limit_keywords(matched_keywords, max_items=6))
        guidelines.append(
            f"Where true, strengthen bullets connected to these matched areas: {selected_keywords}."
        )

    return guidelines


def generate_tailoring_plan(analysis):
    """
    Generate practical resume tailoring recommendations based on the analysis.
    """
    matched_keywords = analysis["matched_keywords"]
    missing_keywords = analysis["missing_keywords"]
    fit_score = analysis["fit_score"]

    summary_suggestion = generate_tailored_summary_suggestion(matched_keywords)
    missing_keyword_suggestions = generate_keywords_to_add_if_true(missing_keywords)
    bullet_guidelines = generate_bullet_rewrite_guidelines(matched_keywords)

    if fit_score >= 70:
        priority = "High priority: tailor and apply."
    elif fit_score >= 40:
        priority = "Medium priority: tailor carefully before applying."
    else:
        priority = "Low priority: review the role fit before investing major effort."

    return {
        "priority": priority,
        "summary_suggestion": summary_suggestion,
        "missing_keyword_suggestions": missing_keyword_suggestions,
        "bullet_guidelines": bullet_guidelines,
    }


def print_tailoring_plan(plan):
    """
    Print resume tailoring recommendations.
    """
    print("Resume Tailoring Plan")
    print("=" * 50)

    print("Application priority:")
    print("-" * 50)
    print(prepare_for_terminal_display(plan["priority"]))
    print()

    print("Professional summary suggestion:")
    print("-" * 50)
    print(prepare_for_terminal_display(plan["summary_suggestion"]))
    print()

    print("Missing keywords to consider only if true:")
    print("-" * 50)
    if plan["missing_keyword_suggestions"]:
        for suggestion in plan["missing_keyword_suggestions"]:
            print(f"- {prepare_for_terminal_display(suggestion)}")
    else:
        print("No missing keyword suggestions.")
    print()

    print("Bullet point rewrite guidelines:")
    print("-" * 50)
    for guideline in plan["bullet_guidelines"]:
        print(f"- {prepare_for_terminal_display(guideline)}")

    print("=" * 50)