"""CLI command to install the Gradio skill for AI coding assistants.

Usage:
    gradio skills add --cursor
    gradio skills add --cursor --opencode
    gradio skills add --cursor --global
    gradio skills add --dest=~/my-skills
    gradio skills add abidlabs/english-translator --cursor
"""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path
from typing import Annotated, Optional

import typer

SKILL_ID = "gradio"

_GITHUB_RAW = "https://raw.githubusercontent.com/gradio-app/gradio/main"
_SKILL_PREFIX = ".agents/skills/gradio"

_SKILL_FILES = ["SKILL.md", "examples.md"]

skills_app = typer.Typer(help="Manage Gradio skills for AI assistants.")


def _import_hf_skills():
    try:
        from huggingface_hub.cli.skills import (  # type: ignore[import-not-found]
            CENTRAL_GLOBAL,
            CENTRAL_LOCAL,
            GLOBAL_TARGETS,
            LOCAL_TARGETS,
        )
    except (ImportError, ModuleNotFoundError):
        raise SystemExit(
            "The 'gradio skills' command requires huggingface_hub >= 1.4.0.\n"
            "Please upgrade: pip install --upgrade huggingface_hub"
        ) from None
    return CENTRAL_GLOBAL, CENTRAL_LOCAL, GLOBAL_TARGETS, LOCAL_TARGETS


def _download(url: str) -> str:
    from huggingface_hub.utils import get_session

    try:
        response = get_session().get(url)
        response.raise_for_status()
    except Exception as e:
        raise SystemExit(
            f"Failed to download {url}\n{e}\n\n"
            "Make sure you have internet access. The skill files are fetched from "
            "the Gradio GitHub repository."
        ) from e
    return response.text


def _remove_existing(path: Path, force: bool) -> None:
    if not (path.exists() or path.is_symlink()):
        return
    if not force:
        raise SystemExit(
            f"Skill already exists at {path}.\nRe-run with --force to overwrite."
        )
    if path.is_dir() and not path.is_symlink():
        shutil.rmtree(path)
    else:
        path.unlink()


def _create_symlink(
    agent_skills_dir: Path,
    central_skill_path: Path,
    force: bool,
    skill_id: str = SKILL_ID,
) -> Path:
    agent_skills_dir = agent_skills_dir.expanduser().resolve()
    agent_skills_dir.mkdir(parents=True, exist_ok=True)
    link_path = agent_skills_dir / skill_id
    _remove_existing(link_path, force)
    link_path.symlink_to(os.path.relpath(central_skill_path, agent_skills_dir))
    return link_path


def _install_to(skills_dir: Path, force: bool) -> Path:
    skills_dir = skills_dir.expanduser().resolve()
    skills_dir.mkdir(parents=True, exist_ok=True)
    dest = skills_dir / SKILL_ID

    _remove_existing(dest, force)
    dest.mkdir()

    for fname in _SKILL_FILES:
        content = _download(f"{_GITHUB_RAW}/{_SKILL_PREFIX}/{fname}")
        (dest / fname).write_text(content, encoding="utf-8")

    return dest


def _space_id_to_skill_id(space_id: str) -> str:
    return space_id.replace("/", "-")


def _render_endpoint_section(
    api_name: str, endpoint_info: dict, space_id: str, src_url: str
) -> str:
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
                default_info = f", default: `{p.get('parameter_default')}`"
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

    param_names = [p.get("parameter_name") or p.get("label", "input") for p in params]
    example_inputs = [p.get("example_input") for p in params]

    py_args = ", ".join(
        f"{name}={json.dumps(ex)}" for name, ex in zip(param_names, example_inputs)
    )
    lines.append("**Python:**\n")
    lines.append("```python")
    lines.append("from gradio_client import Client\n")
    lines.append(f'client = Client("{space_id}")')
    lines.append(
        f'result = client.predict(\n    {py_args},\n    api_name="{api_name}",\n)'
    )
    lines.append("print(result)")
    lines.append("```\n")

    js_args = ", ".join(
        f"{name}: {json.dumps(ex)}" for name, ex in zip(param_names, example_inputs)
    )
    lines.append("**JavaScript:**\n")
    lines.append("```javascript")
    lines.append('import { Client } from "@gradio/client";\n')
    lines.append(f'const client = await Client.connect("{space_id}");')
    lines.append(
        f'const result = await client.predict("{api_name}", {{\n    {js_args},\n}});'
    )
    lines.append("console.log(result.data);")
    lines.append("```\n")

    base_url = src_url.rstrip("/")
    endpoint_path = api_name.lstrip("/")
    curl_body = json.dumps({"data": example_inputs})
    lines.append("**cURL:**\n")
    lines.append("```bash")
    lines.append(
        f"curl -X POST {base_url}/api/{endpoint_path} \\\n"
        f'  -H "Content-Type: application/json" \\\n'
        f"  -d '{curl_body}'"
    )
    lines.append("```\n")

    return "\n".join(lines)


def _get_space_description(space_id: str) -> str | None:
    try:
        from huggingface_hub import HfApi

        info = HfApi().space_info(space_id)
        return getattr(info, "short_description", None) or None
    except Exception:
        return None


