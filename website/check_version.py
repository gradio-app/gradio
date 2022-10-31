import time
import requests
import warnings
import os
import sys

VERSION_TXT = os.path.abspath(os.path.join(os.getcwd(), "..", "gradio", "version.txt"))
with open(VERSION_TXT) as f:
    version = f.read()
version = version.strip()


def is_version_up(version: str) -> bool:
    try:
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore")
            r = requests.head(f"https://pypi.org/project/gradio/{version}/", timeout=3, verify=False)
        if r.status_code == 200:
            return True
    except (ConnectionError, requests.exceptions.ConnectionError):
        return False

def wait_for_version(version: str):
    for _ in range(10):
        if is_version_up(version):
            return True
        else:
            time.sleep(60)
    sys.exit(f"Could not find gradio v{version} on pypi: https://pypi.org/project/gradio/{version}/ does not exist")

def check_not_prerelease(version: str): 
    if requests.get("https://pypi.org/pypi/gradio/json").json()["info"]["version"] == version:
        return True
    sys.exit(f"Did not create docs: gradio v{version} is a prelease, or a later version exists.")


wait_for_version(version)
check_not_prerelease(version)
