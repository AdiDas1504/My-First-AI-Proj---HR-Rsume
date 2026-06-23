from src.ai_prompt_builder import (
    build_resume_tailoring_prompt,
    build_claude_system_prompt,
)
from src.claude_client import send_prompt_to_claude


def generate_claude_tailored_resume(resume_text, job_text, analysis, tailoring_plan):
    """
    Generate a Claude-powered tailored resume draft.

    Claude receives:
    - Resume text
    - Job requirements
    - Baseline match analysis
    - Tailoring plan
    - Strict honesty rules

    Claude must not invent unsupported candidate information.
    """
    system_prompt = build_claude_system_prompt()

    user_prompt = build_resume_tailoring_prompt(
        resume_text=resume_text,
        job_text=job_text,
        analysis=analysis,
        tailoring_plan=tailoring_plan,
    )

    claude_response = send_prompt_to_claude(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        max_tokens=4000,
    )

    return claude_response