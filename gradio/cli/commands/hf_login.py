import os

from huggingface_hub import interpreter_login, whoami


def save_login():
    try:
        while True:
            response = input("Stay logged in to Hugging Face? (Y/n): ").strip().lower()
            if response in ["y", "yes", ""]:  # Empty string for just pressing Enter
                os.environ["GRADIO_AUTO_LOGOUT"] = "false"
                print("You can logout at any time with: hf auth logout")
                break
            elif response in ["n", "no"]:
                os.environ["GRADIO_AUTO_LOGOUT"] = "true"
                break
            else:
                print("Please answer with 'y' or 'n'")
    except (EOFError, KeyboardInterrupt):
        os.environ["GRADIO_AUTO_LOGOUT"] = "true"


def hf_login():
    if os.getenv("HF_TOKEN"):
        try:
            user = whoami(token=os.getenv("HF_TOKEN")).get("name")
            print(
                f"🔓  Logged in to Hugging Face as {user}. You can logout at any time with: unset HF_TOKEN\n"
            )
        except Exception:
            print("❌  Error logging in to Hugging Face with $HF_TOKEN")
            print("Logging in with CLI prompt...\n")
            interpreter_login()
            save_login()
    else:
        try:
            user = whoami().get("name")
            print(
                f"🔓  Logged in to Hugging Face as {user}. You can logout at any time with: hf auth logout\n"
            )
        except Exception:
            print(
                "🔑  No Hugging Face login found, launching login prompt... \n\nPlease use a token with permission to make calls to Inference Providers \n"
            )
            interpreter_login()
            save_login()
