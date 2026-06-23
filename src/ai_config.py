import os

from dotenv import load_dotenv


load_dotenv()


def get_anthropic_api_key():
    """
    Read the Anthropic API key from the .env file or environment variables.

    The key must never be hardcoded in the source code.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")

    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is missing. "
            "Add it to your .env file before using Claude AI features."
        )

    return api_key


def get_claude_model():
    """
    Read the selected Claude model from the .env file.
    """
    model = os.getenv("CLAUDE_MODEL")

    if not model:
        raise RuntimeError(
            "CLAUDE_MODEL is missing. "
            "Add it to your .env file before using Claude AI features."
        )

    return model


def is_ai_configured():
    """
    Check whether Claude AI configuration exists.

    This function allows the app to keep the non-AI flow working
    even when AI is not configured yet.
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    model = os.getenv("CLAUDE_MODEL")

    return bool(api_key and model)