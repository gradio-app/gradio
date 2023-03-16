from src import demos, guides, docs, changelog
import os 
import requests
import json

def get_latest_release():
    with open("../src/routes/version.json", "w+") as j:
        json.dump({
            "version": requests.get("https://pypi.org/pypi/gradio/json").json()["info"]["version"]
            }, j)

demos.generate("../src/routes/demos/demos.json")
guides.generate("../src/routes/guides/guides.json")
docs.generate("../src/routes/docs/docs.json")
changelog.generate("../src/routes/changelog/changelog.json")
get_latest_release()