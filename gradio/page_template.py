"""Fills in the HTML pages that the frontend build produces.

A page marks each value the server supplies with a `{{ name }}` placeholder.
There are no expressions, conditions or loops: `render` only substitutes
values, in a single pass, so a value that itself contains `{{ name }}` is
never expanded.

Every value is HTML-escaped unless it is passed in `raw`, which is for values
that were already made safe for where they go (JSON placed in a `<script>`).
"""

from __future__ import annotations

import html
import os
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

_PLACEHOLDER = re.compile(r"\{\{\s*(\w+)\s*\}\}")


@lru_cache(maxsize=8)
def _read(path: str, _modified: int) -> str:
    return Path(path).read_text(encoding="utf-8")


def render(
    path: str | Path, *, text: dict[str, Any], raw: dict[str, str] | None = None
) -> str:
    """
    Parameters:
        path: the page to fill in. Raises FileNotFoundError if it does not exist.
        text: values that are HTML-escaped before they are inserted. None becomes an empty string.
        raw: values that are inserted exactly as given.
    """
    raw = raw or {}
    # Keyed on the modification time so that a rebuilt frontend is picked up
    template = _read(str(path), os.stat(path).st_mtime_ns)

    def fill(match: re.Match[str]) -> str:
        name = match.group(1)
        if name in raw:
            return raw[name]
        if name not in text:
            raise KeyError(f"No value was given for {{{{ {name} }}}} in {path}")
        value = text[name]
        return "" if value is None else html.escape(str(value), quote=True)

    return _PLACEHOLDER.sub(fill, template)