def _generate_space_skill(space_id: str) -> tuple[str, str]:
    try:
        from gradio_client import Client
    except ImportError:
        raise SystemExit(
            "The 'gradio skills add <space_id>' command requires gradio_client.\n"
            "Please install it: pip install gradio_client"
        ) from None

    try:
        client = Client(space_id, download_files=False)
    except Exception as e:
        raise SystemExit(
            f"Failed to connect to Space '{space_id}'.\n{e}\n\n"
            "Make sure the Space exists, is public (or provide HF_TOKEN), and is running."
        ) from e

    api_info = client.view_api(print_info=False, return_format="dict")
    src_url = client.src

    skill_id = _space_id_to_skill_id(space_id)

    space_description = _get_space_description(space_id)

    lines: list[str] = []
    lines.append("---")
    lines.append(f"name: {skill_id}")
    desc = (
        f"description: Use the {space_id} Gradio Space via API. "
        f"Provides Python, JavaScript, and cURL usage examples."
    )
    if space_description:
        desc += f" Space description: {space_description}"
    lines.append(desc)
    lines.append("---\n")
    lines.append(f"# {space_id}\n")
    lines.append(
        f"This skill describes how to use the {space_id} "
        f"Gradio Space programmatically.\n"
    )

    named = api_info.get("named_endpoints", {})
    unnamed = api_info.get("unnamed_endpoints", {})

    if named:
        lines.append("## API Endpoints\n")
        for api_name, endpoint_info in named.items():
            lines.append(
                _render_endpoint_section(api_name, endpoint_info, space_id, src_url)
            )

    if not named and unnamed:
        lines.append("## API Endpoints\n")
        for fn_index, endpoint_info in unnamed.items():
            lines.append(
                _render_endpoint_section(
                    f"fn_index={fn_index}", endpoint_info, space_id, src_url
                )
            )

    return skill_id, "\n".join(lines) + "\n"


def _install_space_skill(
    skill_id: str, content: str, skills_dir: Path, force: bool
) -> Path:
    skills_dir = skills_dir.expanduser().resolve()
    skills_dir.mkdir(parents=True, exist_ok=True)
    dest = skills_dir / skill_id

    _remove_existing(dest, force)
    dest.mkdir()
    (dest / "SKILL.md").write_text(content, encoding="utf-8")
    return dest


@skills_app.command(
    "add",
)
def skills_add(
    space_id: Annotated[
        Optional[str],
        typer.Argument(
            help="HF Space ID (e.g. 'user/my-space'). If omitted, installs the general Gradio skill."
        ),
    ] = None,
    cursor: Annotated[
        bool, typer.Option("--cursor", help="Install for Cursor.")
    ] = False,
    claude: Annotated[
        bool, typer.Option("--claude", help="Install for Claude.")
    ] = False,
    codex: Annotated[bool, typer.Option("--codex", help="Install for Codex.")] = False,
    opencode: Annotated[
        bool, typer.Option("--opencode", help="Install for OpenCode.")
    ] = False,
    global_: Annotated[
        bool,
        typer.Option(
            "--global",
            "-g",
            help="Install globally (user-level) instead of in the current project directory.",
        ),
    ] = False,
    dest: Annotated[
        Optional[Path],
        typer.Option(
            help="Install into a custom destination (path to skills directory)."
        ),
    ] = None,
    force: Annotated[
        bool,
        typer.Option("--force", help="Overwrite existing skills in the destination."),
    ] = False,
) -> None:
    """Download and install a Gradio skill for an AI assistant.

    When called without a space_id, installs the general Gradio skill.
    When called with a space_id, generates and installs a skill for that
    specific Gradio Space with Python, JS, and cURL usage examples.
    """
    central_global, central_local, hf_global_targets, hf_local_targets = (
        _import_hf_skills()
    )

    if not (cursor or claude or codex or opencode or dest):
        raise typer.BadParameter(
            "Pick a destination via --cursor, --claude, --codex, --opencode, or --dest."
        )

    global_targets = {**hf_global_targets, "cursor": Path("~/.cursor/skills")}
    local_targets = {**hf_local_targets, "cursor": Path(".cursor/skills")}
    targets_dict = global_targets if global_ else local_targets

    if space_id is not None:
        skill_id, content = _generate_space_skill(space_id)
        print(f"Generated skill for Space '{space_id}'")

        if dest:
            if cursor or claude or codex or opencode or global_:
                print("--dest cannot be combined with agent flags or --global.")
                raise typer.Exit(code=1)
            skill_dest = _install_space_skill(skill_id, content, dest, force)
            print(f"Installed '{skill_id}' to {skill_dest}")
            return

        agent_targets: list[Path] = []
        if cursor:
            agent_targets.append(targets_dict["cursor"])
        if claude:
            agent_targets.append(targets_dict["claude"])
        if codex:
            agent_targets.append(targets_dict["codex"])
        if opencode:
            agent_targets.append(targets_dict["opencode"])

        central_path = central_global if global_ else central_local
        central_skill_path = _install_space_skill(
            skill_id, content, central_path, force
        )
        print(f"Installed '{skill_id}' to central location: {central_skill_path}")

        for agent_target in agent_targets:
            link_path = _create_symlink(
                agent_target, central_skill_path, force, skill_id=skill_id
            )
            print(f"Created symlink: {link_path}")
        return

    if dest:
        if cursor or claude or codex or opencode or global_:
            print("--dest cannot be combined with agent flags or --global.")
            raise typer.Exit(code=1)
        skill_dest = _install_to(dest, force)
        print(f"Installed '{SKILL_ID}' to {skill_dest}")
        return

    agent_targets = []
    if cursor:
        agent_targets.append(targets_dict["cursor"])
    if claude:
        agent_targets.append(targets_dict["claude"])
    if codex:
        agent_targets.append(targets_dict["codex"])
    if opencode:
        agent_targets.append(targets_dict["opencode"])

    central_path = central_global if global_ else central_local
    central_skill_path = _install_to(central_path, force)
    print(f"Installed '{SKILL_ID}' to central location: {central_skill_path}")

    for agent_target in agent_targets:
        link_path = _create_symlink(agent_target, central_skill_path, force)
        print(f"Created symlink: {link_path}")
