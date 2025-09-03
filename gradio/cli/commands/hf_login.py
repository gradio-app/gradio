import os

from huggingface_hub import interpreter_login, whoami


def hf_login():
    if os.getenv("HF_TOKEN"):
        try:
            user = whoami(token=os.getenv("HF_TOKEN")).get("name")
            print(f"🔓  Logged in to Hugging Face as {user}\n")
        except Exception:
            print("❌  Error logging in to Hugging Face with $HF_TOKEN")
            print("Logging in with CLI prompt...\n")
            interpreter_login()
    else:
        try:
            user = whoami().get("name")
            print(f"🔓  Logged in to Hugging Face as {user}\n")
        except Exception:
            print("🔑  No Hugging Face login found, launching login prompt..\n")
            interpreter_login()
