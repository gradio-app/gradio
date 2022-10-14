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
            print(version)
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

wait_for_version(version)
