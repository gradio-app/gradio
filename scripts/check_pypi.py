import urllib.request
import json 
import sys
from pathlib import Path

root_directory = Path(__file__).parent.parent
version = (root_directory /  "gradio" / "version.txt").read_text(
    encoding='utf8').strip()

with urllib.request.urlopen("https://pypi.org/pypi/gradio/json") as url:
    releases = json.load(url)["releases"]

if version in releases:
    print(f"Version {version} already exists on PyPI")
    sys.exit(1)
else:
    print(f"Version {version} does not exist on PyPI")
