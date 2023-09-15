import json
import sys
import urllib.request
from pathlib import Path

version_file = Path(__file__).parent.parent / "gradio" / "package.json"
with version_file.open() as f:
    version = json.load(f)["version"]

with urllib.request.urlopen("https://pypi.org/pypi/gradio/json") as url:
    releases = json.load(url)["releases"]

if version in releases:
    print(f"Version {version} already exists on PyPI")
    sys.exit(1)
else:
    print(f"Version {version} does not exist on PyPI")
