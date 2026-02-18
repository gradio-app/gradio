"""CLI command to install the Gradio skill for AI coding assistants.

Usage:
    gradio skills add --cursor
    gradio skills add --cursor --opencode
    gradio skills add --cursor --global
    gradio skills add --dest=~/my-skills
"""

from __future__ import annotations

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
    agent_skills_dir: Path, central_skill_path: Path, force: bool
) -> Path:
    agent_skills_dir = agent_skills_dir.expanduser().resolve()
    agent_skills_dir.mkdir(parents=True, exist_ok=True)
    link_path = agent_skills_dir / SKILL_ID
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


@skills_app.command(
    "add",
)
def skills_add(
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
    """Download and install the Gradio skill for an AI assistant."""
    central_global, central_local, hf_global_targets, hf_local_targets = (
        _import_hf_skills()
    )

    if not (cursor or claude or codex or opencode or dest):
        raise typer.BadParameter(
            "Pick a destination via --cursor, --claude, --codex, --opencode, or --dest."
        )

    if dest:
        if cursor or claude or codex or opencode or global_:
            print("--dest cannot be combined with agent flags or --global.")
            raise typer.Exit(code=1)
        skill_dest = _install_to(dest, force)
        print(f"Installed '{SKILL_ID}' to {skill_dest}")
        return

    global_targets = {**hf_global_targets, "cursor": Path("~/.cursor/skills")}
    local_targets = {**hf_local_targets, "cursor": Path(".cursor/skills")}
    targets_dict = global_targets if global_ else local_targets

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
    central_skill_path = _install_to(central_path, force)
    print(f"Installed '{SKILL_ID}' to central location: {central_skill_path}")

    for agent_target in agent_targets:
        link_path = _create_symlink(agent_target, central_skill_path, force)
        print(f"Created symlink: {link_path}")
