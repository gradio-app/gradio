import time
import requests
import warnings
import os
import sys

VERSION_TXT = os.path.abspath(os.path.join(os.getcwd(), "..", "gradio", "version.txt"))
with open(VERSION_TXT) as f:
    version = f.read()
version = version.strip()

def wait_for_version(version: str):
    for _ in range(10):
        latest_gradio_stable = requests.get("https://pypi.org/pypi/gradio/json").json()["info"]["version"]
        if version == latest_gradio_stable:
            return True
        else:
            time.sleep(60)
    sys.exit(f"Gradio v{version} is a prerelease or does not exist.")



wait_for_version(version)