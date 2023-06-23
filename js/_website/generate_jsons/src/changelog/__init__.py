import os
import json
import re

GRADIO_DIR = "../../../"
CHANGELOG_FILE = os.path.join(GRADIO_DIR, "CHANGELOG.md")

def clean():
    with open(CHANGELOG_FILE, "r") as change_file:
        content = change_file.read()
    
    # remove empty/unused sections
    content = re.sub(r"## [\w^:\n ]*No changes to highlight.", "", content)

    # get versions and their correct href
    versions = re.findall(r"# Version \d\.\d[^\n ]*", content)
    versions = [("Upcoming Release", "upcoming-release")] + [("v" + v.strip("# Version "), "version-" + v.strip("# Version ").replace('.','')) for v in versions]

    return content, versions


def generate(json_path):
    content, versions = clean()
    with open(json_path, 'w+') as f:
        json.dump({
            "content": content,
            "versions": versions
            }, f)