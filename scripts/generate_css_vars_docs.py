"""Auto-generate a markdown table of all theme CSS variables from Base.set().

Run: python scripts/generate_css_vars_docs.py
This will update the theming guide in-place between the marker comments.
"""

import inspect
import re
from pathlib import Path

from gradio.themes import Base

GUIDE_PATH = Path(__file__).parent.parent / "guides" / "11_other-tutorials" / "css-variables-reference.md"
START_MARKER = "<!-- CSS_VARS_TABLE_START -->"
END_MARKER = "<!-- CSS_VARS_TABLE_END -->"


def get_categories_and_params() -> list[tuple[str, list[tuple[str, str, str]]]]:
    """Extract categories, param names, descriptions, and defaults from Base.set().

    Returns list of (category, [(css_var, description, default), ...])
    """
    sig = inspect.signature(Base.set)
    doc = Base.set.__doc__ or ""

    descriptions: dict[str, str] = {}
    for line in doc.split("\n"):
        m = re.match(r"^\s{12}(\w+):\s*(.+)$", line)
        if m:
            descriptions[m.group(1)] = m.group(2).strip()

    source = inspect.getsource(Base.set)
    categories: list[tuple[str, int]] = []
    lines = source.split("\n")
    param_line_map: dict[str, int] = {}
    for i, line in enumerate(lines):
        cat_match = re.match(r"\s*#\s*(.+?):\s*These\s", line)
        if cat_match:
            categories.append((cat_match.group(1).strip(), i))
        param_match = re.match(r"\s*(\w+)\s*=\s*None", line)
        if param_match:
            param_line_map[param_match.group(1)] = i

    base = Base()
    defaults: dict[str, str] = {}
    for attr in dir(base):
        if not attr.startswith("_") and isinstance(getattr(base, attr), str):
            defaults[attr] = getattr(base, attr)

    params = [p for p in sig.parameters if p != "self" and p != "return"]
    result: list[tuple[str, list[tuple[str, str, str]]]] = []

    cat_boundaries = [(name, line) for name, line in categories]
    cat_boundaries.append(("_end", float("inf")))

    for idx, (cat_name, cat_line) in enumerate(cat_boundaries[:-1]):
        next_cat_line = cat_boundaries[idx + 1][1]
        cat_params = []
        for p in params:
            p_line = param_line_map.get(p, -1)
            if cat_line <= p_line < next_cat_line:
                css_var = f"--{p.replace('_', '-')}"
                desc = descriptions.get(p, "")
                default = defaults.get(p, "")
                cat_params.append((css_var, desc, default))
        if cat_params:
            result.append((cat_name, cat_params))

    return result


def generate_table() -> str:
    categories = get_categories_and_params()
    lines = []

    for cat_name, params in categories:
        lines.append(f"\n#### {cat_name}\n")
        lines.append("| CSS Variable | Description | Default |")
        lines.append("| --- | --- | --- |")
        for css_var, desc, default in params:
            escaped = default.replace("|", "\\|") if default else ""
            default_display = f"`{escaped}`" if escaped else ""
            lines.append(f"| `{css_var}` | {desc} | {default_display} |")

    return "\n".join(lines)


def update_guide():
    content = GUIDE_PATH.read_text()
    table = generate_table()
    new_section = f"{START_MARKER}\n{table}\n{END_MARKER}"

    if START_MARKER in content:
        pattern = re.escape(START_MARKER) + r".*?" + re.escape(END_MARKER)
        content = re.sub(pattern, new_section, content, flags=re.DOTALL)
    else:
        raise ValueError(
            f"Could not find {START_MARKER} in {GUIDE_PATH}. "
            "Please add the start/end markers to the guide."
        )

    GUIDE_PATH.write_text(content)
    print(f"Updated {GUIDE_PATH}")


if __name__ == "__main__":
    update_guide()
