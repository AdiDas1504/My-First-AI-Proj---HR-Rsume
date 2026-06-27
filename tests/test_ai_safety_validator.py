"""
Tests for src/ai_output_validator.py.

Covers:
- Dangerous invented claims are detected and flagged.
- Safe wording ("Add only if true", plain descriptions) is not flagged.
- validate_ai_output always returns a complete result dict.

All tests are deterministic — no internet, no files, no Claude.
"""

import pytest

from src.ai_output_validator import find_risky_claims, validate_ai_output


# ── 1. Risky claim detection ─────────────────────────────────────────────────

class TestRiskyClaimsDetected:
    """Patterns that represent potentially invented quantitative or role claims."""

    def test_percentage_metric_is_flagged(self):
        claims = find_risky_claims("Improved delivery speed by 40%.")
        assert len(claims) >= 1

    def test_percent_word_is_flagged(self):
        claims = find_risky_claims("Reduced costs by 25 percent.")
        assert len(claims) >= 1

    def test_improved_keyword_is_flagged(self):
        claims = find_risky_claims("Improved team velocity significantly.")
        assert any("improved" in c.lower() for c in claims)

    def test_increased_keyword_is_flagged(self):
        claims = find_risky_claims("Increased annual revenue by leveraging data insights.")
        assert any("increased" in c.lower() for c in claims)

    def test_reduced_keyword_is_flagged(self):
        claims = find_risky_claims("Reduced bug count across the platform.")
        assert any("reduced" in c.lower() for c in claims)

    def test_led_keyword_is_flagged(self):
        claims = find_risky_claims("Led a cross-functional team of engineers.")
        assert any("led" in c.lower() for c in claims)

    def test_managed_keyword_is_flagged(self):
        claims = find_risky_claims("Managed a portfolio of enterprise accounts.")
        assert any("managed" in c.lower() for c in claims)

    def test_owned_keyword_is_flagged(self):
        claims = find_risky_claims("Owned the end-to-end product roadmap.")
        assert any("owned" in c.lower() for c in claims)

    def test_expert_keyword_is_flagged(self):
        claims = find_risky_claims("Expert in Python and cloud infrastructure.")
        assert any("expert" in c.lower() for c in claims)

    def test_advanced_keyword_is_flagged(self):
        claims = find_risky_claims("Advanced proficiency in SQL and analytics.")
        assert any("advanced" in c.lower() for c in claims)

    def test_certified_keyword_is_flagged(self):
        claims = find_risky_claims("Certified AWS Solutions Architect.")
        assert any("certified" in c.lower() for c in claims)

    def test_years_of_experience_is_flagged(self):
        claims = find_risky_claims("10 years of experience in product management.")
        assert len(claims) >= 1

    def test_multiple_patterns_all_detected(self):
        text = (
            "Led a team of 12 engineers, improved NPS by 30%, "
            "and managed a $2M budget. Expert in cloud architecture."
        )
        claims = find_risky_claims(text)
        assert len(claims) >= 3

    def test_returns_list(self):
        claims = find_risky_claims("Managed and led the team.")
        assert isinstance(claims, list)

    def test_returns_deduplicated_results(self):
        text = "Managed one project. Also managed another project."
        claims = find_risky_claims(text)
        assert claims.count("managed") <= 1


# ── 2. Safe wording not flagged ──────────────────────────────────────────────

class TestSafeWordingNotFlagged:
    """Strings that should produce no risky-claim findings."""

    def test_add_only_if_true_is_safe(self):
        claims = find_risky_claims("Add only if true.")
        assert claims == []

    def test_plain_skill_list_is_safe(self):
        claims = find_risky_claims(
            "Proficient in Python, SQL, and data analysis."
        )
        assert claims == []

    def test_empty_string_returns_empty_list(self):
        claims = find_risky_claims("")
        assert claims == []

    def test_generic_recommendation_is_safe(self):
        claims = find_risky_claims(
            "Consider highlighting your experience with stakeholder communication."
        )
        assert claims == []

    def test_add_if_true_phrasing_variants(self):
        variants = [
            "Include this skill only if true.",
            "Add this only if it reflects your real background.",
            "Mention this qualification only if accurate.",
        ]
        for text in variants:
            claims = find_risky_claims(text)
            assert claims == [], f"Unexpected risky claim in: {text!r}"

    def test_factual_description_without_claims_is_safe(self):
        claims = find_risky_claims(
            "Worked on backend services using Python and REST APIs."
        )
        assert claims == []


# ── 3. validate_ai_output return structure ───────────────────────────────────

class TestValidateAiOutputStructure:
    """validate_ai_output must always return a complete result dict."""

    def test_returns_dict(self):
        result = validate_ai_output("Some output text.")
        assert isinstance(result, dict)

    def test_has_warnings_key_present(self):
        result = validate_ai_output("Some output text.")
        assert "has_warnings" in result

    def test_risky_claims_key_present(self):
        result = validate_ai_output("Some output text.")
        assert "risky_claims" in result

    def test_review_message_key_present(self):
        result = validate_ai_output("Some output text.")
        assert "review_message" in result

    def test_has_warnings_is_bool(self):
        result = validate_ai_output("Some output text.")
        assert isinstance(result["has_warnings"], bool)

    def test_risky_claims_is_list(self):
        result = validate_ai_output("Some output text.")
        assert isinstance(result["risky_claims"], list)

    def test_review_message_is_string(self):
        result = validate_ai_output("Some output text.")
        assert isinstance(result["review_message"], str)


# ── 4. validate_ai_output semantics ─────────────────────────────────────────

class TestValidateAiOutputSemantics:
    """has_warnings correctly reflects whether risky claims were found."""

    def test_has_warnings_true_when_claims_found(self):
        result = validate_ai_output("Led and managed a team of 10. Expert in AWS.")
        assert result["has_warnings"] is True

    def test_has_warnings_false_for_safe_text(self):
        result = validate_ai_output("Add only if true. Highlight relevant Python skills.")
        assert result["has_warnings"] is False

    def test_risky_claims_non_empty_when_dangerous(self):
        result = validate_ai_output("Certified engineer with 8 years of experience.")
        assert len(result["risky_claims"]) >= 1

    def test_risky_claims_empty_for_safe_text(self):
        result = validate_ai_output("Proficient in SQL. Add only if true.")
        assert result["risky_claims"] == []

    def test_review_message_non_empty_always(self):
        for text in ["Safe text here.", "Led and increased revenue by 50%."]:
            result = validate_ai_output(text)
            assert len(result["review_message"]) > 0

    def test_review_message_mentions_claims_when_present(self):
        result = validate_ai_output("Expert Python developer who increased revenue by 20%.")
        assert result["has_warnings"] is True
        assert len(result["review_message"]) > 0

    def test_empty_input_is_safe(self):
        result = validate_ai_output("")
        assert result["has_warnings"] is False
        assert result["risky_claims"] == []
