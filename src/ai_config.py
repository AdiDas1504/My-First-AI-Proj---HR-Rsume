import os

from dotenv import load_dotenv


load_dotenv()


def get_openai_api_key():
    """
    Read the OpenAI API key from the .env file or environment variables.

    The key must never be hardcoded in the source code.
    """
    api_key = os.getenv("OPENAI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "OPENAI_API_KEY is missing. "
            "Add it to your .env file before using AI features."
        )

    return api_key


def get_openai_model():
    """
    Read the selected OpenAI model from the .env file.

    A model can be configured later based on the account and availability.
    """
    model = os.getenv("OPENAI_MODEL")

    if not model:
        raise RuntimeError(
            "OPENAI_MODEL is missing. "
            "Add it to your .env file before using AI features."
        )

    return model


def is_ai_configured():
    """
    Check whether AI configuration exists.

    This function allows the app to keep the non-AI flow working
    even when AI is not configured yet.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    model = os.getenv("OPENAI_MODEL")

    return bool(api_key and model)