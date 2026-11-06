"""Merges result files from separate runs (e.g. the simple and many_tabs Spaces runs).

python merge.py results/spaces.json results/spaces-simple.json results/spaces-many_tabs.json
"""

import json
import sys
from pathlib import Path

out, *inputs = sys.argv[1:]
merged: dict = {}
for path in inputs:
    data = json.loads(Path(path).read_text())
    for key, value in data.items():
        if isinstance(value, list):
            merged.setdefault(key, []).extend(value)
        else:
            merged.setdefault(key, value)
Path(out).write_text(json.dumps(merged, indent=1))
