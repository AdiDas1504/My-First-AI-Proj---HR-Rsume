import anthropic

from src.ai_config import get_anthropic_api_key, get_claude_model


def get_claude_client():
    """
    Create a Claude client using the Anthropic API key from .env.
    """
    api_key = get_anthropic_api_key()

    return anthropic.Anthropic(api_key=api_key)


def extract_text_from_claude_message(message):
    """
    Extract plain text from a Claude message response.
    """
    text_parts = []

    for block in message.content:
        if getattr(block, "type", None) == "text":
            text_parts.append(block.text)

    return "\n".join(text_parts).strip()


def send_prompt_to_claude(system_prompt, user_prompt, max_tokens=4000):
    """
    Send a prompt to Claude and return the text response.
    """
    client = get_claude_client()
    model = get_claude_model()

    message = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": user_prompt,
            }
        ],
    )

    return extract_text_from_claude_message(message)