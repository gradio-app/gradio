"""Reading a custom component's pyproject.toml, and changing values in its
`[project]` table without disturbing the rest of the file."""

from __future__ import annotations

import json
import tomllib
from pathlib import Path
from typing import Any


def load(path: Path) -> dict[str, Any]:
    with open(path, "rb") as f:
        return tomllib.load(f)


def _format(value: str | list[str]) -> str:
    # A JSON string is also a valid TOML basic string.
    if isinstance(value, str):
        return json.dumps(value, ensure_ascii=False)
    if not value:
        return "[]"
    items = "".join(f"  {json.dumps(item, ensure_ascii=False)},\n" for item in value)
    return f"[\n{items}]"


def _statement_end(lines: list[str], start: int) -> tuple[int, str]:
    """Returns the last line of the `key = value` statement that begins on line
    `start` (a value such as an array can span several lines), and its key."""
    for end in range(start, len(lines)):
        try:
            parsed = tomllib.loads("\n".join(lines[start : end + 1]))
        except tomllib.TOMLDecodeError:
            continue
        return end, next(iter(parsed))
    raise ValueError(f"Could not parse pyproject.toml at line {start + 1}")


def set_project_values(path: Path, values: dict[str, str | list[str]]) -> None:
    """Sets keys of the `[project]` table, keeping every other line (including
    comments and formatting) as it is."""
    lines = path.read_text(encoding="utf-8").split("\n")
    try:
        header = next(i for i, line in enumerate(lines) if line.strip() == "[project]")
    except StopIteration:
        raise ValueError(f"{path} does not have a [project] table") from None

    # Where each key of the table starts and ends, and where a new key can go.
    statements: dict[str, tuple[int, int]] = {}
    insert_at = header + 1
    i = header + 1
    while i < len(lines):
        stripped = lines[i].strip()
        if stripped.startswith("["):
            break
        if not stripped or stripped.startswith("#"):
            i += 1
            continue
        end, key = _statement_end(lines, i)
        statements[key] = (i, end)
        insert_at = i = end + 1

    # Apply the changes from the bottom up so that earlier line numbers stay valid.
    replacements = []
    for key, value in values.items():
        start, end = statements.get(key, (insert_at, insert_at - 1))
        replacements.append((start, end, f"{key} = {_format(value)}".split("\n")))
    for start, end, new_lines in sorted(replacements, reverse=True):
        lines[start : end + 1] = new_lines

    text = "\n".join(lines)
    project = tomllib.loads(text).get("project", {})
    for key, value in values.items():
        if project.get(key) != value:
            raise ValueError(f"Could not set {key!r} in {path}")
    path.write_text(text, encoding="utf-8")
