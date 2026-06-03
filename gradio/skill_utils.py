"""Shared helpers for rendering a Gradio app's API as "skill" markdown.

Used both by the live server (``gradio/routes.py``, which serves this markdown
to coding agents) and by the ``gradio skills add <space_id>`` CLI command
(``gradio/cli/commands/skills.py``, which writes it to a SKILL.md file).
"""

from __future__ import annotations

from gradio_client.snippet import generate_code_snippets


def render_endpoint_section(
    api_name: str,
    endpoint_info: dict,
    src_url: str,
    space_id: str | None = None,
) -> str:
    """Render a single API endpoint as a markdown section.

    Lists the endpoint's parameters and return values, followed by Python,
    JavaScript, and cURL usage snippets.
    """
    params = endpoint_info.get("parameters", [])
    returns = endpoint_info.get("returns", [])

    lines: list[str] = []
    lines.append(f"### `{api_name}`\n")

    if params:
        lines.append("**Parameters:**\n")
        for p in params:
            ptype = p.get("python_type", {})
            type_str = (
                ptype.get("type", "Any") if isinstance(ptype, dict) else str(ptype)
            )
            name = p.get("parameter_name") or p.get("label", "input")
            component = p.get("component", "")
            default_info = ""
            if p.get("parameter_has_default"):
                default_val = (
                    str(p.get("parameter_default", ""))
                    .replace("\\", "\\\\")
                    .replace("`", "\\`")
                )
                default_info = f", default: `{default_val}`"
            required = (
                " (required)" if not p.get("parameter_has_default", False) else ""
            )
            lines.append(
                f"- `{name}` [{component}]: `{type_str}`{required}{default_info}"
            )
        lines.append("")

    if returns:
        lines.append("**Returns:**\n")
        for r in returns:
            rtype = r.get("python_type", {})
            type_str = (
                rtype.get("type", "Any") if isinstance(rtype, dict) else str(rtype)
            )
            label = r.get("label", "output")
            component = r.get("component", "")
            lines.append(f"- `{label}` [{component}]: `{type_str}`")
        lines.append("")

    snippets = generate_code_snippets(
        api_name, endpoint_info, src_url, space_id=space_id
    )

    lines.append("**Python:**\n")
    lines.append("```python")
    lines.append(snippets["python"])
    lines.append("```\n")

    lines.append("**JavaScript:**\n")
    lines.append("```javascript")
    lines.append(snippets["javascript"])
    lines.append("```\n")

    lines.append("**cURL:**\n")
    lines.append("```bash")
    lines.append(snippets["bash"])
    lines.append("```\n")

    return "\n".join(lines)


def render_api_endpoints_md(
    api_info: dict,
    src_url: str,
    space_id: str | None = None,
) -> str:
    """Render the "## API Endpoints" section for all named endpoints.

    Returns an empty string if the app exposes no named endpoints. (Gradio no
    longer populates ``unnamed_endpoints``, so only named endpoints are shown.)
    """
    named = api_info.get("named_endpoints", {})
    if not named:
        return ""
    lines: list[str] = ["## API Endpoints\n"]
    for api_name, endpoint_info in named.items():
        lines.append(render_endpoint_section(api_name, endpoint_info, src_url, space_id))
    return "\n".join(lines)
