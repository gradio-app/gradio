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
SKILL_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "skill_data"

skills_app = typer.Typer(help="Manage Gradio skills for AI assistants.")


def _import_hf_skills():
    try:
        from huggingface_hub.cli.skills import (
            CENTRAL_GLOBAL,
            CENTRAL_LOCAL,
            GLOBAL_TARGETS,
            LOCAL_TARGETS,
            _remove_existing,
        )
    except (ImportError, ModuleNotFoundError):
        raise SystemExit(
            "The 'gradio skills' command requires huggingface_hub >= 1.4.0.\n"
            "Please upgrade: pip install --upgrade huggingface_hub"
        )
    return CENTRAL_GLOBAL, CENTRAL_LOCAL, GLOBAL_TARGETS, LOCAL_TARGETS, _remove_existing


def _create_symlink(
    agent_skills_dir: Path, central_skill_path: Path, force: bool, remove_existing_fn
) -> Path:
    agent_skills_dir = agent_skills_dir.expanduser().resolve()
    agent_skills_dir.mkdir(parents=True, exist_ok=True)
    link_path = agent_skills_dir / SKILL_ID
    remove_existing_fn(link_path, force)
    link_path.symlink_to(os.path.relpath(central_skill_path, agent_skills_dir))
    return link_path


def _install_to(skills_dir: Path, force: bool, remove_existing_fn) -> Path:
    skills_dir = skills_dir.expanduser().resolve()
    skills_dir.mkdir(parents=True, exist_ok=True)
    dest = skills_dir / SKILL_ID

    remove_existing_fn(dest, force)

    if not SKILL_DATA_DIR.exists():
        raise SystemExit(
            f"Skill data not found at {SKILL_DATA_DIR}.\n"
            "Run `python scripts/generate_skill.py` from the Gradio repo to generate it."
        )

    shutil.copytree(SKILL_DATA_DIR, dest)
    return dest


@skills_app.command(
    "add",
)
def skills_add(
    cursor: Annotated[bool, typer.Option("--cursor", help="Install for Cursor.")] = False,
    claude: Annotated[bool, typer.Option("--claude", help="Install for Claude.")] = False,
    codex: Annotated[bool, typer.Option("--codex", help="Install for Codex.")] = False,
    opencode: Annotated[bool, typer.Option("--opencode", help="Install for OpenCode.")] = False,
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
        typer.Option(help="Install into a custom destination (path to skills directory)."),
    ] = None,
    force: Annotated[
        bool,
        typer.Option("--force", help="Overwrite existing skills in the destination."),
    ] = False,
) -> None:
    """Download and install the Gradio skill for an AI assistant."""
    CENTRAL_GLOBAL, CENTRAL_LOCAL, _HF_GLOBAL_TARGETS, _HF_LOCAL_TARGETS, _remove_existing = (
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
        skill_dest = _install_to(dest, force, _remove_existing)
        print(f"Installed '{SKILL_ID}' skill to {skill_dest}")
        return

    global_targets = {**_HF_GLOBAL_TARGETS, "cursor": Path("~/.cursor/skills")}
    local_targets = {**_HF_LOCAL_TARGETS, "cursor": Path(".cursor/skills")}
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

    central_path = CENTRAL_GLOBAL if global_ else CENTRAL_LOCAL
    central_skill_path = _install_to(central_path, force, _remove_existing)
    print(f"Installed '{SKILL_ID}' skill to central location: {central_skill_path}")

    for agent_target in agent_targets:
        link_path = _create_symlink(agent_target, central_skill_path, force, _remove_existing)
        print(f"Created symlink: {link_path}")
