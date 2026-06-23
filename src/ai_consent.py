def ask_ai_consent():
    """
    Ask the user for consent before sending resume and job text to an external AI API.
    """
    print()
    print("AI Processing Notice")
    print("-" * 50)
    print(
        "To generate an AI-tailored resume draft, the app may send "
        "your extracted resume text and job requirements to an external AI API."
    )
    print()
    print("Do not continue if you do not want this information processed by an external AI service.")
    print("The AI output is only a draft and must be reviewed before use.")
    print()

    answer = input("Do you agree to continue with AI processing? Type yes/no: ").strip().lower()

    return answer in ["yes", "y"]