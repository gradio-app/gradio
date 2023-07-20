import json
import os
import sys

import requests
from src import changelog, demos, docs, guides

file_dir = os.path.dirname(__file__)
sys.path.append(file_dir)

WEBSITE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def make_dir(root, path):
    return os.path.abspath(os.path.join(root, path))

def get_latest_release():
    with open(make_dir(WEBSITE_DIR, "src/routes/version.json"), "w+") as j:
        json.dump({
            "version": requests.get("https://pypi.org/pypi/gradio/json").json()["info"]["version"]
            }, j)
        
demos.generate(make_dir(WEBSITE_DIR, "src/routes/demos/demos.json"))
guides.generate(make_dir(WEBSITE_DIR, "src/routes/guides/json/") + "/")
docs.generate(make_dir(WEBSITE_DIR, "src/routes/docs/docs.json"))
changelog.generate(make_dir(WEBSITE_DIR, "src/routes/changelog/changelog.json"))
get_latest_release()