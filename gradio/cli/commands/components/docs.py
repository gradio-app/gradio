from __future__ import annotations

import importlib
import re
from pathlib import Path
from typing import Any

import click
import httpx2
import tomlkit as toml

from gradio.analytics import custom_component_analytics
from gradio.cli.commands.display import LivePanelDisplay

from ._docs_assets import css
from ._docs_utils import (
    RUFF_INSTALLED,
    extract_docstrings,
    get_deep,
    make_markdown,
    make_space,
)


def _docs(
    path: Path = Path("."),
    demo_dir: Path | None = None,
    demo_name: str | None = None,
    readme_path: Path | None = None,
    space_url: str | None = None,
    generate_space: bool = True,
    generate_readme: bool = True,
    suppress_demo_check: bool = False,
):
    """Runs the documentation generator."""
    custom_component_analytics(
        "docs",
        None,
        None,
        None,
        None,
    )

    _component_dir = Path(path).resolve()
    _demo_dir = Path(demo_dir).resolve() if demo_dir else Path("demo").resolve()
    _demo_name = demo_name if demo_name else "app.py"
    _demo_path = _demo_dir / _demo_name
    _readme_path = (
        Path(readme_path).resolve() if readme_path else _component_dir / "README.md"
    )

    if not generate_space and not generate_readme:
        raise ValueError("Must generate at least one of space or readme")

    with LivePanelDisplay() as live:
        live.update(
            f"📄 Generating documentation for {str(_component_dir.name)}",
            add_sleep=0.2,
        )
        live.update(
            f"👀 Reading project metadata from {_component_dir}/pyproject.toml\n"
        )

        if not (_component_dir / "pyproject.toml").exists():
            raise ValueError(f"Cannot find pyproject.toml file in {_component_dir}")

        with open(_component_dir / "pyproject.toml", encoding="utf-8") as f:
            data = toml.loads(f.read())

        name = get_deep(data, ["project", "name"])

        if not isinstance(name, str):
            raise ValueError("Name not found in pyproject.toml")

        if not RUFF_INSTALLED:
            live.update(
                "\n⚠ Ruff is not installed. Code snippets will not be formatted. To install, run `pip install ruff`."
            )

        run_command(
            live=live,
            name=name,
            suppress_demo_check=suppress_demo_check,
            pyproject_toml=data,
            generate_space=generate_space,
            generate_readme=generate_readme,
            type_mode="simple",
            _demo_path=_demo_path,
            _demo_dir=_demo_dir,
            _readme_path=_readme_path,
            space_url=space_url,
            _component_dir=_component_dir,
        )


def run_command(
    live: LivePanelDisplay,
    name: str,
    pyproject_toml: dict[str, Any],
    suppress_demo_check: bool,
    generate_space: bool,
    generate_readme: bool,
    type_mode: str,
    _demo_path: Path,
    _demo_dir: Path,
    _readme_path: Path,
    space_url: str | None,
    _component_dir: Path,
    simple: bool = False,
):
    with open(_demo_path, encoding="utf-8") as f:
        demo = f.read()

    pypi_exists = httpx2.get(f"https://pypi.org/pypi/{name}/json").status_code

    pypi_exists = pypi_exists == 200 or False

    local_version = get_deep(pyproject_toml, ["project", "version"])
    description = str(get_deep(pyproject_toml, ["project", "description"]) or "")
    repo = get_deep(pyproject_toml, ["project", "urls", "repository"])
    space = (
        space_url
        if space_url
        else get_deep(pyproject_toml, ["project", "urls", "space"])
    )

    if not local_version and not pypi_exists:
        raise ValueError(
            f"Cannot find version in pyproject.toml or on PyPI for {name}.\nIf you have just published to PyPI, please wait a few minutes and try again."
        )
    module = importlib.import_module(name)
    (docs, type_mode) = extract_docstrings(module)

    if generate_space:
        if not simple:
            live.update("💻 Generating space.")

        source = make_space(
            docs=docs,
            name=name,
            description=description,
            local_version=local_version
            if local_version is None
            else str(local_version),
            demo=demo,
            space=space if space is None else str(space),
            repo=repo if repo is None else str(repo),
            pypi_exists=pypi_exists,
            suppress_demo_check=suppress_demo_check,
        )

        with open(_demo_dir / "space.py", "w", encoding="utf-8") as f:
            f.write(source)
            if not simple:
                live.update(f"✅ Space created in {_demo_dir}/space.py\n")
        with open(_demo_dir / "css.css", "w", encoding="utf-8") as f:
            f.write(css)

    if generate_readme:
        if not simple:
            live.update("📝 Generating README.")
        readme = make_markdown(
            docs, name, description, local_version, demo, space, repo, pypi_exists
        )

        readme_content = Path(_readme_path).read_text()

        with open(_readme_path, "w", encoding="utf-8") as f:
            yaml_regex = re.search(
                "(?:^|[\r\n])---[\n\r]+([\\S\\s]*?)[\n\r]+---([\n\r]|$)", readme_content
            )
            if yaml_regex is not None:
                readme = readme_content[: yaml_regex.span()[-1]] + readme
            f.write(readme)
            if not simple:
                live.update(f"✅ README generated in {_readme_path}")
    if simple:
        short_readme_path = Path(_readme_path).relative_to(_component_dir)
        short_demo_path = Path(_demo_dir / "space.py").relative_to(_component_dir)
        live.update(
            f"✅ Documentation generated in {short_demo_path} and {short_readme_path}. Pass --no-generate-docs to disable auto documentation."
        )

    if type_mode == "simple":
        live.update(
            "\n🟠 The docs were generated in simple mode. Updating python to a more recent version will result in richer documentation."
        )


docs_command = click.Command(
    name="docs",
    callback=_docs,
    help="Generate documentation for a custom component. PATH is the directory of the custom component (default: the current directory).",
    params=[
        click.Argument(["path"], type=click.Path(path_type=Path), default=Path(".")),
        click.Option(
            ["--demo-dir"],
            type=click.Path(path_type=Path),
            help="Path to the demo directory.",
        ),
        click.Option(["--demo-name"], help="Name of the demo file."),
        click.Option(
            ["--readme-path"],
            type=click.Path(path_type=Path),
            help="Path to the README.md file.",
        ),
        click.Option(["--space-url"], help="URL of the Space to use for the demo."),
        click.Option(
            ["--generate-space/--no-generate-space"],
            default=True,
            show_default=True,
            help="Create a documentation space for the custom component.",
        ),
        click.Option(
            ["--generate-readme/--no-generate-readme"],
            default=True,
            show_default=True,
            help="Create a README.md file for the custom component.",
        ),
        click.Option(
            ["--suppress-demo-check/--no-suppress-demo-check"],
            default=False,
            show_default=True,
            help="Suppress demo warnings and errors.",
        ),
    ],
)
