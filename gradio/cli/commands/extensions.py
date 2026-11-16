"""Optional CLI commands installed from GitHub using Python entry points.

An extension repository needs a Python project with this pyproject.toml entry:

    [project.entry-points."gradio.commands"]
    emulate = "gradio_emulate.cli:main"

The callable follows the console-script convention: no arguments, options in
sys.argv, and an optional integer exit status. It is imported only when invoked.
"""

from __future__ import annotations

import importlib.metadata
import json
import re
import subprocess
import sys
from typing import Annotated

import typer
from packaging.utils import canonicalize_name
from rich.console import Console
from rich.table import Table

ENTRY_POINT_GROUP = "gradio.commands"
RESERVED_COMMANDS = {
    "deploy",
    "environment",
    "deploy-discord",
    "sketch",
    "load",
    "skills",
    "info",
    "predict",
    "cc",
    "component",
    "build",
    "dev",
    "create",
    "show",
    "publish",
    "install",
    "upload-mcp",
    "extensions",
}

extensions_app = typer.Typer(
    help="Install and manage optional CLI commands from GitHub.", no_args_is_help=True
)


def get_extensions() -> list[importlib.metadata.EntryPoint]:
    # Reading package metadata does not import extension code.
    return sorted(
        importlib.metadata.entry_points(group=ENTRY_POINT_GROUP),
        key=lambda entry: (entry.name, entry.dist.name if entry.dist else ""),
    )


def command_error(
    name: str, entries: list[importlib.metadata.EntryPoint]
) -> str | None:
    if not re.fullmatch(r"[a-z][a-z0-9-]*", name):
        return "Command names must start with a lowercase letter and contain only a-z, 0-9 or hyphens."
    if name in RESERVED_COMMANDS:
        return "Reserved for a built-in Gradio command."
    matches = [entry for entry in entries if entry.name == name]
    if len(matches) > 1:
        packages = ", ".join(entry.dist.name for entry in matches if entry.dist)
        return f"Multiple packages provide this command: {packages}. Remove one with `gradio extensions remove PACKAGE`."
    return None


def run_extension(name: str, args: list[str]) -> bool:
    if not re.fullmatch(r"[a-z][a-z0-9-]*", name):
        return False
    entries = get_extensions()
    matches = [entry for entry in entries if entry.name == name]
    if not matches:
        return False
    if error := command_error(name, entries):
        raise SystemExit(f"Cannot run extension {name!r}: {error}")
    entry = matches[0]
    try:
        command = entry.load()
    except Exception as error:
        raise SystemExit(f"Could not load extension {name!r}: {error}") from error
    if not callable(command):
        raise SystemExit(f"Extension {name!r} must point to a callable.")
    original_argv = sys.argv
    try:
        sys.argv = [f"gradio {name}", *args]
        raise SystemExit(command())
    finally:
        sys.argv = original_argv


@extensions_app.command("list")
def list_extensions():
    """List installed commands and the packages that provide them."""
    entries = get_extensions()
    if not entries:
        typer.echo(
            "No extensions installed. Use `gradio extensions install OWNER/REPO`."
        )
        return
    table = Table(title="Extension commands")
    for column in ("Command", "Package", "Version", "Status"):
        table.add_column(column)
    for entry in entries:
        table.add_row(
            entry.name,
            entry.dist.name if entry.dist else "",
            entry.dist.version if entry.dist else "",
            command_error(entry.name, entries) or "Available",
        )
    Console().print(table)


def _github_url(repo: str) -> str:
    repo = repo.removeprefix("https://github.com/").removesuffix("/")
    repo = repo.removesuffix(".git")
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9-]*/[A-Za-z0-9_][A-Za-z0-9_.-]*", repo):
        raise typer.BadParameter("Use OWNER/REPO or https://github.com/OWNER/REPO.")
    return f"https://github.com/{repo}.git"


def _pip(*args: str):
    try:
        importlib.metadata.distribution("pip")
    except importlib.metadata.PackageNotFoundError as error:
        raise typer.BadParameter(
            f"pip is required in Gradio's Python environment ({sys.executable}). "
            "Install pip in that environment, then retry."
        ) from error
    result = subprocess.run([sys.executable, "-m", "pip", *args], check=False)
    if result.returncode:
        raise typer.Exit(code=result.returncode)


@extensions_app.command()
def install(
    repo: Annotated[
        str, typer.Argument(help="GitHub repository: OWNER/REPO or HTTPS URL.")
    ],
    ref: Annotated[
        str | None,
        typer.Option(
            help="Git branch, tag or commit. Defaults to the repository's default branch."
        ),
    ] = None,
):
    """Install or upgrade an extension in Gradio's Python environment.

    Requires Git and pip. Only install repositories you trust: their build and
    command code runs with your permissions. Installation reinstalls the package
    and its dependencies in the app environment, including when its version is unchanged.
    """
    url = _github_url(repo)
    if ref is not None and (
        not re.fullmatch(r"[A-Za-z0-9_][A-Za-z0-9_./-]*", ref) or ".." in ref
    ):
        raise typer.BadParameter("Invalid Git ref.", param_hint="--ref")
    requirement = f"git+{url}" + (f"@{ref}" if ref else "")
    typer.echo(f"Installing {requirement} with {sys.executable}")
    # GitHub-only projects may push new commits without bumping the package version.
    _pip("install", "--upgrade", "--force-reinstall", "--", requirement)
    entries = get_extensions()
    installed = []
    for entry in entries:
        if entry.dist is None:
            continue
        try:
            source = json.loads(entry.dist.read_text("direct_url.json") or "{}")
        except (ValueError, TypeError):
            continue
        if isinstance(source, dict) and source.get("url", "").lower() == url.lower():
            installed.append(entry)
    if not installed:
        typer.echo(
            "The repository was installed, but it did not register any gradio.commands "
            "entry points. Check the repository's pyproject.toml.",
            err=True,
        )
        raise typer.Exit(code=1)
    for entry in installed:
        if error := command_error(entry.name, entries):
            typer.echo(
                f"Installed {entry.name}, but it is unavailable: {error}", err=True
            )
        else:
            typer.echo(f"Available: gradio {entry.name}")
    if any(command_error(entry.name, entries) for entry in installed):
        raise typer.Exit(code=1)


@extensions_app.command()
def remove(
    package: Annotated[
        str, typer.Argument(help="Package name shown by `gradio extensions list`.")
    ],
):
    """Uninstall an extension package and all commands it provides. Keeps dependencies."""
    package_name = canonicalize_name(package)
    if package_name in {"gradio", "gradio-client"}:
        raise typer.BadParameter("Cannot remove Gradio itself as an extension.")
    for entry in get_extensions():
        if entry.dist and canonicalize_name(entry.dist.name) == package_name:
            _pip("uninstall", "--yes", "--", entry.dist.name)
            return
    raise typer.BadParameter(f"No installed extension package named {package!r}.")
