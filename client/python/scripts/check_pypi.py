import json
import sys
import urllib.request
from pathlib import Path

version_file = Path(__file__).parent.parent / "gradio_client" / "version.txt"
version = version_file.read_text(encoding="utf8").strip()

with urllib.request.urlopen("https://pypi.org/pypi/gradio_client/json") as url:
    releases = json.load(url)["releases"]

if version in releases:
    print(f"Version {version} already exists on PyPI")
    sys.exit(1)
else:
    print(f"Version {version} does not exist on PyPI")
