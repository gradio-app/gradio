import json
import os
import re

DIR = os.path.dirname(__file__)
CHANGELOG_FILE = os.path.abspath(os.path.join(DIR, "../../../../../CHANGELOG.md"))


def clean():
    with open(CHANGELOG_FILE) as change_file:
        content = change_file.read()
    
    # remove empty/unused sections
    content = re.sub(r"## [\w^:\n ]*No changes to highlight.", "", content)
    content = content.replace("# gradio", "# Changelog")

    return content


def generate(json_path):
    content = clean()
    with open(json_path, 'w+') as f:
        json.dump({
            "content": content,
            }, f)